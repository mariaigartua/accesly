// Organizer authorization. There are no organizer accounts: each event has a random
// organizerKey, saved on the organizer's device. A request proves access by sending the key.
import { collections, toObjectId } from "@/lib/mongodb";

const MAX_KEYS = 50;
const KEY_RE = /^[a-f0-9]{32}$/;

/**
 * keys: [{ eventId, key }] from the client. Returns the events whose key matches
 * (projection: name, startsAt, endsAt). Invalid or wrong entries are silently skipped.
 */
export async function authorizedEvents(keys) {
  if (!Array.isArray(keys)) return [];
  const pairs = keys
    .slice(0, MAX_KEYS)
    .map((k) => ({ _id: toObjectId(k?.eventId), key: k?.key }))
    .filter((k) => k._id && typeof k.key === "string" && KEY_RE.test(k.key));
  if (!pairs.length) return [];

  const { events } = await collections();
  const docs = await events
    .find({ _id: { $in: pairs.map((p) => p._id) } }, { projection: { name: 1, startsAt: 1, endsAt: 1, organizerKey: 1 } })
    .toArray();
  const wanted = new Map(pairs.map((p) => [String(p._id), p.key]));
  return docs
    .filter((e) => wanted.get(String(e._id)) === e.organizerKey)
    .map(({ organizerKey, ...rest }) => rest); // never echo keys back
}

/** Checks the x-organizer-key header against one event. Returns the event or null. */
export async function eventForKey(req, eventId) {
  const key = req.headers.get("x-organizer-key");
  if (!key || !eventId) return null;
  const { events } = await collections();
  const event = await events.findOne({ _id: eventId }, { projection: { name: 1, organizerKey: 1 } });
  return event && event.organizerKey === key ? event : null;
}
