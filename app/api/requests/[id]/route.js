import { collections, toObjectId } from "@/lib/mongodb";
import { ok, bad, readJson } from "@/lib/http";
import { STATUSES } from "@/lib/labels";

export const dynamic = "force-dynamic";

// PATCH /api/requests/:id  { status, organizerReply? }   header: x-organizer-key
export async function PATCH(req, { params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) return bad("invalid id");
  const body = await readJson(req);
  if (!STATUSES.includes(body?.status)) return bad(`status must be one of: ${STATUSES.join(", ")}`);

  const { events, requests } = await collections();
  const request = await requests.findOne({ _id });
  if (!request) return bad("request not found", 404);
  const event = await events.findOne({ _id: request.eventId }, { projection: { organizerKey: 1 } });
  const key = req.headers.get("x-organizer-key");
  if (!event || !key || key !== event.organizerKey) return bad("not authorized", 401);

  await requests.updateOne(
    { _id },
    { $set: { status: body.status, organizerReply: (body.organizerReply ?? "").slice(0, 1000), updatedAt: new Date() } }
  );
  return ok({ _id, status: body.status });
}
