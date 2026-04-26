'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 'idle' | 'transcribing' | 'transcribed' | 'generating' | 'done';

interface TranscriptData {
  title: string;
  author: string;
  thumbnailUrl: string;
  transcript: string;
}

function InkspellLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 3 L15.5 10 L22 8 L17 13 L24 16 L17 17 L19 24 L14 19 L9 24 L11 17 L4 16 L11 13 L6 8 L12.5 10 Z"
        fill="#C9A84C" opacity="0.9"/>
      <circle cx="14" cy="14" r="2.5" fill="#0B0B1E"/>
      <circle cx="14" cy="14" r="1" fill="#C9A84C"/>
    </svg>
  );
}

const TONE_OPTIONS = [
  { id: 'casual', label: 'Casual', hint: 'like chatting with a friend' },
  { id: 'professional', label: 'Professional', hint: 'credible but warm' },
  { id: 'bold', label: 'Bold', hint: 'opinionated, direct' },
  { id: 'storytelling', label: 'Storytelling', hint: 'narrative, immersive' },
];

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('casual');
  const [voiceNotes, setVoiceNotes] = useState('');
  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState('');
  const [data, setData] = useState<TranscriptData | null>(null);
  const [blogPost, setBlogPost] = useState('');
  const [copied, setCopied] = useState(false);

  const keyValid = apiKey.trim().startsWith('sk-ant-');

  async function handleTranscribe() {
    if (!url.trim()) return;
    setError('');
    setStep('transcribing');
    setData(null);
    setBlogPost('');
    try {
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Transcript fetch failed');
      setData(json);
      setStep('transcribed');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setStep('idle');
    }
  }

  async function handleGenerate() {
    if (!data || !keyValid) return;
    setError('');
    setStep('generating');
    setBlogPost('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
        },
        body: JSON.stringify({
          url: url.trim(),
          title: data.title,
          author: data.author,
          transcript: data.transcript,
          keywords: keywords.trim(),
          tone,
          voiceNotes: voiceNotes.trim(),
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Generation failed');
      }
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setBlogPost(full);
        }
      }
      setStep('done');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setStep('transcribed');
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(blogPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const today = new Date().toISOString().split('T')[0];
    const slug = (data?.title ?? 'blog-post')
      .toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);
    const blob = new Blob([blogPost], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${today}-${slug}.md`;
    a.click();
  }

  const isLoading = step === 'transcribing' || step === 'generating';

  return (
    <main className="min-h-screen text-parchment" style={{ background: 'radial-gradient(ellipse at 30% 10%, #2D1B69 0%, #0B0B1E 55%)' }}>

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <InkspellLogo />
          <span className="font-bold tracking-tight text-lg text-parchment">Inkspell</span>
          <span className="text-mist/50 text-sm">✦</span>
          <span className="text-mist text-sm hidden sm:block">by Aira</span>
        </div>
        <Link href="/about" className="ml-auto text-sm text-mist hover:text-gold transition">
          Meet Aira →
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-gold/20 rounded-full px-4 py-1.5 text-xs text-gold/80 mb-5 tracking-wide">
            ✦ Your words. Your voice. Transformed.
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
            Turn any YouTube video into<br />
            <span className="text-gold">a post that sounds like <em>you</em></span>
          </h1>
          <p className="text-mist text-lg max-w-xl mx-auto">
            Paste a URL with captions. Describe your voice. Aira&apos;s pen does the rest.
          </p>
        </div>

        {/* ── Step 1: API Key ── */}
        <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="text-sm font-semibold">Anthropic API Key</span>
            {keyValid && (
              <span className="ml-auto text-xs bg-gold/20 text-gold border border-gold/30 rounded-full px-2 py-0.5">Ready ✦</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-parchment placeholder-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition font-mono"
            />
            <button onClick={() => setShowKey(v => !v)}
              className="px-3 py-2.5 rounded-xl border border-white/20 hover:border-white/40 text-white/50 hover:text-white/80 transition text-xs">
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="mt-2 text-xs text-white/30 leading-relaxed">
            Sent over HTTPS directly to Anthropic. Never stored.{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
              className="text-gold/60 hover:text-gold underline underline-offset-2">Get a key →</a>
          </p>
        </div>

        {/* ── Step 2: YouTube URL ── */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-parchment/70 mb-2">YouTube URL</label>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleTranscribe()}
              placeholder="https://youtube.com/watch?v=... (captions required)"
              className="flex-1 bg-white/8 border border-white/20 rounded-xl px-4 py-3 text-parchment placeholder-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition"
              disabled={isLoading}
              style={{ background: 'rgba(255,255,255,0.06)' }}
            />
            <button onClick={handleTranscribe} disabled={!url.trim() || isLoading}
              className="bg-gold text-midnight font-semibold px-6 py-3 rounded-xl hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition whitespace-nowrap">
              {step === 'transcribing' ? 'Fetching…' : 'Get Transcript'}
            </button>
          </div>
        </div>

        {/* ── Step 3: Voice Settings (always visible) ── */}
        <div className="mb-6 bg-white/5 border border-gold/10 rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-gold">✦</span>
            <span className="text-sm font-semibold text-parchment">Your Writing Voice</span>
            <span className="text-xs text-mist/60 ml-1">— the more you share, the more it sounds like you</span>
          </div>

          {/* Tone picker */}
          <div>
            <label className="block text-xs font-semibold text-parchment/50 uppercase tracking-wider mb-2.5">Overall Tone</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TONE_OPTIONS.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)}
                  className="px-3 py-2.5 rounded-xl border text-left transition-all"
                  style={{
                    borderColor: tone === t.id ? '#C9A84C' : 'rgba(255,255,255,0.12)',
                    background: tone === t.id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                  }}>
                  <span className="block text-sm font-semibold" style={{ color: tone === t.id ? '#C9A84C' : '#F5EFE0' }}>{t.label}</span>
                  <span className="block text-xs text-mist/60 mt-0.5">{t.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Free-form voice notes */}
          <div>
            <label className="block text-xs font-semibold text-parchment/50 uppercase tracking-wider mb-2">
              Describe Your Voice <span className="text-mist/40 font-normal normal-case">(optional but powerful)</span>
            </label>
            <textarea
              value={voiceNotes}
              onChange={(e) => setVoiceNotes(e.target.value)}
              rows={4}
              placeholder={`e.g. I write like I'm texting a smart friend — short sentences, no fluff. I use "here's the thing" and "let's be real" a lot. I reference real examples over abstract theory. I'm not afraid to have opinions. Avoid corporate-speak like "leverage" or "synergy".`}
              className="w-full rounded-xl px-4 py-3 text-sm text-parchment placeholder-white/25 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition resize-none leading-relaxed"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
              disabled={isLoading}
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-semibold text-parchment/50 uppercase tracking-wider mb-2">
              Keywords to Optimise For <span className="text-mist/40 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. Claude Code, AI productivity, prompt engineering"
              className="w-full rounded-xl px-4 py-2.5 text-sm text-parchment placeholder-white/25 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
              disabled={isLoading}
            />
            <p className="mt-1.5 text-xs text-white/25">Comma-separated. Woven in naturally — no keyword stuffing.</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-coral/15 border border-coral/30 text-coral rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Video meta */}
        {data && (
          <div className="mb-6 flex gap-4 items-start rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {data.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.thumbnailUrl} alt="" className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate text-parchment">{data.title}</p>
              <p className="text-sm text-mist mt-0.5">{data.author}</p>
              <p className="text-xs text-white/35 mt-1">{data.transcript.length.toLocaleString()} characters transcribed ✦</p>
            </div>
          </div>
        )}

        {/* Transcript preview */}
        {data && step !== 'idle' && step !== 'transcribing' && (
          <div className="mb-6">
            <span className="text-xs font-semibold text-parchment/40 uppercase tracking-wider block mb-2">Transcript Preview</span>
            <div className="rounded-2xl p-4 max-h-40 overflow-y-auto text-sm text-white/60 leading-relaxed font-mono"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {data.transcript.slice(0, 1200)}
              {data.transcript.length > 1200 && (
                <span className="text-white/25"> …({data.transcript.length.toLocaleString()} chars total)</span>
              )}
            </div>
          </div>
        )}

        {/* Generate button */}
        {(step === 'transcribed' || step === 'generating' || step === 'done') && (
          <div className="mb-8">
            {!keyValid && step !== 'generating' && (
              <p className="text-center text-coral/70 text-sm mb-3">Add your Anthropic API key to cast the spell</p>
            )}
            <button onClick={handleGenerate} disabled={step === 'generating' || !keyValid}
              className="w-full font-bold py-4 rounded-2xl text-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: step === 'generating' || !keyValid ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #C9A84C, #E8D080)',
                color: '#0B0B1E',
              }}>
              {step === 'generating' ? '✦ Casting the spell…' : step === 'done' ? '✦ Cast Again' : '✦ Cast Inkspell'}
            </button>
            {step === 'generating' && (
              <p className="text-center text-mist/50 text-sm mt-2">Aira is writing — usually 20–40 seconds</p>
            )}
          </div>
        )}

        {/* Blog post output */}
        {(step === 'generating' || step === 'done') && blogPost && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-parchment/40 uppercase tracking-wider">✦ Your Blog Post</span>
              {step === 'done' && (
                <div className="flex gap-2">
                  <button onClick={handleCopy}
                    className="text-sm px-4 py-1.5 rounded-xl border border-white/15 hover:border-gold/40 hover:text-gold transition">
                    {copied ? 'Copied!' : 'Copy Markdown'}
                  </button>
                  <button onClick={handleDownload}
                    className="text-sm px-4 py-1.5 rounded-xl border border-gold/30 text-gold hover:bg-gold/10 transition">
                    Download .md
                  </button>
                </div>
              )}
            </div>
            <div className="rounded-2xl p-5 max-h-[600px] overflow-y-auto"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <pre className="text-sm text-parchment/80 whitespace-pre-wrap font-mono leading-relaxed">{blogPost}</pre>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
