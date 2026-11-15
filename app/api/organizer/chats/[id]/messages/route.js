import { collections, toObjectId } from "@/lib/mongodb";
import { ok, bad, readJson } from "@/lib/http";
import { cleanText, MAX_MESSAGES } from "@/lib/chats";
import { eventForKey } from "@/lib/organizer";

export const dynamic = "force-dynamic";

// POST /api/organizer/chats/:id/messages  { text }   header: x-organizer-key — organizer replies.
export async function POST(req, { params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) return bad("invalid id");
  const { text, error } = cleanText((await readJson(req))?.text);
  if (error) return bad(error);

  const { chats } = await collections();
  const chat = await chats.findOne({ _id }, { projection: { eventId: 1 } });
  if (!chat) return bad("chat not found", 404);
  if (!(await eventForKey(req, chat.eventId))) return bad("not authorized", 401);

  const now = new Date();
  const message = { from: "organizer", text, createdAt: now };
  await chats.updateOne(
    { _id },
    {
      $push: { messages: { $each: [message], $slice: -MAX_MESSAGES } },
      $set: { unreadForAttendee: true, unreadForOrganizer: false, updatedAt: now },
    }
  );
  return ok(message, 201);
}
