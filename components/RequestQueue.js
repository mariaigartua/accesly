"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleAlert, KeyRound, RefreshCw } from "lucide-react";
import { STATUS_ORGANIZER_LABELS } from "@/lib/labels";
import { addMyEvent, keyForEvent } from "@/lib/local";
import Button from "./ui/Button";
import Card from "./ui/Card";
import RequestCard from "./RequestCard";

function ErrorText({ children }) {
  return (
    <p role="alert" className="error-text">
      <CircleAlert aria-hidden="true" focusable="false" />
      {children}
    </p>
  );
}

/** Per-event request queue. Uses the key saved on this device, or asks for it. */
export default function RequestQueue({ eventId, eventName }) {
  const [key, setKey] = useState("");
  const [remember, setRemember] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (k, { save = false } = {}) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/requests?eventId=${eventId}`, { headers: { "x-organizer-key": k } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error === "not authorized" ? "That organizer key doesn't match this event." : data.error);
        setRequests(data);
        setUnlocked(true);
        if (save) addMyEvent({ eventId, organizerKey: k, name: eventName });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [eventId, eventName]
  );

  // If this device already has the key, open the queue straight away.
  useEffect(() => {
    const saved = keyForEvent(eventId);
    if (saved) {
      setKey(saved);
      load(saved);
    }
  }, [eventId, load]);

  if (!unlocked) {
    return (
      <Card
        as="form"
        aria-labelledby="unlock-heading"
        onSubmit={(e) => {
          e.preventDefault();
          load(key.trim(), { save: remember });
        }}
      >
        <h2 id="unlock-heading" className="section-heading">
          <KeyRound aria-hidden="true" focusable="false" />
          Open your request queue
        </h2>
        <div className="field">
          <label htmlFor="org-key">Organizer key</label>
          <p id="org-key-help" className="hint">You got this key when you created the event.</p>
          <input
            id="org-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
            aria-describedby="org-key-help"
            aria-invalid={!!error}
          />
        </div>
        <div className="field field-check">
          <input id="org-remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <label htmlFor="org-remember">Remember this event on this device (adds it to your Organizer tab)</label>
        </div>
        {error && <ErrorText>{error}</ErrorText>}
        <Button type="submit" disabled={!key || loading}>
          {loading ? "Checking…" : "Open requests"}
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="toolbar">
        <p role="status" className="muted">
          {message ||
            `${requests.length} request${requests.length === 1 ? "" : "s"}. Requests show needs only, never a diagnosis.`}
        </p>
        <Button variant="secondary" icon={RefreshCw} onClick={() => load(key)}>
          Refresh
        </Button>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
      {requests.length === 0 && <p>No requests yet.</p>}
      <ul className="queue">
        {requests.map((r) => (
          <RequestCard
            key={String(r._id)}
            request={r}
            organizerKey={key}
            onSaved={(status) => {
              setMessage(`Request marked “${STATUS_ORGANIZER_LABELS[status]}”. The attendee will see it on their status page.`);
              load(key);
            }}
          />
        ))}
      </ul>
    </>
  );
}
