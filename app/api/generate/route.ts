import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    return Response.json({ error: 'A valid Anthropic API key is required.' }, { status: 401 });
  }

  const { url, title, author, transcript, keywords, tone, sentenceStyle, loves, avoids, writingSample } = await req.json();

  const client = new Anthropic({ apiKey });

  const today = new Date().toISOString().split('T')[0];

  const toneInstructions: Record<string, string> = {
    casual: 'Write like talking to a smart friend — relaxed, warm, everyday language. No fluff.',
    professional: 'Credible and polished, but never stiff. Authoritative without being distant.',
    bold: 'Direct, opinionated, confident. State your position clearly. No hedging or wishy-washy qualifiers.',
    storytelling: 'Narrative and immersive. Use scenes, tension, and vivid specifics. Pull the reader into a moment.',
  };

  const styleInstructions: Record<string, string> = {
    punchy: 'Use short, tight sentences. Lots of white space. One idea per sentence.',
    flowing: 'Use longer, layered sentences with rhythm. Descriptive and rich.',
    mixed: 'Vary sentence length naturally — short for impact, longer for flow.',
  };

  const voiceParts: string[] = [];
  if (sentenceStyle) voiceParts.push(`Sentence style: ${styleInstructions[sentenceStyle] || ''}`);
  if (loves?.length) voiceParts.push(`The writer loves to: ${(loves as string[]).join(', ')}.`);
  if (avoids?.length) voiceParts.push(`Never do any of these: ${(avoids as string[]).join(', ')}.`);

  const voiceSection = voiceParts.length
    ? `\n\nWriter's voice profile:\n${voiceParts.join('\n')}`
    : '';

  const sampleSection = writingSample?.trim()
    ? `\n\nWriting sample from this author — study and mirror their rhythm, vocabulary, and phrasing:\n"""\n${writingSample.slice(0, 2000)}\n"""`
    : '';

  const keywordSection = keywords?.trim()
    ? `\n\nTarget keywords to weave in naturally (no stuffing): ${keywords}. Use in title, description, and 2–3 times in the body where relevant.`
    : '';

  const systemPrompt = `You are ghostwriting a blog post on behalf of the creator. Your job is to make it sound EXACTLY like them — not like a generic AI blog post.

Tone style: ${toneInstructions[tone] || toneInstructions.casual}

Blog post requirements:
- 1,000–1,200 words (not counting frontmatter)
- Open with a hook — a bold claim, surprising stat, or question that makes the reader lean in. NOT a restatement of the title.
- 3–5 ## H2 sections, each a complete thought
- Bullet points for lists of steps or tips
- Bold key terms or takeaways
- End with one concrete next step or call to action
- Sound human and specific — real examples over vague generalities${voiceSection}${sampleSection}${keywordSection}

Output format: Return ONLY raw markdown. Start directly with the YAML frontmatter. No code fences, no preamble.

---
title: "Compelling, keyword-rich title (max 60 chars)"
date: ${today}
description: "One clear sentence, 150 chars max, SEO-friendly"
tags: ["tag1", "tag2", "tag3", "tag4"]
draft: false
---`;

  const userMessage = `Video title: ${title}
Channel: ${author}
URL: ${url}

Transcript:
${transcript.slice(0, 14000)}

Write the blog post in the creator's voice.`;

  try {
    const stream = await client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Generation failed';
    const isAuthError = msg.includes('401') || msg.includes('authentication') || msg.includes('API key');
    return Response.json(
      { error: isAuthError ? 'Invalid API key. Check your key at console.anthropic.com.' : msg },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
