import { collections } from "@/lib/mongodb";
import { ok, readJson } from "@/lib/http";
import { normalizeStatus } from "@/lib/labels";
import { authorizedEvents } from "@/lib/organizer";

export const dynamic = "force-dynamic";

// POST /api/organizer/requests  { keys: [{ eventId, key }] }
// All accommodation requests across the organizer's events (the ones whose key matches).
// Never includes the attendee's accessToken.
export async function POST(req) {
  const events = await authorizedEvents((await readJson(req))?.keys);
  if (!events.length) return ok({ events: [], requests: [] });

  const { requests } = await collections();
  const names = Object.fromEntries(events.map((e) => [String(e._id), e.name]));
  const list = await requests
    .find({ eventId: { $in: events.map((e) => e._id) } }, { projection: { accessToken: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  return ok({
    events: events.map((e) => ({ _id: String(e._id), name: e.name, startsAt: e.startsAt })),
    requests: list.map((r) => ({
      ...r,
      status: normalizeStatus(r.status),
      needs: r.needs ?? (r.type ? [r.type] : []),
      eventName: names[String(r.eventId)] ?? "",
    })),
  });
}
