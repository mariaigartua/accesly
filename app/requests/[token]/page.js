import { notFound } from "next/navigation";
import { collections } from "@/lib/mongodb";
import { REQUEST_TYPE_LABELS, STATUS_LABELS, formatDate } from "@/lib/labels";

export const dynamic = "force-dynamic";
export const metadata = { title: "Request status · Accesly", robots: { index: false } };

export default async function RequestStatusPage({ params }) {
  const { token } = await params;
  if (!/^[a-f0-9]{32}$/.test(token ?? "")) notFound();

  const { requests, events } = await collections();
  const request = await requests.findOne(
    { accessToken: token },
    { projection: { eventId: 1, type: 1, note: 1, status: 1, organizerReply: 1, updatedAt: 1 } }
  );
  if (!request) notFound();
  const event = await events.findOne({ _id: request.eventId }, { projection: { name: 1, startsAt: 1 } });

  return (
    <>
      <h1>Your request</h1>
      {event && (
        <p>
          For <a href={`/events/${request.eventId}`}>{event.name}</a> ·{" "}
          <time dateTime={new Date(event.startsAt).toISOString()}>{formatDate(event.startsAt)}</time>
        </p>
      )}

      <section className="card" aria-labelledby="status-heading">
        <h2 id="status-heading">Status</h2>
        <p className={`badge badge-${request.status}`}>{STATUS_LABELS[request.status] ?? request.status}</p>

        <dl className="info-list">
          <div>
            <dt>You asked for</dt>
            <dd>{REQUEST_TYPE_LABELS[request.type] ?? request.type}</dd>
          </div>
          {request.note && (
            <div>
              <dt>Your details</dt>
              <dd>{request.note}</dd>
            </div>
          )}
          {request.organizerReply && (
            <div>
              <dt>Organizer&apos;s reply</dt>
              <dd>{request.organizerReply}</dd>
            </div>
          )}
          <div>
            <dt>Last updated</dt>
            <dd>{formatDate(request.updatedAt)}</dd>
          </div>
        </dl>

        <p>
          <a href={`/requests/${token}`}>Refresh status</a>
        </p>
      </section>

      <p className="muted">
        Keep this link private. Anyone with it can see this request. Requests are deleted automatically a week
        after the event.
      </p>
    </>
  );
}
