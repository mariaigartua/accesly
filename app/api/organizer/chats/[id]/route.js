import { collections, toObjectId } from "@/lib/mongodb";
import { ok, bad } from "@/lib/http";
import { eventForKey } from "@/lib/organizer";

export const dynamic = "force-dynamic";

// PATCH /api/organizer/chats/:id   header: x-organizer-key — organizer opened the chat: mark read.
export async function PATCH(req, { params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) return bad("invalid id");

  const { chats } = await collections();
  const chat = await chats.findOne({ _id }, { projection: { eventId: 1 } });
  if (!chat) return bad("chat not found", 404);
  if (!(await eventForKey(req, chat.eventId))) return bad("not authorized", 401);

  await chats.updateOne({ _id }, { $set: { unreadForOrganizer: false } });
  return ok({ _id, unreadForOrganizer: false });
}
