"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CircleAlert, KeyRound, MessagesSquare, Plus, RefreshCw, Trash } from "lucide-react";
import { STATUSES, STATUS_ORGANIZER_LABELS, formatDate } from "@/lib/labels";
import { addMyEvent, getMyEvents, organizerKeys, removeMyEvent, useLocal } from "@/lib/local";
import Button from "./ui/Button";
import Card from "./ui/Card";
import RequestCard from "./RequestCard";

/** Organizer tab: requests across this device's events (grouped by status), events, chats. */
export default function OrganizerDashboard() {
  const [myEvents, loaded] = useLocal(getMyEvents, []);
  const [data, setData] = useState({ events: [], requests: [] });
  const [unreadChats, setUnreadChats] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const keys = organizerKeys();
    if (!keys.length) {
      setData({ events: [], requests: [] });
      setUnreadChats(0);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const post = (url) =>
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keys }) }).then(
          async (r) => (r.ok ? r.json() : Promise.reject(new Error((await r.json()).error)))
        );
      const [reqs, chats] = await Promise.all([post("/api/organizer/requests"), post("/api/organizer/chats")]);
      setData(reqs);
      setUnreadChats(chats.unread);
    } catch (err) {
      setError(err.message || "Couldn't load your requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loaded) load();
  }, [loaded, myEvents.length, load]);

  const keyFor = (eventId) => myEvents.find((e) => e.eventId === String(eventId))?.organizerKey ?? "";
  // Events whose key is saved here but didn't match on the server (wrong key or deleted event).
  const verified = new Set(data.events.map((e) => e._id));
  const unverified = loaded && !loading ? myEvents.filter((e) => !verified.has(e.eventId)) : [];

  if (!loaded) return <p className="muted">Loading…</p>;

  return (
    <div className="split">
      <section aria-labelledby="org-requests-heading" className="stack">
        <div className="toolbar">
          <h2 id="org-requests-heading">Requests</h2>
          <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </Button>
        </div>
        <p role="status" className="muted">
          {message}
        </p>
        {error && (
          <p role="alert" className="error-text">
            <CircleAlert aria-hidden="true" focusable="false" />
            {error}
          </p>
        )}
        {!myEvents.length && <p>Add an event (create one, or paste its organizer key) to see its requests here.</p>}
        {myEvents.length > 0 && !data.requests.length && !loading && <p>No requests yet across your events.</p>}

        {STATUSES.map((status) => {
          const list = data.requests.filter((r) => r.status === status);
          if (!list.length) return null;
          return (
            <section key={status} aria-labelledby={`grp-${status}`}>
              <h3 id={`grp-${status}`} className="group-heading">
                {STATUS_ORGANIZER_LABELS[status]} ({list.length})
              </h3>
              <ul className="queue">
                {list.map((r) => (
                  <RequestCard
                    key={String(r._id)}
                    request={r}
                    organizerKey={keyFor(r.eventId)}
                    showEvent
                    onSaved={(s) => {
                      setMessage(`Request marked “${STATUS_ORGANIZER_LABELS[s]}”. The attendee will see it on their status page.`);
                      load();
                    }}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </section>

      <div className="stack">
        <Card as="nav" aria-label="Organizer shortcuts" className="org-panel">
          <Button href="/organizer/chats" variant={unreadChats ? "primary" : "secondary"} icon={MessagesSquare} block>
            Chats ({unreadChats})
            <span className="visually-hidden"> unread</span>
          </Button>
          <Button href="/organizer/new" variant="secondary" icon={Plus} block>
            Create event
          </Button>
        </Card>

        <section aria-labelledby="my-events-heading" className="stack">
          <h2 id="my-events-heading">Your events</h2>
          {!myEvents.length ? (
            <p>No events on this device yet.</p>
          ) : (
            <ul className="card-list">
              {myEvents.map((e) => {
                const ev = data.events.find((x) => x._id === e.eventId);
                const count = data.requests.filter((r) => String(r.eventId) === e.eventId && r.status === "awaiting").length;
                const bad = unverified.some((u) => u.eventId === e.eventId);
                return (
                  <Card as="li" key={e.eventId}>
                    <h3 className="h3">
                      <Link href={`/organizer/${e.eventId}`}>{ev?.name ?? e.name ?? "Event"}</Link>
                    </h3>
                    {ev && <p className="muted">{formatDate(ev.startsAt)}</p>}
                    {ev && <p>{count ? `${count} awaiting a response` : "Nothing awaiting a response"}</p>}
                    {bad && (
                      <p className="error-text">
                        <CircleAlert aria-hidden="true" focusable="false" />
                        The saved key doesn&apos;t match this event any more (or the event was deleted).
                      </p>
                    )}
                    <div className="button-row">
                      <Button variant="ghost" icon={Trash} onClick={() => removeMyEvent(e.eventId)}>
                        Remove from this device
                        <span className="visually-hidden">: {ev?.name ?? e.name ?? "event"}</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </ul>
          )}
          <AddEventByKey />
        </section>
      </div>
    </div>
  );
}

/** Add an event to this device by pasting its organizer key. */
function AddEventByKey() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/organizer/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addMyEvent({ eventId: data._id, organizerKey: key.trim(), name: data.name });
      setKey("");
      setStatus(`Added “${data.name}”.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card as="form" onSubmit={add} aria-labelledby="add-key-heading" noValidate>
      <h3 id="add-key-heading" className="h3 section-heading">
        <KeyRound aria-hidden="true" focusable="false" />
        Add an event with its key
      </h3>
      <div className="field">
        <label htmlFor="add-key">Organizer key</label>
        <p id="add-key-hint" className="hint">For an event you created on another device. The key is saved only here.</p>
        <input
          id="add-key"
          type="password"
          autoComplete="off"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          aria-describedby={error ? "add-key-hint add-key-error" : "add-key-hint"}
          aria-invalid={!!error}
        />
      </div>
      {error && (
        <p id="add-key-error" role="alert" className="error-text">
          <CircleAlert aria-hidden="true" focusable="false" />
          {error}
        </p>
      )}
      <p role="status" className="muted">
        {status}
      </p>
      <Button type="submit" disabled={!key.trim() || busy}>
        {busy ? "Checking…" : "Add event"}
      </Button>
    </Card>
  );
}
