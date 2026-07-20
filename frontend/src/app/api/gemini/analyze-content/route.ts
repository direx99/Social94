import { NextRequest, NextResponse } from 'next/server';
import { generateWithRetry, generateWithImage } from '@/lib/gemini';

const ANALYSIS_SCHEMA = `{
  "score": <number 0-100>,
  "sentiment": "<positive|neutral|negative>",
  "sentimentScore": <number -1 to 1>,
  "readability": <number 0-100>,
  "engagement": <number 0-100>,
  "hashtags": [<array of 5-8 relevant hashtag strings without #>],
  "emojis": [<array of 3-5 relevant emoji strings>],
  "bestTime": "<best posting time e.g. 'Tuesday 6-8 PM'>",
  "improvements": [<array of 3-5 specific improvement suggestion strings>],
  "strengths": [<array of 2-3 strength strings>],
  "wordCount": <number>,
  "characterCount": <number>,
  "imageAnalysis": "<brief description of image content and its relevance to the post, or null if no image>"
}`;

function buildTextPrompt(content: string, platforms: string[], hasImage: boolean): string {
  const base = `You are a social media marketing expert. Analyze the following post${hasImage ? ' and its attached image' : ''} for ${platforms.join(', ') || 'social media'}.

Post Content:
"${content}"
${hasImage ? '\nAn image has been provided — evaluate how well it complements the text, note any text visible in the image, and factor image quality/appeal into the overall score.' : ''}

Provide a detailed JSON analysis with the following structure (return ONLY valid JSON, no markdown):
${ANALYSIS_SCHEMA}`;
  return base;
}

function buildImagePrompt(platforms: string[]): string {
  return `You are a social media marketing expert. Analyze the provided image for use on ${platforms.join(', ') || 'social media'}. There is no caption text — evaluate the image itself (visual appeal, clarity, brand suitability, any visible text) and generate an appropriate caption, hashtags, and quality scores.

Provide a detailed JSON analysis with the following structure (return ONLY valid JSON, no markdown):
${ANALYSIS_SCHEMA}`;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? '';

    let content = '';
    let platforms: string[] = [];
    let imageBase64: string | null = null;
    let mimeType = 'image/jpeg';

    // ── multipart/form-data (image upload) ──────────────────────────────────
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      content = (form.get('content') as string) ?? '';
      const rawPlatforms = form.get('platforms') as string;
      platforms = rawPlatforms ? JSON.parse(rawPlatforms) : [];

      const file = form.get('image') as File | null;
      if (file) {
        mimeType = file.type || 'image/jpeg';
        const arrayBuffer = await file.arrayBuffer();
        imageBase64 = Buffer.from(arrayBuffer).toString('base64');
      }
    } else {
      // ── application/json (text-only, backward-compatible) ─────────────────
      const body = await req.json();
      content = body.content ?? '';
      platforms = body.platforms ?? [];
    }

    const hasContent = content.trim().length > 0;
    const hasImage = !!imageBase64;

    if (!hasContent && !hasImage) {
      return NextResponse.json({ error: 'Content or image is required' }, { status: 400 });
    }

    let text: string;

    if (hasImage) {
      const prompt = hasContent
        ? buildTextPrompt(content, platforms, true)
        : buildImagePrompt(platforms);
      text = await generateWithImage(prompt, imageBase64!, mimeType);
    } else {
      text = await generateWithRetry(buildTextPrompt(content, platforms, false));
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format from AI');

    const analysis = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, analysis });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to analyze content';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
