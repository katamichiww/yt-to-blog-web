import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Aira — YT to Blog',
  description: 'Meet Aira Al-Q Sinclair, the writer behind YT to Blog.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-forest text-offwhite">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="w-8 h-8 bg-lime rounded-sm flex items-center justify-center">
            <span className="text-forest font-bold text-sm">YB</span>
          </div>
          <span className="font-semibold tracking-tight text-lg">YT to Blog</span>
        </Link>
        <span className="ml-auto text-sm text-white/40">Meet Aira</span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Hero — name + image side by side */}
        <div className="flex flex-col md:flex-row gap-8 items-center mb-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/aira-1.png"
            alt="Aira Al-Q Sinclair"
            className="w-56 h-72 object-cover object-top rounded-2xl flex-shrink-0 shadow-xl"
          />
          <div>
            <p className="text-lime text-sm font-semibold uppercase tracking-widest mb-2">The Woman Behind the Words</p>
            <h1 className="text-5xl font-bold leading-tight mb-4">
              Aira<br />Al-Q Sinclair
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              Blog strategist. Storyteller. The person your Google ranking has been waiting for.
            </p>
          </div>
        </div>

        {/* Origin story */}
        <section className="mb-14">
          <p className="text-xl leading-relaxed text-white/80 mb-5">
            She didn&apos;t start out writing blogs. She started out translating — between her Singaporean mother, her British-Qatari father, and three countries she called home before she turned twenty.
          </p>
          <p className="text-white/60 leading-relaxed">
            That early life between cultures taught her one thing: the words you choose either open doors or close them. By seventeen she was ghostwriting for classmates. By twenty-five, she had a quiet waiting list of founders and CMOs who found her without a single cold pitch.
          </p>
        </section>

        {/* The farm image + pull quote */}
        <div className="relative mb-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/aira-2.jpeg"
            alt="Aira at the strawberry farm"
            className="w-full h-80 object-cover object-top rounded-2xl"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-forest via-forest/80 to-transparent rounded-b-2xl px-8 py-6">
            <p className="text-lime text-2xl font-bold leading-snug">
              &ldquo;People don&apos;t search for content.<br />They search for <em>answers</em>.&rdquo;
            </p>
          </div>
        </div>

        {/* The revelation */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-4">The day it clicked</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            It happened on a weekend at a strawberry farm. Aira voice-noted her observations as she walked the rows — the soil, the weight of the basket, the particular satisfaction of finding a ripe one hidden under a leaf.
          </p>
          <p className="text-white/70 leading-relaxed">
            That night she typed it up. Forgot about it. Six months later, the post was ranking on page one for three keywords she&apos;d never tried to target. A farm two countries away reached out asking her to write for them.
            <span className="text-offwhite font-medium"> That&apos;s when she understood: specificity is the SEO strategy nobody talks about.</span>
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
            <p className="text-sm text-white/40 italic">Aira at work — she reads every draft aloud. If she stumbles, the sentence gets rewritten.</p>
          </div>
        </div>

        {/* How she writes */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">How Aira writes a blog post</h2>
          <div className="space-y-5">
            {[
              { n: '01', title: 'Start with the question', body: 'Before a word is written — what is the reader Googling at 11pm, frustrated, needing help? Everything flows backward from that.' },
              { n: '02', title: 'Open with a hook', body: 'Four seconds. Maybe three. "In today\'s post we\'ll discuss…" is a death sentence. A surprising fact, a confession, or a question that makes the reader feel seen — that\'s the opener.' },
              { n: '03', title: 'Build a spine', body: 'Three to five H2s, each a complete thought. A reader should skim the headings and know exactly what they\'re getting. If they can\'t, rewrite the headings.' },
              { n: '04', title: 'End hard', body: 'Most writers trail off. Aira ends with one action, one next step. The post should leave the reader slightly changed.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex gap-5 items-start">
                <span className="text-lime font-mono text-sm font-bold pt-0.5 flex-shrink-0 w-7">{n}</span>
                <div>
                  <p className="font-semibold text-offwhite mb-1">{title}</p>
                  <p className="text-white/60 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What she believes */}
        <section className="bg-white/5 border border-lime/20 rounded-2xl px-8 py-8 mb-14">
          <h2 className="text-xl font-bold mb-4 text-lime">What she actually believes</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            In a world drowning in AI-generated content, Aira is oddly optimistic.
          </p>
          <p className="text-white/70 leading-relaxed">
            &ldquo;The average is getting worse. The gap between average and excellent is the biggest it&apos;s ever been. Write with genuine specificity — real examples, real opinions, real voice — and you stand out effortlessly. You don&apos;t have to be better than AI. You have to be <em>you</em>.&rdquo;
          </p>
        </section>

        {/* CTA back to tool */}
        <div className="text-center">
          <p className="text-white/50 text-sm mb-4">This tool is built on everything Aira believes about blog writing.</p>
          <Link
            href="/"
            className="inline-block bg-lime text-forest font-bold px-8 py-4 rounded-xl text-lg hover:bg-lime/90 transition"
          >
            Try YT to Blog →
          </Link>
        </div>

      </div>
    </main>
  );
}
