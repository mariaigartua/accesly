import { collections } from "@/lib/mongodb";
import EventCard from "@/components/ui/EventCard";
import Notice from "@/components/ui/Notice";

export const dynamic = "force-dynamic";

export default async function Home() {
  let events = [];
  let error = null;
  try {
    const { events: eventsCol, spaces } = await collections();
    const docs = await eventsCol.find({}, { projection: { organizerKey: 0 } }).sort({ startsAt: 1 }).toArray();
    const spaceIds = docs.map((e) => e.spaceId).filter(Boolean);
    const spaceDocs = spaceIds.length
      ? await spaces.find({ _id: { $in: spaceIds } }, { projection: { building: 1, room: 1 } }).toArray()
      : [];
    const where = Object.fromEntries(
      spaceDocs.map((s) => [String(s._id), [s.building, s.room].filter(Boolean).join(", ")])
    );
    // Only pass plain, serializable fields to the card.
    events = docs.map((e) => ({
      _id: String(e._id),
      name: e.name,
      org: e.org ?? "",
      startsAt: new Date(e.startsAt).toISOString(),
      location: e.spaceId ? where[String(e.spaceId)] ?? "" : "",
      accessibility: e.accessibility ?? {},
    }));
  } catch (e) {
    error = e.message;
  }

  return (
    <>
      <section className="hero">
        <img src="/brand/accessly-icon-web.svg" alt="" width={72} height={72} />
        <h1>Know before you go.</h1>
        <p className="lead">Ask for what you need, without explaining why.</p>
      </section>

      <section aria-labelledby="events-heading">
        <h2 id="events-heading">Upcoming events</h2>

        {error && (
          <Notice tone="error" title="Couldn't load events" role="alert">
            <p>
              {error}. Check your <code>.env.local</code> and open <a href="/api/health">/api/health</a>.
            </p>
          </Notice>
        )}

        {!error && events.length === 0 && (
          <p>
            No events yet. Run <code>npm run seed</code> to add an example.
          </p>
        )}

        <ul className="card-grid">
          {events.map((e) => (
            <li key={e._id}>
              <EventCard event={e} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
