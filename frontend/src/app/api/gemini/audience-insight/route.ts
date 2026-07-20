import { NextRequest, NextResponse } from 'next/server';
import { generateWithRetry } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { audienceData } = await req.json();

    const prompt = `You are a social media marketing strategist. Based on the following audience data, provide ONE concise, actionable insight (2-3 sentences max) about what this brand should do to grow their reach and engagement. Be specific and practical.

Audience Data:
${JSON.stringify(audienceData, null, 2)}

Respond with ONLY the insight text, no JSON, no headers.`;

    const insight = await generateWithRetry(prompt);
    return NextResponse.json({ success: true, insight: insight.trim() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to generate insight';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
