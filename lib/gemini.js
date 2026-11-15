import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
// Optional backup model, used if the main one keeps failing (pick one listed in AI Studio).
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "";

let client;
function getClient() {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Add it to .env.local.");
  client ??= new GoogleGenAI({ apiKey, httpOptions: { timeout: 30_000 } });
  return client;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isRetryable = (e) => /\b(429|500|503)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand|timed? ?out|abort/i.test(String(e?.message ?? e));

// Tries the main model up to 3 times (0.5s, 1s, 2s backoff), then the fallback model once.
// Returns the full response (text + metadata such as grounding sources).
// `tries` = attempts on the main model before the fallback (slow calls use fewer).
async function generateResponse(config, contents, { tries = 3 } = {}) {
  const models = [...Array(tries).fill(GEMINI_MODEL), FALLBACK_MODEL].filter(Boolean);
  let lastError;
  for (let i = 0; i < models.length; i++) {
    try {
      return await getClient().models.generateContent({ model: models[i], contents, config });
    } catch (e) {
      lastError = e;
      if (!isRetryable(e)) throw e;
      if (i < models.length - 1) await sleep(500 * 2 ** i);
    }
  }
  throw lastError;
}

async function generate(config, contents) {
  const res = await generateResponse(config, contents);
  return res.text ?? "";
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

/**
 * Answer grounded with Google Search. Returns { text, sources: [{ title, url }], searchSuggestionsHtml }.
 * searchSuggestionsHtml is Google's "Search Suggestions" widget, which the Gemini API terms
 * require us to display whenever grounding is used.
 */
export async function generateGrounded({ system, prompt }) {
  const res = await generateResponse({ systemInstruction: system, temperature: 0.2, tools: [{ googleSearch: {} }] }, prompt);
  const meta = res.candidates?.[0]?.groundingMetadata ?? {};
  const seen = new Set();
  const sources = (meta.groundingChunks ?? [])
    .map((c) => c.web)
    .filter((w) => w?.uri && !seen.has(w.uri) && seen.add(w.uri))
    .map((w) => ({ title: w.title || new URL(w.uri).hostname, url: w.uri }));
  return { text: res.text ?? "", sources, searchSuggestionsHtml: meta.searchEntryPoint?.renderedContent ?? "" };
}

// When Google Search grounding hits its quota, skip it for a while instead of waiting on
// retries for every question (in-memory, per server process).
let searchBlockedUntil = 0;
export const searchAvailable = () => Date.now() > searchBlockedUntil;
export function markSearchUnavailable(e, ms = 60 * 60 * 1000) {
  if (/\b429\b|RESOURCE_EXHAUSTED|quota/i.test(String(e?.message ?? e))) searchBlockedUntil = Date.now() + ms;
}

/**
 * Answer that may read the given web pages with Gemini's URL context tool.
 * Returns { text, readUrls } — readUrls = the pages that were actually retrieved.
 */
export async function generateWithUrls({ system, prompt }) {
  // Reading pages is slow, so allow 60s instead of the default 30s.
  const res = await generateResponse(
    { systemInstruction: system, temperature: 0.2, tools: [{ urlContext: {} }], httpOptions: { timeout: 60_000 } },
    prompt,
    { tries: 1 } // main model once, then the fallback model once
  );
  const meta = res.candidates?.[0]?.urlContextMetadata?.urlMetadata ?? [];
  const readUrls = meta.filter((m) => /SUCCESS/.test(m.urlRetrievalStatus ?? "")).map((m) => m.retrievedUrl);
  return { text: res.text ?? "", readUrls };
}

