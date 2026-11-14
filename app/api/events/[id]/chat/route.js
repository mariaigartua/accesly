import { collections, toObjectId } from "@/lib/mongodb";
import { generateJson } from "@/lib/gemini";
import { EVENT_CHAT_SYSTEM } from "@/lib/prompts";
import { ok, bad, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

// POST /api/events/:id/chat  { question, history?: [{role, text}] }
// Answers ONLY from this event's + space's data. Nothing about the attendee is stored.
export async function POST(req, { params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) return bad("invalid id");
  const body = await readJson(req);
  const question = body?.question?.trim();
  if (!question) return bad("question is required");

  const { events, spaces } = await collections();
  const event = await events.findOne({ _id }, { projection: { organizerKey: 0 } });
  if (!event) return bad("event not found", 404);
  const space = event.spaceId ? await spaces.findOne({ _id: event.spaceId }) : null;

  const history = (body.history ?? [])
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Attendee" : "Assistant"}: ${m.text}`)
    .join("\n");

  const prompt = [
    `EVENT:\n${JSON.stringify(event, null, 2)}`,
    `SPACE:\n${space ? JSON.stringify(space, null, 2) : "No space info on file."}`,
    history ? `CONVERSATION SO FAR:\n${history}` : "",
    `QUESTION: ${question}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const reply = await generateJson({ system: EVENT_CHAT_SYSTEM, prompt });
  if (!reply?.answer) {
    return ok({
      answer: "Sorry, I couldn't answer that right now. You can send an anonymous request to the organizer instead.",
      confirmed: false,
      suggestRequest: true,
      requestType: null,
    });
  }
  return ok(reply);
}
