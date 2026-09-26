// Server-only helper for calling Google Gemini. Never import this in a "use client" file!
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";
const TIMEOUT_MS = 15000;

/**
 * Sends a system prompt + some data to Gemini and returns the parsed JSON answer.
 * Throws if there's no API key, the call fails, it takes longer than 15s, or the reply isn't JSON.
 */
export async function askGemini(systemPrompt: string, userData: unknown): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing in .env.local");

  const ai = new GoogleGenAI({ apiKey });

  // Cancel the request if it takes too long
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: JSON.stringify(userData),
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        abortSignal: controller.signal,
      },
    });
    return JSON.parse(response.text ?? "");
  } finally {
    clearTimeout(timer);
  }
}
