import { NextRequest, NextResponse } from 'next/server';

function extractVideoId(url: string): string {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  throw new Error('Could not extract video ID. Make sure it is a valid YouTube link.');
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n/g, ' ');
}

// Strategy 1: YouTube InnerTube API — most reliable, no page scraping needed
async function fetchViaInnerTube(videoId: string): Promise<string> {
  const body = {
    context: {
      client: {
        clientName: 'WEB',
        clientVersion: '2.20240101.00.00',
        hl: 'en',
        gl: 'US',
      },
    },
    videoId,
  };

  const res = await fetch(
    'https://www.youtube.com/youtubei/v1/get_transcript?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) throw new Error(`InnerTube status ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const segments: any[] =
    data?.actions?.[0]?.updateEngagementPanelAction?.content
      ?.transcriptRenderer?.content?.transcriptSearchPanelRenderer
      ?.body?.transcriptSegmentListRenderer?.initialSegments ?? [];

  if (!segments.length) throw new Error('No transcript segments from InnerTube');

  return segments
    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) =>
        s?.transcriptSegmentRenderer?.snippet?.runs
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ?.map((r: any) => r.text)
          .join('') ?? ''
    )
    .filter(Boolean)
    .join(' ');
}

// Strategy 2: Scrape the watch page, find caption track URLs, fetch the XML
async function fetchViaPageScrape(videoId: string): Promise<string> {
  const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!watchRes.ok) throw new Error(`Watch page status ${watchRes.status}`);
  const html = await watchRes.text();

  // Try multiple JSON extraction patterns
  let captionTracks = null;

  // Pattern A: find "captionTracks" key directly
  const captionIdx = html.indexOf('"captionTracks":[');
  if (captionIdx !== -1) {
    const start = captionIdx + '"captionTracks":'.length;
    let depth = 0, end = -1;
    for (let i = start; i < html.length; i++) {
      if (html[i] === '[' || html[i] === '{') depth++;
      else if (html[i] === ']' || html[i] === '}') {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end !== -1) {
      try {
        captionTracks = JSON.parse(html.slice(start, end + 1));
      } catch { /* try next pattern */ }
    }
  }

  // Pattern B: find ytInitialPlayerResponse and walk to captionTracks
  if (!captionTracks) {
    const markers = ['ytInitialPlayerResponse=', 'ytInitialPlayerResponse ='];
    for (const marker of markers) {
      const idx = html.indexOf(marker);
      if (idx === -1) continue;
      const jsonStart = html.indexOf('{', idx);
      let depth = 0, jsonEnd = -1;
      for (let i = jsonStart; i < Math.min(jsonStart + 500000, html.length); i++) {
        if (html[i] === '{') depth++;
        else if (html[i] === '}') {
          depth--;
          if (depth === 0) { jsonEnd = i; break; }
        }
      }
      if (jsonEnd === -1) continue;
      try {
        const playerResponse = JSON.parse(html.slice(jsonStart, jsonEnd + 1));
        captionTracks =
          playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? null;
        if (captionTracks?.length) break;
      } catch { /* try next */ }
    }
  }

  if (!captionTracks || !captionTracks.length) {
    throw new Error('No caption tracks found on this video.');
  }

  // Pick best track: English manual → English ASR → any manual → first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const track: any =
    captionTracks.find((t: any) => t.languageCode === 'en' && t.kind !== 'asr') ||
    captionTracks.find((t: any) => t.languageCode === 'en') ||
    captionTracks.find((t: any) => t.kind !== 'asr') ||
    captionTracks[0];

  const xmlRes = await fetch(track.baseUrl as string);
  if (!xmlRes.ok) throw new Error(`Caption XML fetch failed (${xmlRes.status})`);
  const xml = await xmlRes.text();

  const texts = Array.from(xml.matchAll(/<text[^>]*>([^<]+)<\/text>/g))
    .map((m) => decodeHtmlEntities(m[1]).trim())
    .filter(Boolean);

  if (!texts.length) throw new Error('Caption file was empty.');
  return texts.join(' ');
}

async function getTranscript(videoId: string): Promise<string> {
  // Try InnerTube first, fall back to page scrape
  try {
    const text = await fetchViaInnerTube(videoId);
    if (text.length > 50) return text;
  } catch { /* fall through */ }

  return fetchViaPageScrape(videoId);
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

    const videoId = extractVideoId(url);

    const [oembedRes, transcript] = await Promise.all([
      fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`),
      getTranscript(videoId),
    ]);

    if (!oembedRes.ok) throw new Error(`Could not fetch video metadata (${oembedRes.status})`);
    const meta = await oembedRes.json() as { title: string; author_name: string; thumbnail_url: string };

    return NextResponse.json({
      title: meta.title,
      author: meta.author_name,
      thumbnailUrl: meta.thumbnail_url,
      transcript,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
