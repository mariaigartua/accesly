import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { collections, toObjectId } from "@/lib/mongodb";
import { formatDate } from "@/lib/labels";
import RequestQueue from "@/components/RequestQueue";
import BackLink from "@/components/ui/BackLink";

export const dynamic = "force-dynamic";
export const metadata = { title: "Organizer dashboard", robots: { index: false } };

export default async function OrganizerPage({ params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) notFound();

  const { events } = await collections();
  const event = await events.findOne({ _id }, { projection: { name: 1, startsAt: 1 } });
  if (!event) notFound();

  return (
    <>
      <BackLink href="/organizer">Organizer</BackLink>
      <p>
        <a href={`/events/${id}`}>See the attendee view</a>
      </p>
      <header className="page-header">
        <h1>Requests for {event.name}</h1>
        <ul className="meta">
          <li>
            <CalendarDays aria-hidden="true" focusable="false" />
            <time dateTime={new Date(event.startsAt).toISOString()}>{formatDate(event.startsAt)}</time>
          </li>
        </ul>
      </header>
      <div className="narrow">
        <RequestQueue eventId={id} eventName={event.name} />
      </div>
    </>
  );
}
