import { generateJson } from "@/lib/gemini";
import { START_SYSTEM } from "@/lib/prompts";
import { DESTINATIONS, cleanPrefill, keywordRoute } from "@/lib/start";
import { ok, bad, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

// POST /api/start  { text } → { destination, prefill, explanation, source: "ai" | "keywords" }
// Routes the person to ONE fixed destination (never anything else); unknown → "ask-ally".
// The text isn't stored or logged.
export async function POST(req) {
  const text = (await readJson(req))?.text;
  if (typeof text !== "string" || !text.trim()) return bad("Tell us what you'd like to do.");
  if (text.length > 1000) return bad("Keep it under 1000 characters.");

  let reply = null;
  try {
    reply = await generateJson({ system: START_SYSTEM, prompt: `WHAT THEY WANT: ${text.trim()}` });
  } catch {
    reply = null;
  }

  if (reply && typeof reply.destination === "string") {
    const destination = DESTINATIONS[reply.destination] ? reply.destination : "ask-ally";
    const prefill = cleanPrefill(destination, reply.prefill ?? (destination === "ask-ally" ? { question: text } : {}));
    if (destination === "ask-ally" && !prefill.question) prefill.question = text.trim().slice(0, 1000);
    const explanation = typeof reply.explanation === "string" ? reply.explanation.trim().slice(0, 300) : "";
    return ok({ destination, prefill, explanation, source: "ai" });
  }

  // Gemini unavailable or returned something unusable → simple keyword matching.
  const { destination, prefill } = keywordRoute(text);
  return ok({ destination, prefill, explanation: "", source: "keywords" });
}
