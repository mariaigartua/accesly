import { collections } from "@/lib/mongodb";
import { ok, readJson } from "@/lib/http";
import { chatView } from "@/lib/chats";
import { authorizedEvents } from "@/lib/organizer";

export const dynamic = "force-dynamic";

// POST /api/organizer/chats  { keys: [{ eventId, key }] } → { chats, unread }
// Conversations across the organizer's events, newest activity first. No access tokens.
export async function POST(req) {
  const events = await authorizedEvents((await readJson(req))?.keys);
  if (!events.length) return ok({ chats: [], unread: 0 });

  const { chats } = await collections();
  const names = Object.fromEntries(events.map((e) => [String(e._id), e.name]));
  const list = await chats
    .find({ eventId: { $in: events.map((e) => e._id) } }, { projection: { accessToken: 0 } })
    .sort({ updatedAt: -1 })
    .toArray();

  const views = list.map((c) => chatView(c, names[String(c.eventId)]));
  return ok({ chats: views, unread: views.filter((c) => c.unreadForOrganizer).length });
}
