import { notFound } from "next/navigation";
import { collections, toObjectId } from "@/lib/mongodb";
import { formatDate } from "@/lib/labels";
import RequestQueue from "@/components/RequestQueue";

export const dynamic = "force-dynamic";
export const metadata = { title: "Organizer dashboard · Accesly", robots: { index: false } };

export default async function OrganizerPage({ params }) {
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) notFound();

  const { events } = await collections();
  const event = await events.findOne({ _id }, { projection: { name: 1, startsAt: 1 } });
  if (!event) notFound();

  return (
    <>
      <p><a href={`/events/${id}`}>← Attendee view</a></p>
      <h1>Requests for {event.name}</h1>
      <p className="muted">
        <time dateTime={new Date(event.startsAt).toISOString()}>{formatDate(event.startsAt)}</time>
      </p>
      <RequestQueue eventId={id} />
    </>
  );
}
