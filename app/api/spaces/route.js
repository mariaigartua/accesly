import { collections } from "@/lib/mongodb";
import { ok, bad, readJson } from "@/lib/http";
import { searchSpaces } from "@/lib/search";

export const dynamic = "force-dynamic";

// GET /api/spaces?q= — list saved spaces (rooms/buildings), optionally searched.
export async function GET(req) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return ok(await searchSpaces(q.slice(0, 200)));
}

// POST /api/spaces — save a space's accessibility info once, reuse it for every event there.
export async function POST(req) {
  const body = await readJson(req);
  const building = typeof body?.building === "string" ? body.building.trim() : "";
  if (!building) return bad("Add the building name.");
  if (building.length > 200) return bad("Keep the building name under 200 characters.");
  const { spaces } = await collections();
  const doc = {
    campus: "UMass Amherst",
    building,
    room: String(body.room ?? "").trim().slice(0, 100),
    features: body.features ?? {}, // e.g. { elevator: { value: "Yes, east side", lastVerified: "2026-11-14" } }
    reports: [], // attendee-reported problems, e.g. "elevator out of service"
    createdAt: new Date(),
  };
  const { insertedId } = await spaces.insertOne(doc);
  return ok({ _id: insertedId, ...doc }, 201);
}
