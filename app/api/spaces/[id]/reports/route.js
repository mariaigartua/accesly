import { collections, toObjectId } from "@/lib/mongodb";
import { ok, bad, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

const MAX_REPORTS = 50; // keep only the most recent reports per space

// POST /api/spaces/:id/reports  { text } — anonymous issue report ("elevator out of service").
// Stores only the text and a timestamp: no name, contact, IP or anything else about the reporter.
export async function POST(req, { params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) return bad("invalid id");

  const body = await readJson(req);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return bad("Describe the issue.");
  if (text.length > 500) return bad("Keep the report under 500 characters.");

  const { spaces } = await collections();
  const report = { text, createdAt: new Date() };
  const { matchedCount } = await spaces.updateOne(
    { _id },
    { $push: { reports: { $each: [report], $slice: -MAX_REPORTS } } }
  );
  if (!matchedCount) return bad("space not found", 404);
  return ok(report, 201);
}
