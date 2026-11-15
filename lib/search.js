// Shared search/listing logic for spaces and events, used by server pages and API routes.
// Campus-scale data is small, so we filter in JS: simple, and it can match inside the
// free-form `features` / `accessibility` objects (whose keys vary).
import { collections } from "@/lib/mongodb";

const norm = (s) => String(s ?? "").toLowerCase();

/** True if every word of the query appears somewhere in the haystack. */
function matches(haystack, q) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = norm(haystack);
  return words.every((w) => text.includes(w));
}

// Keys like "stepFreeEntrance" / "step-free_route" → "step free entrance" so they're searchable.
const keyWords = (k) => String(k).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");

function spaceText(s) {
  const features = Object.entries(s.features ?? {}).map(([k, v]) => `${keyWords(k)} ${v?.value ?? v}`);
  return [s.campus, s.building, s.room, ...features].join(" ");
}

function eventText(e, spaceName = "") {
  const access = Object.entries(e.accessibility ?? {}).map(([k, v]) => `${keyWords(k)} ${v}`);
  return [e.name, e.org, e.description, spaceName, ...access].join(" ");
}

export const spaceName = (s) => (s ? [s.building, s.room].filter(Boolean).join(", ") : "");

/** Most recent `lastVerified` among a space's features (ISO date string or ""). */
export function lastChecked(space) {
  return Object.values(space?.features ?? {})
    .map((v) => v?.lastVerified)
    .filter(Boolean)
    .sort()
    .at(-1) ?? "";
}

/** Events that haven't finished yet (ends in the future, or started less than 3 hours ago). */
function upcomingFilter() {
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return {
    $or: [{ endsAt: { $gte: now } }, { endsAt: null, startsAt: { $gte: threeHoursAgo } }],
  };
}

export async function searchSpaces(q = "") {
  const { spaces } = await collections();
  const list = await spaces.find({}).sort({ building: 1, room: 1 }).toArray();
  return list.filter((s) => matches(spaceText(s), q));
}

/**
 * Upcoming events, optionally filtered by text query and/or a space.
 * Each result gets `location` (the space's name) added. Never returns organizerKey.
 */
export async function searchEvents({ q = "", spaceId = null } = {}) {
  const { events, spaces } = await collections();
  const filter = { ...upcomingFilter(), ...(spaceId ? { spaceId } : {}) };
  const list = await events.find(filter, { projection: { organizerKey: 0 } }).sort({ startsAt: 1 }).toArray();

  const spaceIds = list.map((e) => e.spaceId).filter(Boolean);
  const spaceDocs = spaceIds.length
    ? await spaces.find({ _id: { $in: spaceIds } }, { projection: { building: 1, room: 1 } }).toArray()
    : [];
  const names = Object.fromEntries(spaceDocs.map((s) => [String(s._id), spaceName(s)]));

  return list
    .map((e) => ({ ...e, location: e.spaceId ? names[String(e.spaceId)] ?? "" : "" }))
    .filter((e) => matches(eventText(e, e.location), q));
}

/** Plain, serializable event shape for cards. */
export function toEventCard(e) {
  return {
    _id: String(e._id),
    name: e.name,
    org: e.org ?? "",
    startsAt: new Date(e.startsAt).toISOString(),
    location: e.location ?? "",
    accessibility: e.accessibility ?? {},
  };
}
