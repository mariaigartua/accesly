import { collections } from "@/lib/mongodb";
import { ok, bad, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

// POST /api/organizer/events  { key } → { _id, name, startsAt }
// Finds the event an organizer key belongs to, so an organizer can add an event to this
// device by pasting just the key. Keys are 128-bit random, so they can't be guessed.
export async function POST(req) {
  const key = (await readJson(req))?.key;
  if (typeof key !== "string" || !/^[a-f0-9]{32}$/.test(key.trim())) {
    return bad("That doesn't look like an organizer key (32 letters and numbers).");
  }
  const { events } = await collections();
  const event = await events.findOne({ organizerKey: key.trim() }, { projection: { name: 1, startsAt: 1 } });
  if (!event) return bad("No event uses that key.", 404);
  return ok({ _id: String(event._id), name: event.name, startsAt: event.startsAt });
}
