"use client";

import { useState } from "react";
import { CircleAlert, Save } from "lucide-react";
import { STATUSES, STATUS_ORGANIZER_LABELS } from "@/lib/labels";
import Button from "./ui/Button";

/**
 * Organizer's Respond/Update form for one request: pick a status + write a reply.
 * Calls PATCH /api/requests/:id with the event's organizer key, then onSaved(status).
 */
export default function RequestEditor({ request, organizerKey, onSaved, onCancel }) {
  const id = String(request._id);
  // "Respond" to a new request usually means starting work on it.
  const [status, setStatus] = useState(request.status === "awaiting" ? "in-progress" : request.status);
  const [reply, setReply] = useState(request.organizerReply ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-organizer-key": organizerKey },
        body: JSON.stringify({ status, organizerReply: reply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error === "not authorized" ? "Your saved key no longer matches this event." : data.error);
      onSaved?.(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="editor mt-md" noValidate>
      <fieldset className="field">
        <legend className="label">Status</legend>
        <div className="radio-row">
          {STATUSES.map((s) => (
            <div key={s} className="field-check">
              <input
                id={`st-${id}-${s}`}
                type="radio"
                name={`status-${id}`}
                value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
              />
              <label htmlFor={`st-${id}-${s}`}>{STATUS_ORGANIZER_LABELS[s]}</label>
            </div>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor={`reply-${id}`}>Reply to attendee</label>
        <p id={`reply-hint-${id}`} className="hint">
          They&apos;ll see this on their private status page. Don&apos;t ask why they need it.
        </p>
        <textarea
          id={`reply-${id}`}
          rows={3}
          maxLength={1000}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          aria-describedby={`reply-hint-${id}`}
        />
      </div>
      {error && (
        <p role="alert" className="error-text">
          <CircleAlert aria-hidden="true" focusable="false" />
          {error}
        </p>
      )}
      <div className="button-row">
        <Button type="submit" icon={Save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
