import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    return Response.json({ error: 'A valid Anthropic API key is required.' }, { status: 401 });
  }

  const { url, title, author, transcript } = await req.json();

  const client = new Anthropic({ apiKey });

  const today = new Date().toISOString().split('T')[0];

  const systemPrompt = `You are an expert SEO blog writer. Transform a YouTube video transcript into a polished, search-optimised blog post.

Tone:
- Conversational but credible
- Actionable — readers should leave knowing what to do next
- Clear and jargon-free
- 600–900 words (not counting frontmatter)

Output format: Return ONLY raw markdown. Start directly with the YAML frontmatter block. No code fences, no preamble, no commentary.

Frontmatter schema:
---
title: "Compelling, keyword-rich title (max 60 chars)"
date: ${today}
description: "One clear sentence, 150 chars max, SEO-friendly, includes primary keyword"
tags: ["tag1", "tag2", "tag3", "tag4"]
draft: false
---

After the frontmatter:
- Open with a hook (stat, question, or bold claim) — NOT a restatement of the title
- Use ## H2 headings to break up sections (3–5 sections)
- Use bullet points for lists of steps or tips
- Bold key terms or takeaways
- End with a concrete next step or CTA
- Naturally include the primary keyword 2–3 times in the body`;

  const userMessage = `Video title: ${title}
Channel: ${author}
URL: ${url}

Transcript:
${transcript.slice(0, 14000)}

Write the SEO blog post.`;

  try {
    const stream = await client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      thinking: { type: 'enabled', budget_tokens: 1024 },
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
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
