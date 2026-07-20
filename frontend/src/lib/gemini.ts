import { GoogleGenerativeAI, Part } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. AI features will not work.');
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const MODEL = 'gemini-3.1-flash-lite';

export function getGeminiModel() {
  if (!genAI) throw new Error('Gemini API key not configured. Add GEMINI_API_KEY to .env.local');
  return genAI.getGenerativeModel({ model: MODEL });
}

/**
 * Call Gemini with automatic retry + exponential backoff (text-only).
 */
export async function generateWithRetry(
  prompt: string,
  options: { maxRetries?: number } = {}
): Promise<string> {
  const { maxRetries = 3 } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);

      console.warn(`[Gemini] Attempt ${attempt + 1} failed (model: ${MODEL}):`, errMsg.slice(0, 120));

      if (attempt === maxRetries) {
        throw new Error(errMsg);
      }

      // Exponential backoff: 2s, 4s, 8s...
      const delay = Math.min(2000 * Math.pow(2, attempt), 15000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error('AI request failed after all retries.');
}

/**
 * Call Gemini with an image (multimodal) + automatic retry + exponential backoff.
 * @param prompt  Text prompt to send alongside the image.
 * @param imageBase64  Base-64 encoded image data (without the data-URI prefix).
 * @param mimeType  MIME type of the image, e.g. 'image/jpeg'.
 */
export async function generateWithImage(
  prompt: string,
  imageBase64: string,
  mimeType: string,
  options: { maxRetries?: number } = {}
): Promise<string> {
  const { maxRetries = 3 } = options;

  const imagePart: Part = {
    inlineData: { data: imageBase64, mimeType },
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = getGeminiModel();
      const result = await model.generateContent([prompt, imagePart]);
      return result.response.text();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);

      console.warn(`[Gemini/Vision] Attempt ${attempt + 1} failed (model: ${MODEL}):`, errMsg.slice(0, 120));

      if (attempt === maxRetries) {
        throw new Error(errMsg);
      }

      const delay = Math.min(2000 * Math.pow(2, attempt), 15000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error('AI image request failed after all retries.');
}
