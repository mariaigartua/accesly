import { collections, toObjectId } from "@/lib/mongodb";
import { ok, bad } from "@/lib/http";
import { searchEvents } from "@/lib/search";

export const dynamic = "force-dynamic";

// GET /api/spaces/:id — one space plus its upcoming events (public).
export async function GET(_req, { params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) return bad("invalid id");

  const { spaces } = await collections();
  const space = await spaces.findOne({ _id });
  if (!space) return bad("space not found", 404);
  const events = await searchEvents({ spaceId: _id });
  return ok({ space, events });
}
