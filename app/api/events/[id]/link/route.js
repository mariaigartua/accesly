import { toObjectId, collections } from "@/lib/mongodb";
import { ok, bad, readJson } from "@/lib/http";
import { eventForKey } from "@/lib/organizer";
import { SLUG_HELP, SLUG_RE, uniqueSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

// PATCH /api/events/[id]/link { slug? } (x-organizer-key) — set a custom short link /e/<slug>.
// Without a slug, creates one from the event name (for events made before short links existed).
export async function PATCH(req, { params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) return bad("invalid id");
  const event = await eventForKey(req, _id);
  if (!event) return bad("not authorized", 403);

  const body = await readJson(req);
  const { events } = await collections();
  let slug;
  if (body?.slug === undefined || body?.slug === "") {
    slug = await uniqueSlug(events, event.name, _id);
  } else {
    slug = String(body.slug).trim().toLowerCase();
    if (!SLUG_RE.test(slug)) return bad(`That link won't work. Use ${SLUG_HELP.toLowerCase()}`);
    const taken = await events.findOne({ slug, _id: { $ne: _id } }, { projection: { _id: 1 } });
    if (taken) return bad("That link is already taken. Try another one.", 409);
  }
  try {
    await events.updateOne({ _id }, { $set: { slug } });
  } catch (e) {
    if (e?.code === 11000) return bad("That link is already taken. Try another one.", 409);
    throw e;
  }
  return ok({ slug });
}
