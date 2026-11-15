import Link from "next/link";
import { MapPin } from "lucide-react";
import { TopicChips } from "./NeedChips";

const dayFmt = (d) => new Date(d).toLocaleDateString("en-US", { day: "numeric" });
const whenFmt = (d) =>
  `${new Date(d).toLocaleDateString("en-US", { month: "short" })} · ${new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
const fullFmt = (d) => new Date(d).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" });

/**
 * Colored event card (rotation primary → sky → teal by `index`). The title link covers the
 * card; "Request an accommodation" stays a separate link above it. `event` must be serializable.
 */
export default function EventCard({ event, index = 0, headingLevel: H = "h3" }) {
  const topics = Object.entries(event.accessibility ?? {})
    .filter(([, v]) => v)
    .map(([k]) => k)
    .slice(0, 4);
  return (
    <article className={`event-card card-link c${index % 3}`}>
      <div className="event-top">
        <p className="event-date no-margin">
          <time dateTime={new Date(event.startsAt).toISOString()}>
            <span className="visually-hidden">{fullFmt(event.startsAt)}</span>
            <span aria-hidden="true" className="event-day">
              {dayFmt(event.startsAt)}
            </span>{" "}
            <span aria-hidden="true" className="event-when">
              {whenFmt(event.startsAt)}
            </span>
          </time>
        </p>
        {event.org && <span className="event-tag">{event.org}</span>}
      </div>
      <H>
        <Link href={`/events/${event._id}`} className="stretch">
          {event.name}
        </Link>
      </H>
      {event.location && (
        <p className="event-place no-margin">
          <MapPin aria-hidden="true" focusable="false" />
          {event.location}
        </p>
      )}
      <TopicChips topics={topics} label="Accessibility info shared" />
      <Link href={`/events/${event._id}#request-form`} className="btn event-cta above">
        Request an accommodation
        <span className="visually-hidden">: {event.name}</span>
      </Link>
    </article>
  );
}
