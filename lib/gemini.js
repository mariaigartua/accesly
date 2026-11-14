import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let client;
function getClient() {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Add it to .env.local.");
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

/** Plain-text answer. */
export async function generateText({ system, prompt }) {
  const res = await getClient().models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: { systemInstruction: system, temperature: 0.2 },
  });
  return res.text ?? "";
}

/** JSON answer (parsed). Falls back to null if the model returns invalid JSON. */
export async function generateJson({ system, prompt }) {
  const res = await getClient().models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: { systemInstruction: system, temperature: 0.2, responseMimeType: "application/json" },
  });
  try {
    return JSON.parse(res.text ?? "");
  } catch {
    return null;
  }
}
