import { collections, toObjectId } from "@/lib/mongodb";
import { generateJson } from "@/lib/gemini";
import { ORGANIZER_FOLLOWUP_SYSTEM } from "@/lib/prompts";
import { ok, bad, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

// POST /api/events/followups  { name, description, spaceId?, accessibility? }
// Used while an organizer fills in the form, before the event is saved.
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

  const reply = await generateJson({ system: ORGANIZER_FOLLOWUP_SYSTEM, prompt });
  return ok({ questions: reply?.questions ?? [] });
}
