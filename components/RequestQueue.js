"use client";

import { useState } from "react";
import { REQUEST_TYPE_LABELS, STATUS_LABELS, formatDate } from "@/lib/labels";

export default function RequestQueue({ eventId }) {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [requests, setRequests] = useState([]);
  const [replies, setReplies] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(k = key) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/requests?eventId=${eventId}`, { headers: { "x-organizer-key": k } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error === "not authorized" ? "That organizer key doesn't match this event." : data.error);
      setRequests(data);
      setUnlocked(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function update(id, status) {
    setMessage("");
    const res = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-organizer-key": key },
      body: JSON.stringify({ status, organizerReply: replies[id] ?? "" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setMessage(`Request marked "${STATUS_LABELS[status]}". The attendee will see it on their status page.`);
    load();
  }

  if (!unlocked) {
    return (
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <div className="field">
          <label htmlFor="org-key">Organizer key</label>
          <input
            id="org-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
            aria-describedby="org-key-help"
          />
          <p id="org-key-help" className="muted">You got this key when you created the event.</p>
        </div>
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" disabled={!key || loading}>{loading ? "Checking…" : "Open requests"}</button>
      </form>
    );
  }

  return (
    <>
      <p role="status" className="muted">
        {message || `${requests.length} request${requests.length === 1 ? "" : "s"}. Requests show needs only, never a diagnosis.`}
      </p>
      {error && <p role="alert" className="error">{error}</p>}
      <button type="button" className="button-secondary" onClick={() => load()}>Refresh</button>

      {requests.length === 0 && <p>No requests yet.</p>}

      <ul className="queue">
        {requests.map((r) => {
          const id = String(r._id);
          return (
            <li key={id} className="card">
              <h2 className="h3">{REQUEST_TYPE_LABELS[r.type] ?? r.type}</h2>
              <p className={`badge badge-${r.status}`}>{STATUS_LABELS[r.status] ?? r.status}</p>
              {r.note && <p>{r.note}</p>}
              <p className="muted">
                {r.contact ? <>Contact shared: {r.contact}</> : "Anonymous"} · sent {formatDate(r.createdAt)}
              </p>
              <div className="field">
                <label htmlFor={`reply-${id}`}>Reply to attendee (optional)</label>
                <textarea
                  id={`reply-${id}`}
                  rows={2}
                  value={replies[id] ?? r.organizerReply ?? ""}
                  onChange={(e) => setReplies((s) => ({ ...s, [id]: e.target.value }))}
                />
              </div>
              <div className="row">
                <button type="button" onClick={() => update(id, "confirmed")}>Confirm</button>
                <button type="button" className="button-secondary" onClick={() => update(id, "cannot-accommodate")}>
                  Can&apos;t accommodate
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
