import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript as YtPlus } from 'youtube-transcript-plus';

function extractVideoId(url: string): string {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const m = url.match(pattern);
    if (m) return m[1];
  }
  throw new Error('Could not extract video ID. Make sure it is a valid YouTube link.');
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

function parseTranscriptXml(xml: string): string[] {
  const texts: string[] = [];

  // srv3 format: <p t="ms" d="ms"><s ...>word</s>...</p>
  const pMatches = Array.from(xml.matchAll(/<p\s+t="\d+"[^>]*>([\s\S]*?)<\/p>/g));
  for (const m of pMatches) {
    const inner = m[1];
    let text = '';
    for (const s of Array.from(inner.matchAll(/<s[^>]*>([^<]*)<\/s>/g))) text += s[1];
    if (!text) text = inner.replace(/<[^>]+>/g, '');
    const decoded = decodeEntities(text).trim();
    if (decoded) texts.push(decoded);
  }
  if (texts.length > 10) return texts;

  // Classic format: <text start="s" dur="s">content</text>
  for (const m of Array.from(xml.matchAll(/<text[^>]*>([^<]*)<\/text>/g))) {
    const decoded = decodeEntities(m[1]).trim();
    if (decoded) texts.push(decoded);
  }
  return texts;
}

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const ANDROID_UA = 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)';

function parseCookies(setCookieHeader: string | null): string {
  if (!setCookieHeader) return '';
  return setCookieHeader
    .split(/,(?=\s*[^;=,\s][^;=]*=[^;]*)/)
    .map(c => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');
}

// ─── Strategy 1: Full browser mimic (watch page → player API → XML) ──────────
// Fetches the watch page first to get the Innertube API key, session cookies,
// and visitorData — then uses all three when calling the player API and fetching
// the transcript XML. Works from cloud IPs where cookieless requests are blocked.
async function viaBrowserMimic(videoId: string): Promise<string> {
  const watchHeaders = {
    'User-Agent': BROWSER_UA,
    'Accept-Language': 'en-US,en;q=0.9',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { headers: watchHeaders });
  if (!watchRes.ok) throw new Error(`watch page ${watchRes.status}`);

  const cookieStr = parseCookies(watchRes.headers.get('set-cookie'));
  const html = await watchRes.text();

  const apiKey = (html.match(/"INNERTUBE_API_KEY":"([^"]+)"/) ?? [])[1] ?? '';
  const visitorData = (html.match(/"visitorData":"([^"]+)"/) ?? [])[1] ?? '';

  const playerUrl = `https://www.youtube.com/youtubei/v1/player?key=${apiKey}&prettyPrint=false`;
  const playerRes = await fetch(playerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': ANDROID_UA,
      'X-Goog-Visitor-Id': visitorData,
      ...(cookieStr ? { Cookie: cookieStr } : {}),
    },
    body: JSON.stringify({
      context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
      videoId,
    }),
  });
  if (!playerRes.ok) throw new Error(`player API ${playerRes.status}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await playerRes.json() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tracks: any[] = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!Array.isArray(tracks) || !tracks.length) throw new Error('No caption tracks in player response');

  const track =
    tracks.find((t) => t.languageCode === 'en' && t.kind !== 'asr') ||
    tracks.find((t) => t.languageCode === 'en') ||
    tracks.find((t) => t.kind !== 'asr') ||
    tracks[0];

  const xmlRes = await fetch(track.baseUrl as string, {
    headers: {
      'User-Agent': BROWSER_UA,
      ...(cookieStr ? { Cookie: cookieStr } : {}),
    },
  });
  if (!xmlRes.ok) throw new Error(`caption XML ${xmlRes.status}`);
  const xml = await xmlRes.text();
  if (!xml || xml.length < 100) throw new Error('Caption XML empty');

  const texts = parseTranscriptXml(xml);
  if (texts.length < 5) throw new Error(`Only ${texts.length} segments`);
  return texts.join(' ');
}

// ─── Strategy 2: youtube-transcript-plus (Innertube with retry) ───────────────
async function viaYtPlus(videoId: string): Promise<string> {
  const segs = await YtPlus.fetchTranscript(videoId);
  if (!segs?.length || segs.length < 5) throw new Error(`Only ${segs?.length ?? 0} segments`);
  return segs.map(s => decodeEntities(s.text)).join(' ');
}

// ─── Strategy 3: Direct Innertube (no watch page) ─────────────────────────────
async function viaInnertube(videoId: string): Promise<string> {
  const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': ANDROID_UA },
    body: JSON.stringify({
      context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
      videoId,
    }),
  });
  if (!res.ok) throw new Error(`player ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tracks: any[] = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!Array.isArray(tracks) || !tracks.length) throw new Error('No caption tracks');

  const track =
    tracks.find((t) => t.languageCode === 'en' && t.kind !== 'asr') ||
    tracks.find((t) => t.languageCode === 'en') ||
    tracks.find((t) => t.kind !== 'asr') ||
    tracks[0];

  const xmlRes = await fetch(track.baseUrl as string, { headers: { 'User-Agent': ANDROID_UA } });
  if (!xmlRes.ok) throw new Error(`XML ${xmlRes.status}`);
  const xml = await xmlRes.text();
  if (!xml || xml.length < 100) throw new Error('XML empty');

  const texts = parseTranscriptXml(xml);
  if (texts.length < 5) throw new Error(`Only ${texts.length} segments`);
  return texts.join(' ');
}

// ─── Main orchestrator ────────────────────────────────────────────────────────
async function getTranscript(videoId: string): Promise<string> {
  const errors: string[] = [];

  for (const [name, fn] of [
    ['browser-mimic', () => viaBrowserMimic(videoId)],
    ['youtube-transcript-plus', () => viaYtPlus(videoId)],
    ['innertube-direct', () => viaInnertube(videoId)],
  ] as const) {
    try {
      const text = await fn();
      if (text && text.length > 50) return text;
      errors.push(`${name}: result too short`);
    } catch (e) {
      errors.push(`${name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  throw new Error(
    `Could not fetch transcript. The video may not have captions enabled.\n\nDetails: ${errors.join(' | ')}`
  );
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
