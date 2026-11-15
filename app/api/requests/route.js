import crypto from "node:crypto";
import { collections, toObjectId } from "@/lib/mongodb";
import { REQUEST_TYPES } from "@/lib/prompts";
import { ok, bad, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

// POST /api/requests  { eventId, needs: [type, ...], note?, contact? }   (legacy: { type })
// Anonymous by default: stores the NEED, not who asked. `contact` is optional and opt-in.
// Returns a private accessToken the attendee uses to check status.
export async function POST(req) {
  const body = await readJson(req);
  const eventId = toObjectId(body?.eventId);
  if (!eventId) return bad("valid eventId is required");
  const raw = Array.isArray(body?.needs) ? body.needs : body?.type ? [body.type] : [];
  const needs = [...new Set(raw)];
  if (!needs.length) return bad("Choose at least one need.");
  if (needs.length > REQUEST_TYPES.length || !needs.every((n) => REQUEST_TYPES.includes(n))) {
    return bad(`needs must be from: ${REQUEST_TYPES.join(", ")}`);
  }

  const { events, requests } = await collections();
  const event = await events.findOne({ _id: eventId }, { projection: { startsAt: 1, endsAt: 1 } });
  if (!event) return bad("event not found", 404);

  const eventEnd = event.endsAt ?? event.startsAt;
  const doc = {
    eventId,
    needs,
    note: (body.note ?? "").slice(0, 1000),
    contact: body.contact?.trim() || null, // only if the attendee chooses to share it
    status: "pending", // pending | confirmed | cannot-accommodate
    organizerReply: "",
    accessToken: crypto.randomBytes(16).toString("hex"),
    createdAt: new Date(),
    updatedAt: new Date(),
    // TTL index (see scripts/seed.mjs) auto-deletes the request 7 days after the event.
    deleteAfter: new Date(new Date(eventEnd).getTime() + 7 * DAY_MS),
  };
  await requests.insertOne(doc);
  return ok({ accessToken: doc.accessToken, status: doc.status }, 201);
}

// GET /api/requests?eventId=...   header: x-organizer-key
// Organizer's queue for one event.
export async function GET(req) {
  const eventId = toObjectId(new URL(req.url).searchParams.get("eventId"));
  if (!eventId) return bad("valid eventId is required");
  const key = req.headers.get("x-organizer-key");

  const { events, requests } = await collections();
  const event = await events.findOne({ _id: eventId }, { projection: { organizerKey: 1 } });
  if (!event || !key || key !== event.organizerKey) return bad("not authorized", 401);

  const list = await requests
    .find({ eventId }, { projection: { accessToken: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  return ok(list);
}
