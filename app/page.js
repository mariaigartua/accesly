import { collections } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function Home() {
  let events = [];
  let error = null;
  try {
    const { events: col } = await collections();
    events = await col.find({}, { projection: { organizerKey: 0 } }).sort({ startsAt: 1 }).toArray();
  } catch (e) {
    error = e.message;
  }

  return (
    <>
      <h1>Upcoming events</h1>
      <p className="muted">
        Know before you go. Ask for what you need, without explaining why.
      </p>

      {error && (
        <p role="alert">
          Couldn&apos;t load events: {error}. Check your <code>.env.local</code> and open{" "}
          <a href="/api/health">/api/health</a>.
        </p>
      )}

      {!error && events.length === 0 && (
        <p>No events yet. Run <code>npm run seed</code> to add an example.</p>
      )}

      <ul>
        {events.map((e) => (
          <li key={String(e._id)}>
            <strong>{e.name}</strong>
            {e.org ? ` · ${e.org}` : ""}
            {" · "}
            <time dateTime={new Date(e.startsAt).toISOString()}>
              {new Date(e.startsAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </time>
          </li>
        ))}
      </ul>
    </>
  );
}
