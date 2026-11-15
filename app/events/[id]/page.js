import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users, Building2, Sparkles } from "lucide-react";
import { collections, toObjectId } from "@/lib/mongodb";
import { humanize, formatDate } from "@/lib/labels";
import EventAssistant from "@/components/EventAssistant";
import PersonalHighlights from "@/components/PersonalHighlights";
import BackLink from "@/components/ui/BackLink";
import Card from "@/components/ui/Card";
import Notice from "@/components/ui/Notice";
import { iconForTopic } from "@/components/ui/NeedChips";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) return { title: "Event not found" };
  const { events } = await collections();
  const event = await events.findOne({ _id }, { projection: { name: 1 } });
  return { title: event ? event.name : "Event not found" };
}

function InfoList({ items }) {
  return (
    <dl className="info-list">
      {items.map(({ key, value, checked }) => {
        const Icon = iconForTopic(key);
        return (
          <div key={key}>
            <dt className="section-heading">
              <Icon aria-hidden="true" focusable="false" />
              {humanize(key)}
            </dt>
            <dd>
              {value}
              {checked && <span className="checked-date">Last checked {checked}</span>}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export default async function EventPage({ params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) notFound();

  const { events, spaces } = await collections();
  const event = await events.findOne({ _id }, { projection: { organizerKey: 0 } });
  if (!event) notFound();
  const space = event.spaceId ? await spaces.findOne({ _id: event.spaceId }) : null;

  const eventInfo = Object.entries(event.accessibility ?? {})
    .filter(([, v]) => v)
    .map(([key, v]) => ({ key, value: String(v) }));
  const spaceInfo = Object.entries(space?.features ?? {})
    .filter(([, v]) => v?.value ?? v)
    .map(([key, v]) => ({ key, value: v?.value ?? String(v), checked: v?.lastVerified }));
  const reports = space?.reports ?? [];
  // Plain data for the in-browser "For your needs" matching.
  const highlightEntries = [
    ...eventInfo.map(({ key, value }) => ({ key, value, source: "Organizer" })),
    ...spaceInfo.map(({ key, value }) => ({ key, value: String(value), source: "Space" })),
  ];
  const where = space ? [space.building, space.room].filter(Boolean).join(", ") : "";

  return (
    <>
      <BackLink href="/explore#events">All events</BackLink>

      <header className="page-header">
        <h1>{event.name}</h1>
        <ul className="meta">
          <li>
            <CalendarDays aria-hidden="true" focusable="false" />
            <time dateTime={new Date(event.startsAt).toISOString()}>{formatDate(event.startsAt)}</time>
          </li>
          {event.org && (
            <li>
              <Users aria-hidden="true" focusable="false" />
              {event.org}
            </li>
          )}
          {where && (
            <li>
              <MapPin aria-hidden="true" focusable="false" />
              <a href={`/spaces/${space._id}`}>{where}</a>
            </li>
          )}
        </ul>
      </header>

      <div className="split">
        <div className="stack">
          <PersonalHighlights entries={highlightEntries} requestHref="#request-form" />

          {event.description && (
            <Card as="section" aria-labelledby="about-heading">
              <h2 id="about-heading">About this event</h2>
              <p>{event.description}</p>
            </Card>
          )}

          <Card as="section" aria-labelledby="access-heading">
            <h2 id="access-heading">Accessibility at a glance</h2>

            {eventInfo.length === 0 && spaceInfo.length === 0 && (
              <p>
                The organizer hasn&apos;t added accessibility details yet. Ask a question or send an anonymous
                request.
              </p>
            )}

            {eventInfo.length > 0 && (
              <>
                <h3 className="section-heading">
                  <Sparkles aria-hidden="true" focusable="false" />
                  From the organizer
                </h3>
                <InfoList items={eventInfo} />
              </>
            )}

            {spaceInfo.length > 0 && (
              <>
                <h3 className="section-heading">
                  <Building2 aria-hidden="true" focusable="false" />
                  About the space
                </h3>
                <InfoList items={spaceInfo} />
              </>
            )}
          </Card>

          {reports.length > 0 && (
            <Notice tone="warning" title="Recently reported issues" titleAs="h2" role="note">
              <ul>
                {reports.slice(-3).map((r, i) => (
                  <li key={i}>{r.text ?? String(r)}</li>
                ))}
              </ul>
            </Notice>
          )}
        </div>

        <div className="stack">
          <EventAssistant eventId={String(event._id)} eventName={event.name} />
        </div>
      </div>
    </>
  );
}
