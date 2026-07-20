import { NextRequest, NextResponse } from 'next/server';
import { generateWithRetry } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { title, platform, context } = await req.json();

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const prompt = `You are a social media copywriter. Write a compelling, engaging reminder/announcement message for ${platform || 'social media'}.

Title/Topic: "${title}"
${context ? `Additional context: "${context}"` : ''}

Requirements:
- 1–3 sentences, punchy and engaging
- Include 1-2 relevant emojis
- Platform-appropriate tone for ${platform || 'social media'}
- Ends with a soft call-to-action

Respond with ONLY the message text. No quotes, no explanation.`;

    const message = await generateWithRetry(prompt);
    return NextResponse.json({ success: true, message: message.trim() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to generate reminder';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
