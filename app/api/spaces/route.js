import { collections } from "@/lib/mongodb";
import { ok, bad, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

// GET /api/spaces — list saved spaces (rooms/buildings).
export async function GET() {
  const { spaces } = await collections();
  const list = await spaces.find({}).sort({ building: 1, room: 1 }).toArray();
  return ok(list);
}

// POST /api/spaces — save a space's accessibility info once, reuse it for every event there.
export async function POST(req) {
  const body = await readJson(req);
  if (!body?.building) return bad("building is required");
  const { spaces } = await collections();
  const doc = {
    building: body.building,
    room: body.room ?? "",
    features: body.features ?? {}, // e.g. { elevator: { value: "Yes, east side", lastVerified: "2026-11-14" } }
    reports: [], // attendee-reported problems, e.g. "elevator out of service"
    createdAt: new Date(),
  };
  const { insertedId } = await spaces.insertOne(doc);
  return ok({ _id: insertedId, ...doc }, 201);
}
