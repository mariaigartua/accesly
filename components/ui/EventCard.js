import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { formatDate } from "@/lib/labels";
import { TopicChips } from "./NeedChips";

/** Event summary card. The title link covers the whole card. `event` must be serializable. */
export default function EventCard({ event, headingLevel: H = "h3" }) {
  const topics = Object.entries(event.accessibility ?? {})
    .filter(([, v]) => v)
    .map(([k]) => k)
    .slice(0, 4);
  return (
    <article className="card card-link">
      <H className="h3">
        <Link href={`/events/${event._id}`}>{event.name}</Link>
      </H>
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
        {event.location && (
          <li>
            <MapPin aria-hidden="true" focusable="false" />
            {event.location}
          </li>
        )}
      </ul>
      <TopicChips topics={topics} label="Accessibility info shared" />
    </article>
  );
}
