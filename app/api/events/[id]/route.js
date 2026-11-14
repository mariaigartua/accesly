import { collections, toObjectId } from "@/lib/mongodb";
import { ok, bad } from "@/lib/http";

export const dynamic = "force-dynamic";

// GET /api/events/:id — event plus its space info (public; no organizer key).
export async function GET(_req, { params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) return bad("invalid id");

  const { events, spaces } = await collections();
  const event = await events.findOne({ _id }, { projection: { organizerKey: 0 } });
  if (!event) return bad("event not found", 404);
  const space = event.spaceId ? await spaces.findOne({ _id: event.spaceId }) : null;
  return ok({ event, space });
}
