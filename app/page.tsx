'use client';

import { useState } from 'react';

type Step = 'idle' | 'transcribing' | 'transcribed' | 'generating' | 'done';

interface TranscriptData {
  title: string;
  author: string;
  thumbnailUrl: string;
  transcript: string;
}

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [url, setUrl] = useState('');
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
        body: JSON.stringify({ url: url.trim(), title: data.title, author: data.author, transcript: data.transcript }),
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
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);
    const filename = `${today}-${slug}.md`;
    const blob = new Blob([blogPost], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  const isLoading = step === 'transcribing' || step === 'generating';

  return (
    <main className="min-h-screen bg-forest text-offwhite">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5 flex items-center gap-3">
        <div className="w-8 h-8 bg-lime rounded-sm flex items-center justify-center">
          <span className="text-forest font-bold text-sm">YB</span>
        </div>
        <span className="font-semibold tracking-tight text-lg">YT to Blog</span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-14">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight leading-tight mb-3">
            Turn any YouTube video into an{' '}
            <span className="text-lime">SEO blog post</span>
          </h1>
          <p className="text-white/60 text-lg">
            Paste a URL with captions enabled. We&apos;ll pull the transcript and write a polished post in seconds.
          </p>
        </div>

        {/* API Key input */}
        <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-lime flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="text-sm font-semibold text-offwhite">Your Anthropic API Key</span>
            {keyValid && (
              <span className="ml-auto text-xs bg-lime/20 text-lime border border-lime/30 rounded-full px-2 py-0.5">Ready</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-offwhite placeholder-white/30 focus:outline-none focus:border-lime/60 focus:ring-1 focus:ring-lime/40 transition font-mono"
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="px-3 py-2.5 rounded-lg border border-white/20 hover:border-white/40 text-white/50 hover:text-white/80 transition text-xs"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="mt-2.5 text-xs text-white/35 leading-relaxed">
            Your key is sent over HTTPS directly to the Anthropic API and is never stored or logged by this app.{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime/60 hover:text-lime underline underline-offset-2"
            >
              Get a key →
            </a>
          </p>
        </div>

        {/* URL Input */}
        <div className="flex gap-3 mb-8">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleTranscribe()}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-offwhite placeholder-white/40 focus:outline-none focus:border-lime/60 focus:ring-1 focus:ring-lime/40 transition"
            disabled={isLoading}
          />
          <button
            onClick={handleTranscribe}
            disabled={!url.trim() || isLoading}
            className="bg-lime text-forest font-semibold px-6 py-3 rounded-lg hover:bg-lime/90 disabled:opacity-40 disabled:cursor-not-allowed transition whitespace-nowrap"
          >
            {step === 'transcribing' ? 'Fetching…' : 'Get Transcript'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-coral/20 border border-coral/40 text-coral rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Video meta */}
        {data && (
          <div className="mb-6 flex gap-4 items-start bg-white/5 border border-white/10 rounded-xl p-4">
            {data.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.thumbnailUrl} alt="" className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">{data.title}</p>
              <p className="text-sm text-white/50 mt-0.5">{data.author}</p>
              <p className="text-xs text-white/40 mt-1">{data.transcript.length.toLocaleString()} characters transcribed</p>
            </div>
          </div>
        )}

        {/* Transcript preview */}
        {data && step !== 'idle' && step !== 'transcribing' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Transcript Preview</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-h-48 overflow-y-auto text-sm text-white/70 leading-relaxed font-mono">
              {data.transcript.slice(0, 1200)}
              {data.transcript.length > 1200 && (
                <span className="text-white/30"> …({data.transcript.length.toLocaleString()} chars total)</span>
              )}
            </div>
          </div>
        )}

        {/* Generate button */}
        {(step === 'transcribed' || step === 'generating' || step === 'done') && (
          <div className="mb-8">
            {!keyValid && step !== 'generating' && (
              <p className="text-center text-coral/80 text-sm mb-3">Add your Anthropic API key above to generate</p>
            )}
            <button
              onClick={handleGenerate}
              disabled={step === 'generating' || !keyValid}
              className="w-full bg-lime text-forest font-bold py-4 rounded-xl text-lg hover:bg-lime/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {step === 'generating' ? 'Writing blog post…' : step === 'done' ? '↺ Regenerate' : '✦ Generate SEO Blog Post'}
            </button>
            {step === 'generating' && (
              <p className="text-center text-white/40 text-sm mt-2">Claude is thinking and writing — usually takes 20–40 seconds</p>
            )}
          </div>
        )}

        {/* Blog post output */}
        {(step === 'generating' || step === 'done') && blogPost && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Generated Blog Post</span>
              {step === 'done' && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-sm px-4 py-1.5 rounded-lg border border-white/20 hover:border-lime/50 hover:text-lime transition"
                  >
                    {copied ? 'Copied!' : 'Copy Markdown'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="text-sm px-4 py-1.5 rounded-lg bg-lime/20 border border-lime/40 text-lime hover:bg-lime/30 transition"
                  >
                    Download .md
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 max-h-[600px] overflow-y-auto">
              <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono leading-relaxed">{blogPost}</pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
