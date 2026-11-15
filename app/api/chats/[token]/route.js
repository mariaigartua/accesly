import { collections } from "@/lib/mongodb";
import { ok, bad } from "@/lib/http";
import { chatView, isToken } from "@/lib/chats";

export const dynamic = "force-dynamic";

// GET /api/chats/:token[?markRead=1] — attendee reads their chat (token = access).
// markRead=1 clears the attendee's unread flag (the chat page sends it; the My chats list doesn't).
export async function GET(req, { params }) {
  const { token } = await params;
  if (!isToken(token)) return bad("invalid token");

  const { chats, events } = await collections();
  const chat = await chats.findOne({ accessToken: token });
  if (!chat) return bad("chat not found", 404);

  if (new URL(req.url).searchParams.get("markRead") === "1" && chat.unreadForAttendee) {
    await chats.updateOne({ _id: chat._id }, { $set: { unreadForAttendee: false } });
  }
  const event = await events.findOne({ _id: chat.eventId }, { projection: { name: 1 } });
  return ok(chatView(chat, event?.name));
}
