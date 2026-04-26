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

async function fetchTranscriptFromPage(videoId: string): Promise<string> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!res.ok) throw new Error(`Could not load video page (${res.status})`);
  const html = await res.text();

  // Extract ytInitialPlayerResponse from the page
  const startIdx = html.indexOf('ytInitialPlayerResponse = ');
  if (startIdx === -1) throw new Error('Could not parse video page — YouTube may have changed its format.');
  // Find the matching closing brace by counting depth
  let depth = 0, jsonStart = html.indexOf('{', startIdx), jsonEnd = -1;
  for (let i = jsonStart; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}') { depth--; if (depth === 0) { jsonEnd = i; break; } }
  }
  if (jsonEnd === -1) throw new Error('Could not parse video player data.');
  const rawJson = html.slice(jsonStart, jsonEnd + 1);

  let playerResponse: Record<string, unknown>;
  try {
    playerResponse = JSON.parse(rawJson);
  } catch {
    throw new Error('Could not parse video player data.');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const captionTracks: any[] =
    (playerResponse as any)?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

  if (!captionTracks.length) {
    throw new Error('No subtitles found on this video. Please use a video with captions or auto-generated subtitles.');
  }

  // Pick best track: English manual > English auto-generated > any manual > first available
  const track =
    captionTracks.find((t) => t.languageCode === 'en' && t.kind !== 'asr') ||
    captionTracks.find((t) => t.languageCode === 'en') ||
    captionTracks.find((t) => t.kind !== 'asr') ||
    captionTracks[0];

  const xmlRes = await fetch(track.baseUrl as string);
  if (!xmlRes.ok) throw new Error('Could not fetch subtitle file.');
  const xml = await xmlRes.text();

  const texts = Array.from(xml.matchAll(/<text[^>]*>([^<]*)<\/text>/g))
    .map((m) => decodeHtmlEntities(m[1]).trim())
    .filter(Boolean);

  if (!texts.length) throw new Error('Subtitle file was empty.');
  return texts.join(' ');
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

    const videoId = extractVideoId(url);

    const [oembedRes, transcript] = await Promise.all([
      fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`),
      fetchTranscriptFromPage(videoId),
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
