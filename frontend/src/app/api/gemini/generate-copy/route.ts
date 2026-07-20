import { NextRequest, NextResponse } from 'next/server';
import { generateWithRetry } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { name, goal, platforms, tone, targetAudience, budget } = await req.json();

    if (!name) return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });

    const prompt = `You are a creative social media copywriter. Create 3 unique post variants for the following campaign.

Campaign Details:
- Name: ${name}
- Goal: ${goal}
- Platforms: ${platforms?.join(', ') || 'Instagram, Facebook'}
- Tone: ${tone || 'Professional'}
- Target Audience: ${targetAudience || 'General audience'}
- Budget: ${budget ? `$${budget}` : 'Not specified'}

Return ONLY valid JSON (no markdown), with this structure:
{
  "variants": [
    {
      "id": 1,
      "platform": "<platform name>",
      "caption": "<engaging caption>",
      "hashtags": ["<tag1>", "<tag2>", "<tag3>", "<tag4>", "<tag5>"],
      "cta": "<clear call-to-action>",
      "characterCount": <number>
    },
    { "id": 2, ... },
    { "id": 3, ... }
  ]
}`;

    const text = await generateWithRetry(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format from AI');

    const { variants } = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, variants });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to generate copy';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
