"use client";

import { useState } from "react";
import { CircleAlert, Send } from "lucide-react";
import { formatDate } from "@/lib/labels";
import Button from "./ui/Button";

/**
 * Messages of one attendee ↔ organizer chat plus a reply box.
 * viewer: "attendee" | "organizer" (whose messages count as "You").
 * onSend(text) must return a promise; throw to show an error.
 */
export default function ChatThread({ messages, viewer, onSend, idPrefix = "chat" }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError("Write a message.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await onSend(text.trim());
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  const otherName = viewer === "attendee" ? "Organizer" : "Attendee";
  return (
    <>
      <ol className="chat-log" aria-live="polite" aria-relevant="additions" aria-label="Messages">
        {messages.map((m, i) => {
          const mine = m.from === viewer;
          return (
            <li key={i} className={`msg ${mine ? "msg-user" : "msg-assistant"}`}>
              <p className="msg-meta">
                <strong>{mine ? "You" : otherName}</strong>
                {m.createdAt && <> · {formatDate(m.createdAt)}</>}
              </p>
              <p>{m.text}</p>
            </li>
          );
        })}
      </ol>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor={`${idPrefix}-reply`}>Your reply</label>
          <textarea
            id={`${idPrefix}-reply`}
            rows={3}
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? `${idPrefix}-error` : undefined}
          />
        </div>
        {error && (
          <p id={`${idPrefix}-error`} role="alert" className="error-text">
            <CircleAlert aria-hidden="true" focusable="false" />
            {error}
          </p>
        )}
        <Button type="submit" icon={Send} disabled={sending}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </form>
    </>
  );
}
