"use client";

import { useEffect, useState } from "react";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";

// React 19: `ref` is a normal prop for function components.
export default function RequestForm({ eventId, prefillType, prefillNote, ref }) {
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [shareContact, setShareContact] = useState(false);
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  // When the chat suggests a request, fill in the form.
  useEffect(() => {
    if (prefillType) setType(prefillType);
    if (prefillNote) setNote(prefillNote);
  }, [prefillType, prefillNote]);

  async function submit(e) {
    e.preventDefault();
    if (!type) {
      setError("Choose what you need.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, type, note, contact: shareContact ? contact : "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setToken(data.accessToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const statusPath = token ? `/requests/${token}` : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${statusPath}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section aria-labelledby="request-heading" className="card" ref={ref} tabIndex={-1}>
      <h2 id="request-heading">Request an accommodation</h2>
      <p className="muted">
        Tell the organizer what you need, not why. Your name is only shared if you choose to.
      </p>

      {token ? (
        <div role="status" className="success">
          <p>
            <strong>Request sent.</strong> Save this private link to check its status. It&apos;s the only way
            to find your request, because we don&apos;t store who sent it.
          </p>
          <p>
            <a href={statusPath}>View my request status</a>
          </p>
          <button type="button" className="button-secondary" onClick={copyLink}>
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="req-type">What do you need?</label>
            <select
              id="req-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-invalid={!!error && !type}
              aria-describedby={error ? "req-error" : undefined}
            >
              <option value="">Choose one</option>
              {Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="req-note">Details (optional)</label>
            <textarea
              id="req-note"
              rows={3}
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="field checkbox">
            <input
              id="req-share"
              type="checkbox"
              checked={shareContact}
              onChange={(e) => setShareContact(e.target.checked)}
            />
            <label htmlFor="req-share">Share a name or email so the organizer can contact me</label>
          </div>

          {shareContact && (
            <div className="field">
              <label htmlFor="req-contact">Name or email</label>
              <input
                id="req-contact"
                type="text"
                autoComplete="email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
          )}

          {error && (
            <p id="req-error" role="alert" className="error">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? "Sending…" : shareContact ? "Send request" : "Send anonymous request"}
          </button>
        </form>
      )}
    </section>
  );
}
