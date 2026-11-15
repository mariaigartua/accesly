import crypto from "node:crypto";
import { collections, toObjectId } from "@/lib/mongodb";
import { ok, bad, readJson } from "@/lib/http";
import { searchEvents } from "@/lib/search";

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

// POST /api/events — organizer creates an event in a saved space.
// Returns an organizerKey once; it's the organizer's "password" for the request dashboard.
export async function POST(req) {
  const body = await readJson(req);
  if (!body?.name || !body?.startsAt) return bad("name and startsAt are required");
  const spaceId = body.spaceId ? toObjectId(body.spaceId) : null;
  if (body.spaceId && !spaceId) return bad("invalid spaceId");

  const { events } = await collections();
  const doc = {
    name: body.name,
    org: body.org ?? "",
    description: body.description ?? "",
    startsAt: new Date(body.startsAt),
    endsAt: body.endsAt ? new Date(body.endsAt) : null,
    spaceId,
    accessibility: body.accessibility ?? {}, // event-specific answers (food, noise, captions, ...)
    organizerKey: crypto.randomBytes(16).toString("hex"),
    createdAt: new Date(),
  };
  const { insertedId } = await events.insertOne(doc);
  return ok({ _id: insertedId, ...doc }, 201);
}
