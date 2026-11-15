import { notFound } from "next/navigation";
import { collections, toObjectId } from "@/lib/mongodb";
import { humanize, formatDate } from "@/lib/labels";
import EventAssistant from "@/components/EventAssistant";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) return { title: "Event not found · Accesly" };
  const { events } = await collections();
  const event = await events.findOne({ _id }, { projection: { name: 1 } });
  return { title: event ? `${event.name} · Accesly` : "Event not found · Accesly" };
}

export default async function EventPage({ params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) notFound();

  const { events, spaces } = await collections();
  const event = await events.findOne({ _id }, { projection: { organizerKey: 0 } });
  if (!event) notFound();
  const space = event.spaceId ? await spaces.findOne({ _id: event.spaceId }) : null;

  const eventInfo = Object.entries(event.accessibility ?? {}).filter(([, v]) => v);
  const spaceInfo = Object.entries(space?.features ?? {}).filter(([, v]) => v?.value ?? v);
  const reports = space?.reports ?? [];

  return (
    <>
      <p><a href="/">← All events</a></p>

      <h1>{event.name}</h1>
      <p className="muted">
        {event.org && <>{event.org} · </>}
        <time dateTime={new Date(event.startsAt).toISOString()}>{formatDate(event.startsAt)}</time>
        {space && <> · {space.building}{space.room ? `, ${space.room}` : ""}</>}
      </p>
      {event.description && <p>{event.description}</p>}

      <section aria-labelledby="access-heading" className="card">
        <h2 id="access-heading">Accessibility at a glance</h2>

        {eventInfo.length === 0 && spaceInfo.length === 0 && (
          <p>The organizer hasn&apos;t added accessibility details yet. Ask below or send an anonymous request.</p>
        )}

        {eventInfo.length > 0 && (
          <>
            <h3>About this event</h3>
            <dl className="info-list">
              {eventInfo.map(([key, value]) => (
                <div key={key}>
                  <dt>{humanize(key)}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
          </>
        )}

        {spaceInfo.length > 0 && (
          <>
            <h3>About the space</h3>
            <dl className="info-list">
              {spaceInfo.map(([key, v]) => (
                <div key={key}>
                  <dt>{humanize(key)}</dt>
                  <dd>
                    {v.value ?? String(v)}
                    {v.lastVerified && <span className="muted"> (checked {v.lastVerified})</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}

        {reports.length > 0 && (
          <div role="note" className="notice">
            <h3>Recently reported issues</h3>
            <ul>
              {reports.slice(-3).map((r, i) => (
                <li key={i}>{r.text ?? String(r)}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <EventAssistant eventId={String(event._id)} eventName={event.name} />
    </>
  );
}
