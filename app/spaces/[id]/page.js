import { notFound } from "next/navigation";
import { CalendarCheck, MapPin, TriangleAlert } from "lucide-react";
import { collections, toObjectId } from "@/lib/mongodb";
import { humanize } from "@/lib/labels";
import { searchEvents, spaceName, lastChecked, toEventCard } from "@/lib/search";
import ReportIssueForm from "@/components/ReportIssueForm";
import PersonalHighlights from "@/components/PersonalHighlights";
import BackLink from "@/components/ui/BackLink";
import Card from "@/components/ui/Card";
import EventCard from "@/components/ui/EventCard";
import { iconForTopic } from "@/components/ui/NeedChips";

export const dynamic = "force-dynamic";

async function getSpace(id) {
  const _id = toObjectId(id);
  if (!_id) return null;
  const { spaces } = await collections();
  return spaces.findOne({ _id });
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const space = await getSpace(id);
  return { title: space ? spaceName(space) : "Place not found" };
}

const formatDay = (d) => new Date(d).toLocaleDateString("en-US", { dateStyle: "medium" });

export default async function SpacePage({ params }) {
  const { id } = await params;
  const space = await getSpace(id);
  if (!space) notFound();

  const name = spaceName(space);
  const features = Object.entries(space.features ?? {}).filter(([, v]) => v?.value ?? v);
  const reports = [...(space.reports ?? [])].reverse().slice(0, 5); // newest first
  const events = await searchEvents({ spaceId: space._id });
  const checked = lastChecked(space);
  const highlightEntries = features.map(([key, v]) => ({ key, value: String(v?.value ?? v), source: "On file" }));

  return (
    <>
      <BackLink href="/explore#locations">All locations</BackLink>

      <header className="page-header">
        <h1>{name}</h1>
        <ul className="meta">
          <li>
            <MapPin aria-hidden="true" focusable="false" />
            {space.campus ?? "UMass Amherst"}
          </li>
          <li>
            <CalendarCheck aria-hidden="true" focusable="false" />
            {checked ? `Last checked ${checked}` : "Not checked yet"}
          </li>
        </ul>
      </header>

      <div className="split">
        <div className="stack">
          <PersonalHighlights entries={highlightEntries} />

          <Card as="section" aria-labelledby="features-heading">
            <h2 id="features-heading">Accessibility features</h2>
            {features.length === 0 ? (
              <p>No accessibility info on file for this place yet.</p>
            ) : (
              <dl className="info-list">
                {features.map(([key, v]) => {
                  const Icon = iconForTopic(key);
                  return (
                    <div key={key}>
                      <dt className="section-heading">
                        <Icon aria-hidden="true" focusable="false" />
                        {humanize(key)}
                      </dt>
                      <dd>
                        {v?.value ?? String(v)}
                        <span className="checked-date">
                          {v?.lastVerified ? `Last checked ${v.lastVerified}` : "Date not recorded"}
                        </span>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </Card>

          <section aria-labelledby="events-heading" className="stack">
            <h2 id="events-heading">Upcoming events here</h2>
            {events.length === 0 ? (
              <p>No upcoming events in this place.</p>
            ) : (
              <ul className="card-list">
                {events.map((e, i) => (
                  <li key={String(e._id)}>
                    <EventCard event={toEventCard(e)} index={i} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="stack">
          <Card as="section" aria-labelledby="issues-heading">
            <h2 id="issues-heading" className="section-heading">
              <TriangleAlert aria-hidden="true" focusable="false" />
              Recent issues
            </h2>
            {reports.length === 0 ? (
              <p>No issues reported recently.</p>
            ) : (
              <ul className="report-list">
                {reports.map((r, i) => (
                  <li key={i}>
                    <p>{r.text ?? String(r)}</p>
                    {r.createdAt && (
                      <p className="checked-date">
                        Reported <time dateTime={new Date(r.createdAt).toISOString()}>{formatDay(r.createdAt)}</time>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <ReportIssueForm spaceId={String(space._id)} spaceName={name} />
        </div>
      </div>
    </>
  );
}
