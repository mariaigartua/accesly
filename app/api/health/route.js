import { getDb } from "@/lib/mongodb";
import { generateText, GEMINI_MODEL } from "@/lib/gemini";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

// GET /api/health — confirms MongoDB and Gemini are both wired up.
export async function GET() {
  const result = { mongodb: "unknown", gemini: "unknown", model: GEMINI_MODEL };
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    result.mongodb = "ok";
  } catch (e) {
    result.mongodb = `error: ${e.message}`;
  }
  try {
    const text = await generateText({ system: "Reply with exactly: pong", prompt: "ping" });
    result.gemini = text.toLowerCase().includes("pong") ? "ok" : `unexpected reply: ${text.slice(0, 50)}`;
  } catch (e) {
    result.gemini = `error: ${e.message}`;
  }
  const healthy = result.mongodb === "ok" && result.gemini === "ok";
  return ok(result, healthy ? 200 : 500);
}
