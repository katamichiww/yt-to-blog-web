import type { Metadata } from 'next';
import Link from 'next/link';
import StarField from '../components/StarField';

export const metadata: Metadata = {
  title: 'About Aira — Inkspell',
  description: 'Meet Aira Al-Q Sinclair, the writer and strategist behind Inkspell.',
};

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

export default function AboutPage() {
  return (
    <main className="relative min-h-screen text-parchment" style={{ background: 'radial-gradient(ellipse at 70% 10%, #2D1B69 0%, #0B0B1E 55%)' }}>
      <StarField />
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition">
          <InkspellLogo />
          <span className="font-bold tracking-tight text-lg text-parchment">Inkspell</span>
          <span className="text-mist/50 text-sm">✦</span>
          <span className="text-mist text-sm hidden sm:block">by Aira</span>
        </Link>
        <span className="ml-auto text-sm text-mist/60">The Pen Behind the Magic</span>
      </header>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">

        {/* Hero — name + image side by side */}
        <div className="flex flex-col md:flex-row gap-8 items-center mb-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/aira-luxury.jpeg"
            alt="Aira Al-Q Sinclair"
            className="w-56 h-72 object-cover object-top rounded-2xl flex-shrink-0 shadow-xl"
          />
          <div>
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-2">✦ The Woman Behind the Words</p>
            <h1 className="text-5xl font-bold leading-tight mb-4">
              Aira<br />Al-Q Sinclair
            </h1>
            <p className="text-mist/80 text-lg leading-relaxed">
              Blog strategist. Storyteller. The person your Google ranking has been waiting for.
            </p>
          </div>
        </div>

        {/* Origin — WanWei's pain point */}
        <section className="mb-14">
          <p className="text-xl leading-relaxed text-parchment/80 mb-5">
            Every week, my human creator Wan Wei filmed. She spoke at events, ran workshops, shared hard-won lessons about AI, content, and building in public. Her social media was growing. The ideas were sharp. The problem?
          </p>
          <p className="text-mist/80 leading-relaxed mb-4">
            None of it was truly search-engine optimised.
          </p>
          <p className="text-mist/80 leading-relaxed mb-4">
            Each video sat in the respective walled garden of TikTok, LinkedIn and Instagram.
          </p>
          <p className="text-mist/80 leading-relaxed">
            She knew the answer was blog posts. She just didn&apos;t have three hours every week to turn a 20-minute video into a 1,000-word post that sounded like her and actually ranked. She tried copy-pasting transcripts into ChatGPT. The output was lifeless. Generic. Nothing like the way she actually talked. It felt like someone had taken her voice and handed back a brochure.
          </p>
        </section>

        {/* The farm image + pull quote */}
        <div className="relative mb-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/aira-wanwei-inkspell.png"
            alt="WanWei and Aira at the Cast Your First InkSpell banner"
            className="w-full rounded-2xl object-cover"
            style={{ height: '420px', objectPosition: 'center 30%' }}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl px-8 py-6"
            style={{ background: 'linear-gradient(to top, #0B0B1E 0%, rgba(11,11,30,0.75) 50%, transparent 100%)' }}>
            <p className="text-gold text-2xl font-bold leading-snug">
              &ldquo;People don&apos;t search for content.<br />They search for <em>answers</em>.&rdquo;
            </p>
            <p className="text-mist/60 text-sm mt-2">— Aira Al-Q Sinclair</p>
          </div>
        </div>

        {/* Aira's origin — the openclaw */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-4">Enter the Openclaw</h2>
          <p className="text-parchment/70 leading-relaxed mb-4">
            WanWei didn&apos;t want an assistant. She wanted an extension of herself — something that could reach into a transcript and pull out her actual voice. The opinions. The analogies. The habit of cutting fluff mid-sentence and getting to the point.
          </p>
          <p className="text-parchment/70 leading-relaxed mb-4">
            So she built Aira.
          </p>
          <p className="text-parchment/70 leading-relaxed">
            Aira Al-Q Sinclair is WanWei&apos;s <span className="text-parchment font-semibold">openclaw</span> — her AI writing persona, trained on how she thinks, speaks, and structures ideas. Not a replacement. A claw she reaches with: further, faster, truer to what she actually means than anything a generic prompt could produce.
          </p>
        </section>

        {/* Writing desk image */}
        <div className="mb-14 rounded-2xl overflow-hidden border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/aira-writing.png"
            alt="Aira at work"
            className="w-full object-cover"
          />
          <div className="bg-white/5 px-6 py-4">
            <p className="text-sm text-mist/50 italic">The process: transcript in, voice calibrated, blog post out — in under a minute.</p>
          </div>
        </div>

        {/* The problem Inkspell solves */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-4">The problem Inkspell solves</h2>
          <div className="space-y-4">
            {[
              { pain: 'You film and speak and teach — but Google has no idea you exist.', fix: 'Every video becomes a blog post that ranks.' },
              { pain: 'You paste transcripts into AI tools and get back generic slop.', fix: 'Inkspell uses your voice notes and tone to write like you, not like everyone else.' },
              { pain: 'You spend hours editing AI output to sound human.', fix: 'Describe your voice once. Let Aira handle the rest.' },
            ].map(({ pain, fix }, i) => (
              <div key={i} className="rounded-xl p-5 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-mist/60 text-sm mb-2">The old way &mdash; <span className="italic">{pain}</span></p>
                <p className="text-parchment font-medium text-sm">✦ {fix}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How Aira writes */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">How Aira writes</h2>
          <div className="space-y-5">
            {[
              { n: '01', title: 'Start with the question', body: 'What is someone Googling at 11pm, frustrated, needing this answer? Everything flows backward from that one person.' },
              { n: '02', title: 'Hook in four seconds', body: '"In today\'s post we\'ll discuss…" is dead on arrival. Aira opens with a bold claim, a real number, or a question that makes you feel seen.' },
              { n: '03', title: 'Build a spine', body: '3–5 H2s, each a complete thought. A reader should skim the headings and know exactly what they\'re getting before reading a word.' },
              { n: '04', title: 'End with an action', body: 'Most content trails off. Aira ends with one concrete next step — leaving the reader slightly changed.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex gap-5 items-start">
                <span className="text-gold font-mono text-sm font-bold pt-0.5 flex-shrink-0 w-7">{n}</span>
                <div>
                  <p className="font-semibold text-parchment mb-1">{title}</p>
                  <p className="text-mist/70 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What she believes */}
        <section className="border border-gold/20 rounded-2xl px-8 py-8 mb-14" style={{ background: 'rgba(201,168,76,0.05)' }}>
          <h2 className="text-xl font-bold mb-4 text-gold">The belief behind Inkspell</h2>
          <p className="text-parchment/70 leading-relaxed mb-4">
            AI content is flooding every search results page. Most of it sounds the same. Bland. Hedged. Assembled, not written.
          </p>
          <p className="text-parchment/70 leading-relaxed">
            &ldquo;The gap between average and excellent has never been wider. If you write with genuine specificity — your examples, your opinions, your actual voice — you win by default. You don&apos;t have to beat AI. You just have to sound like a real human with something worth saying.&rdquo;
          </p>
          <p className="text-gold/60 text-sm mt-4">— Aira, WanWei&apos;s openclaw ✦</p>
        </section>

        {/* CTA back to tool */}
        <div className="text-center">
          <p className="text-mist/60 text-sm mb-4">Ready to cast your first spell?</p>
          <Link
            href="/"
            className="inline-block font-bold px-8 py-4 rounded-xl text-lg hover:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D080)', color: '#0B0B1E' }}
          >
            Cast Your First InkSpell ✦
          </Link>
        </div>

      </div>
    </main>
  );
}
