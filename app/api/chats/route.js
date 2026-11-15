import { collections, toObjectId } from "@/lib/mongodb";
import { ok, bad, readJson } from "@/lib/http";
import { cleanText, deleteAfterFor, newToken } from "@/lib/chats";

export const dynamic = "force-dynamic";

// POST /api/chats  { eventId, text, contact? } → { accessToken }
// Attendee starts a conversation with an event's organizer. Anonymous unless `contact` is given.
// The accessToken is the attendee's only way back to the chat; organizers never see it.
export async function POST(req) {
  const body = await readJson(req);
  const eventId = toObjectId(body?.eventId);
  if (!eventId) return bad("valid eventId is required");
  const { text, error } = cleanText(body?.text);
  if (error) return bad(error);
  const contact = typeof body?.contact === "string" ? body.contact.trim().slice(0, 200) : "";

  const { events, chats } = await collections();
  const event = await events.findOne({ _id: eventId }, { projection: { startsAt: 1, endsAt: 1 } });
  if (!event) return bad("event not found", 404);

  const now = new Date();
  const doc = {
    eventId,
    messages: [{ from: "attendee", text, createdAt: now }],
    contact: contact || null,
    unreadForOrganizer: true,
    unreadForAttendee: false,
    accessToken: newToken(),
    createdAt: now,
    updatedAt: now,
    deleteAfter: deleteAfterFor(event), // TTL index deletes it 7 days after the event
  };
  await chats.insertOne(doc);
  return ok({ accessToken: doc.accessToken }, 201);
}
