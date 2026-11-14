import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
// Optional backup model, used if the main one keeps failing (pick one listed in AI Studio).
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "";

let client;
function getClient() {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Add it to .env.local.");
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isRetryable = (e) => /\b(429|500|503)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand/i.test(String(e?.message ?? e));

// Tries the main model up to 3 times (0.5s, 1s, 2s backoff), then the fallback model once.
async function generate(config, contents) {
  const models = [GEMINI_MODEL, GEMINI_MODEL, GEMINI_MODEL, FALLBACK_MODEL].filter(Boolean);
  let lastError;
  for (let i = 0; i < models.length; i++) {
    try {
      const res = await getClient().models.generateContent({ model: models[i], contents, config });
      return res.text ?? "";
    } catch (e) {
      lastError = e;
      if (!isRetryable(e)) throw e;
      if (i < models.length - 1) await sleep(500 * 2 ** i);
    }
  }
  throw lastError;
}

/** Plain-text answer. */
export async function generateText({ system, prompt }) {
  return generate({ systemInstruction: system, temperature: 0.2 }, prompt);
}

/** JSON answer (parsed). Returns null if the model returns invalid JSON. */
export async function generateJson({ system, prompt }) {
  const text = await generate(
    { systemInstruction: system, temperature: 0.2, responseMimeType: "application/json" },
    prompt
  );
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}