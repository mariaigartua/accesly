import crypto from "node:crypto";
import { collections, toObjectId } from "@/lib/mongodb";
import { ok, bad, readJson } from "@/lib/http";
import { searchEvents } from "@/lib/search";
import { uniqueSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

// GET /api/events?q=&spaceId= — public list of upcoming events (no organizer keys).
export async function GET(req) {
  const params = new URL(req.url).searchParams;
  const q = (params.get("q") ?? "").slice(0, 200);
  const rawSpaceId = params.get("spaceId");
  const spaceId = rawSpaceId ? toObjectId(rawSpaceId) : null;
  if (rawSpaceId && !spaceId) return bad("invalid spaceId");
  return ok(await searchEvents({ q, spaceId }));
}

// POST /api/events — organizer creates an event (optionally in a saved space).
// Returns the organizerKey ONCE; it's the organizer's "password" for requests and chats.
export async function POST(req) {
  const body = await readJson(req);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return bad("Add the event name.");
  if (name.length > 200) return bad("Keep the event name under 200 characters.");

  const startsAt = new Date(body?.startsAt);
  if (!body?.startsAt || Number.isNaN(startsAt.getTime())) return bad("Add a valid start date and time.");
  const endsAt = body.endsAt ? new Date(body.endsAt) : null;
  if (endsAt && (Number.isNaN(endsAt.getTime()) || endsAt <= startsAt)) return bad("The end time must be after the start.");

  const spaceId = body.spaceId ? toObjectId(body.spaceId) : null;
  if (body.spaceId && !spaceId) return bad("invalid spaceId");

  // Accessibility answers: { topicKey: "text" } — plain strings only.
  const accessibility = {};
  for (const [k, v] of Object.entries(body.accessibility ?? {}).slice(0, 30)) {
    if (/^[a-zA-Z][a-zA-Z0-9]{0,39}$/.test(k) && typeof v === "string" && v.trim()) accessibility[k] = v.trim().slice(0, 1000);
  }

  const { events, spaces } = await collections();
  if (spaceId && !(await spaces.findOne({ _id: spaceId }, { projection: { _id: 1 } }))) return bad("space not found", 404);

  const doc = {
    name,
    org: String(body.org ?? "").trim().slice(0, 200),
    description: String(body.description ?? "").trim().slice(0, 3000),
    startsAt,
    endsAt,
    spaceId,
    accessibility,
    organizerKey: crypto.randomBytes(16).toString("hex"),
    slug: await uniqueSlug(events, name), // short link /e/<slug> for fliers and QR codes
    createdAt: new Date(),
  };
  let insertedId;
  try {
    ({ insertedId } = await events.insertOne(doc));
  } catch (e) {
    if (e?.code !== 11000) throw e;
    doc.slug = `${doc.slug.slice(0, 35)}-${crypto.randomBytes(2).toString("hex")}`; // someone took it a moment ago
    ({ insertedId } = await events.insertOne(doc));
  }
  return ok({ _id: insertedId, ...doc }, 201);
}
