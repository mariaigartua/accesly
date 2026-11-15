import { notFound } from "next/navigation";
import { CalendarDays, RefreshCw } from "lucide-react";
import { collections } from "@/lib/mongodb";
import { formatDate } from "@/lib/labels";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import NeedChips from "@/components/ui/NeedChips";
import Notice from "@/components/ui/Notice";
import StatusBadge from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Request status", robots: { index: false } };

export default async function RequestStatusPage({ params }) {
  const { token } = await params;
  if (!/^[a-f0-9]{32}$/.test(token ?? "")) notFound();

  const { requests, events } = await collections();
  const request = await requests.findOne(
    { accessToken: token },
    { projection: { eventId: 1, type: 1, needs: 1, note: 1, status: 1, organizerReply: 1, updatedAt: 1 } }
  );
  if (!request) notFound();
  const event = await events.findOne({ _id: request.eventId }, { projection: { name: 1, startsAt: 1 } });
  const needs = request.needs ?? [request.type];

  return (
    <>
      <header className="page-header">
        <h1>Your request</h1>
        {event && (
          <ul className="meta">
            <li>
              For&nbsp;<a href={`/events/${request.eventId}`}>{event.name}</a>
            </li>
            <li>
              <CalendarDays aria-hidden="true" focusable="false" />
              <time dateTime={new Date(event.startsAt).toISOString()}>{formatDate(event.startsAt)}</time>
            </li>
          </ul>
        )}
      </header>

      <div className="split">
        <Card as="section" aria-labelledby="status-heading">
          <h2 id="status-heading">Status</h2>
          <StatusBadge status={request.status} />

          <dl className="info-list mt-md">
            <div>
              <dt>You asked for</dt>
              <dd>
                <NeedChips needs={needs} />
              </dd>
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

          <div className="button-row mt-md">
            <Button href={`/requests/${token}`} variant="secondary" icon={RefreshCw}>
              Refresh status
            </Button>
          </div>
        </Card>

        <Notice tone="info" title="Keep this link private">
          <p>
            Anyone with this link can see this request. We don&apos;t know who sent it. Requests are deleted
            automatically a week after the event.
          </p>
        </Notice>
      </div>
    </>
  );
}
