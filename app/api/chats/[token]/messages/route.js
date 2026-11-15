import { collections } from "@/lib/mongodb";
import { ok, bad, readJson } from "@/lib/http";
import { cleanText, isToken, MAX_MESSAGES } from "@/lib/chats";

export const dynamic = "force-dynamic";

// POST /api/chats/:token/messages  { text } — attendee replies in their chat.
export async function POST(req, { params }) {
  const { token } = await params;
  if (!isToken(token)) return bad("invalid token");
  const { text, error } = cleanText((await readJson(req))?.text);
  if (error) return bad(error);

  const { chats } = await collections();
  const now = new Date();
  const message = { from: "attendee", text, createdAt: now };
  const { matchedCount } = await chats.updateOne(
    { accessToken: token },
    {
      $push: { messages: { $each: [message], $slice: -MAX_MESSAGES } },
      $set: { unreadForOrganizer: true, unreadForAttendee: false, updatedAt: now },
    }
  );
  if (!matchedCount) return bad("chat not found", 404);
  return ok(message, 201);
}
