import { collections } from "@/lib/mongodb";
import { ok, bad } from "@/lib/http";

export const dynamic = "force-dynamic";

// GET /api/requests/status/:token — attendee checks their request. No login, no identity.
export async function GET(_req, { params }) {
  const { token } = await params;
  if (!/^[a-f0-9]{32}$/.test(token ?? "")) return bad("invalid token");

  const { requests, events } = await collections();
  const request = await requests.findOne(
    { accessToken: token },
    { projection: { eventId: 1, type: 1, note: 1, status: 1, organizerReply: 1, updatedAt: 1 } }
  );
  if (!request) return bad("request not found", 404);
  const event = await events.findOne({ _id: request.eventId }, { projection: { name: 1, startsAt: 1 } });
  return ok({ ...request, event });
}
