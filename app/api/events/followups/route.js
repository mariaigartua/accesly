import { collections, toObjectId } from "@/lib/mongodb";
import { generateJson } from "@/lib/gemini";
import { ORGANIZER_FOLLOWUP_SYSTEM, FALLBACK_FOLLOWUPS } from "@/lib/prompts";
import { ok, bad, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

// "Step-free entrance?" → "stepFreeEntrance"; keeps keys safe for Mongo field names.
function toKey(s, i) {
  const words = String(s ?? "").replace(/[^a-zA-Z0-9 ]+/g, " ").trim().split(/\s+/).filter(Boolean).slice(0, 4);
  const key = words.map((w, j) => (j ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join("");
  return key || `question${i + 1}`;
}

// POST /api/events/followups  { name, description, spaceId?, accessibility? } → { questions, source }
// Used while an organizer fills in the Create event form, before the event is saved.
// Falls back to a fixed list when Gemini is unavailable (source: "fallback").
export async function POST(req) {
  const body = await readJson(req);
  if (!body?.name) return bad("name is required");

  let space = null;
  const spaceId = body.spaceId ? toObjectId(body.spaceId) : null;
  if (spaceId) {
    const { spaces } = await collections();
    space = await spaces.findOne({ _id: spaceId });
  }

  const prompt = [
    `EVENT DRAFT:\n${JSON.stringify(
      { name: body.name, description: body.description ?? "", accessibility: body.accessibility ?? {} },
      null,
      2
    )}`,
    `SPACE:\n${space ? JSON.stringify(space, null, 2) : "No space selected."}`,
  ].join("\n\n");

  let reply = null;
  try {
    reply = await generateJson({ system: ORGANIZER_FOLLOWUP_SYSTEM, prompt });
  } catch {
    reply = null;
  }

  // Validate the model's output: plain strings only, unique keys, at most 8.
  const seen = new Set();
  const questions = (Array.isArray(reply?.questions) ? reply.questions : [])
    .filter((q) => typeof q?.question === "string" && q.question.trim())
    .slice(0, 8)
    .map((q, i) => {
      let id = toKey(q.id || q.question, i);
      while (seen.has(id)) id += "2";
      seen.add(id);
      return { id, question: q.question.trim().slice(0, 300), why: typeof q.why === "string" ? q.why.slice(0, 300) : "" };
    });

  if (!questions.length) return ok({ questions: FALLBACK_FOLLOWUPS, source: "fallback" });
  return ok({ questions, source: "ai" });
}
