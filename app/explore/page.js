import { MapPin, Plus } from "lucide-react";
import { searchEvents, searchSpaces, spaceName, lastChecked, toEventCard } from "@/lib/search";
import SearchForm from "@/components/SearchForm";
import Button from "@/components/ui/Button";
import EventCard from "@/components/ui/EventCard";
import SpaceCard from "@/components/ui/SpaceCard";
import Notice from "@/components/ui/Notice";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore" };

// Fixed campus for the demo (no geolocation).
const CAMPUS = "UMass Amherst";

/** Builds an /explore URL keeping the given params, e.g. to clear one search but not the other. */
function exploreHref(params, anchor) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return `/explore${qs ? `?${qs}` : ""}#${anchor}`;
}

function ResultSummary({ count, noun, query, clearHref }) {
  return (
    <p className="muted">
      {query ? (
        <>
          {count} {noun}
          {count === 1 ? "" : "s"} matching “{query}”. <a href={clearHref}>Show all</a>
        </>
      ) : (
        <>
          {count} {noun}
          {count === 1 ? "" : "s"}
        </>
      )}
    </p>
  );
}

export default async function ExplorePage({ searchParams }) {
  const sp = await searchParams;
  const placeQ = String(sp?.locations ?? "").slice(0, 200).trim();
  const eventQ = String(sp?.events ?? "").slice(0, 200).trim();

  let spaces = [];
  let events = [];
  let error = null;
  try {
    [spaces, events] = await Promise.all([searchSpaces(placeQ), searchEvents({ q: eventQ })]);
  } catch (e) {
    error = e.message;
  }

  const spaceCards = spaces.map((s) => ({
    _id: String(s._id),
    name: spaceName(s),
    features: Object.entries(s.features ?? {})
      .filter(([, v]) => v?.value ?? v)
      .map(([k]) => k),
    lastChecked: lastChecked(s),
  }));

  return (
    <>
      <header className="page-header">
        <h1>Explore</h1>
        <p className="meta">
          <MapPin aria-hidden="true" focusable="false" />
          <span>
            You are at <strong>{CAMPUS}</strong>
          </span>
        </p>
      </header>

      {error && (
        <Notice tone="error" title="Couldn't load places and events" role="alert">
          <p>{error}</p>
        </Notice>
      )}

      <div className="split-even">
        <section id="locations" aria-labelledby="locations-heading" className="stack">
          <h2 id="locations-heading">Browse locations</h2>
          <SearchForm
            id="location-search"
            name="locations"
            label="Search buildings and rooms"
            value={placeQ}
            placeholder="e.g. library, elevator, quiet"
            anchor="locations"
            keep={{ events: eventQ }}
          />
          <ResultSummary
            count={spaceCards.length}
            noun="location"
            query={placeQ}
            clearHref={exploreHref({ events: eventQ }, "locations")}
          />
          {!error && spaceCards.length === 0 && (
            <p>{placeQ ? "No locations match that search. Try another word." : "No locations saved yet."}</p>
          )}
          <ul className="card-list">
            {spaceCards.map((s) => (
              <li key={s._id}>
                <SpaceCard space={s} />
              </li>
            ))}
          </ul>
        </section>

        <section id="events" aria-labelledby="events-heading" className="stack">
          <div className="toolbar">
            <h2 id="events-heading">Browse events</h2>
            <Button href="/organizer/new" variant="secondary" icon={Plus}>
              Create event
            </Button>
          </div>
          <SearchForm
            id="event-search"
            name="events"
            label="Search upcoming events"
            value={eventQ}
            placeholder="e.g. captions, club name, building"
            anchor="events"
            keep={{ locations: placeQ }}
          />
          <ResultSummary
            count={events.length}
            noun="upcoming event"
            query={eventQ}
            clearHref={exploreHref({ locations: placeQ }, "events")}
          />
          {!error && events.length === 0 && (
            <p>{eventQ ? "No upcoming events match that search. Try another word." : "No upcoming events yet."}</p>
          )}
          <ul className="card-list">
            {events.map((e) => (
              <li key={String(e._id)}>
                <EventCard event={toEventCard(e)} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
