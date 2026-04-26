// Run on Vercel Edge (Cloudflare PoPs) instead of AWS Lambda.
// YouTube restricts caption data for AWS datacenter IPs — Edge IPs are different.
export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

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
const IOS_UA = 'com.google.ios.youtube/20.10.4 (iPhone14,3; U; CPU iOS 17_0 like Mac OS X)';

function parseCookies(setCookieHeader: string | null): string {
  if (!setCookieHeader) return '';
  return setCookieHeader
    .split(/,(?=\s*[^;=,\s][^;=]*=[^;]*)/)
    .map(c => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');
}

async function fetchPlayerData(videoId: string, clientName: string, clientVersion: string, ua: string, apiKey: string, visitorData: string, cookieStr: string) {
  const url = `https://www.youtube.com/youtubei/v1/player?key=${apiKey}&prettyPrint=false`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': ua,
      ...(visitorData ? { 'X-Goog-Visitor-Id': visitorData } : {}),
      ...(cookieStr ? { Cookie: cookieStr } : {}),
    },
    body: JSON.stringify({
      context: { client: { clientName, clientVersion, hl: 'en', gl: 'US' } },
      videoId,
    }),
  });
  if (!res.ok) throw new Error(`player ${res.status}`);
  return res.json();
}

// ─── Strategy 1: Browser mimic with ANDROID client ────────────────────────────
async function viaAndroid(videoId: string): Promise<string> {
  const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent': BROWSER_UA,
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      Cookie: 'SOCS=CAISAiAB; CONSENT=YES+cb',
    },
  });
  if (!watchRes.ok) throw new Error(`watch ${watchRes.status}`);
  const cookieStr = parseCookies(watchRes.headers.get('set-cookie'));
  const html = await watchRes.text();

  const apiKey = (html.match(/"INNERTUBE_API_KEY":"([^"]+)"/) ?? [])[1] ?? '';
  const visitorData = (html.match(/"visitorData":"([^"]+)"/) ?? [])[1] ?? '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await fetchPlayerData(videoId, 'ANDROID', '20.10.38', ANDROID_UA, apiKey, visitorData, cookieStr) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tracks: any[] = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!Array.isArray(tracks) || !tracks.length) throw new Error('No caption tracks (ANDROID)');

  const track = tracks.find(t => t.languageCode === 'en' && t.kind !== 'asr') || tracks.find(t => t.languageCode === 'en') || tracks[0];
  const xmlRes = await fetch(track.baseUrl as string, {
    headers: { 'User-Agent': BROWSER_UA, ...(cookieStr ? { Cookie: cookieStr } : {}) },
  });
  const xml = await xmlRes.text();
  if (!xml || xml.length < 100) throw new Error('XML empty (ANDROID)');
  const texts = parseTranscriptXml(xml);
  if (texts.length < 5) throw new Error(`Only ${texts.length} segments (ANDROID)`);
  return texts.join(' ');
}

// ─── Strategy 2: Same flow with IOS client ────────────────────────────────────
async function viaIos(videoId: string): Promise<string> {
  const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent': BROWSER_UA,
      'Accept-Language': 'en-US,en;q=0.9',
      Cookie: 'SOCS=CAISAiAB; CONSENT=YES+cb',
    },
  });
  if (!watchRes.ok) throw new Error(`watch ${watchRes.status}`);
  const cookieStr = parseCookies(watchRes.headers.get('set-cookie'));
  const html = await watchRes.text();
  const apiKey = (html.match(/"INNERTUBE_API_KEY":"([^"]+)"/) ?? [])[1] ?? '';
  const visitorData = (html.match(/"visitorData":"([^"]+)"/) ?? [])[1] ?? '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await fetchPlayerData(videoId, 'IOS', '20.10.4', IOS_UA, apiKey, visitorData, cookieStr) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tracks: any[] = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!Array.isArray(tracks) || !tracks.length) throw new Error('No caption tracks (IOS)');

  const track = tracks.find(t => t.languageCode === 'en' && t.kind !== 'asr') || tracks.find(t => t.languageCode === 'en') || tracks[0];
  const xmlRes = await fetch(track.baseUrl as string, {
    headers: { 'User-Agent': IOS_UA, ...(cookieStr ? { Cookie: cookieStr } : {}) },
  });
  const xml = await xmlRes.text();
  if (!xml || xml.length < 100) throw new Error('XML empty (IOS)');
  const texts = parseTranscriptXml(xml);
  if (texts.length < 5) throw new Error(`Only ${texts.length} segments (IOS)`);
  return texts.join(' ');
}

// ─── Strategy 3: Direct Innertube (no watch page) ─────────────────────────────
async function viaDirect(videoId: string): Promise<string> {
  const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': ANDROID_UA },
    body: JSON.stringify({
      context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38', hl: 'en', gl: 'US' } },
      videoId,
    }),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tracks: any[] = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!Array.isArray(tracks) || !tracks.length) throw new Error('No caption tracks (direct)');
  const track = tracks.find(t => t.languageCode === 'en' && t.kind !== 'asr') || tracks.find(t => t.languageCode === 'en') || tracks[0];
  const xmlRes = await fetch(track.baseUrl as string, { headers: { 'User-Agent': ANDROID_UA } });
  const xml = await xmlRes.text();
  if (!xml || xml.length < 100) throw new Error('XML empty (direct)');
  const texts = parseTranscriptXml(xml);
  if (texts.length < 5) throw new Error(`Only ${texts.length} segments (direct)`);
  return texts.join(' ');
}

async function getTranscript(videoId: string): Promise<string> {
  const errors: string[] = [];
  for (const [name, fn] of [
    ['android', () => viaAndroid(videoId)],
    ['ios', () => viaIos(videoId)],
    ['direct', () => viaDirect(videoId)],
  ] as const) {
    try {
      const text = await fn();
      if (text && text.length > 50) return text;
      errors.push(`${name}: too short`);
    } catch (e) {
      errors.push(`${name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(`Could not fetch transcript. The video may not have captions enabled.\n\nDetails: ${errors.join(' | ')}`);
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
