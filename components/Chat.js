"use client";

import { useState } from "react";
import { CircleHelp, MessagesSquare, Send } from "lucide-react";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";
import Button from "./ui/Button";
import Card from "./ui/Card";

const SUGGESTIONS = [
  "Is there a step-free entrance?",
  "How loud will it be?",
  "Will there be captions?",
  "Is the food labeled for allergens?",
];

export default function Chat({ eventId, eventName, onRequest }) {
  const [messages, setMessages] = useState([]); // { role: "user" | "assistant", text, meta? }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(question) {
    const q = question.trim();
    if (!q || loading) return;
    const history = messages.map(({ role, text }) => ({ role, text }));
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: data.answer ?? data.error ?? "Something went wrong.",
          meta: { ...data, question: q },
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "I couldn't reach the server. You can still send an anonymous request below.",
          meta: { suggestRequest: true, question: q },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card as="section" aria-labelledby="chat-heading">
      <h2 id="chat-heading" className="section-heading">
        <MessagesSquare aria-hidden="true" focusable="false" />
        Ask about this event
      </h2>
      <p className="muted">Answers come only from what the organizer shared. Nothing you type here is saved.</p>

      {messages.length === 0 && (
        <div className="suggestions" role="group" aria-label="Example questions">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="chip-button" onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* aria-live announces new answers to screen readers. */}
      <ol className="chat-log" aria-live="polite" aria-relevant="additions">
        {messages.map((m, i) => (
          <li key={i} className={`msg msg-${m.role}`}>
            <span className="visually-hidden">{m.role === "user" ? "You asked:" : "Answer:"}</span>
            <p>{m.text}</p>
            {m.role === "assistant" && m.meta && m.meta.confirmed === false && (
              <p className="tag">
                <CircleHelp aria-hidden="true" focusable="false" />
                Not confirmed by the organizer
              </p>
            )}
            {m.role === "assistant" && m.meta?.suggestRequest && (
              <Button
                variant="secondary"
                onClick={() =>
                  onRequest({
                    type: REQUEST_TYPE_LABELS[m.meta.requestType] ? m.meta.requestType : "other",
                    note: m.meta.question,
                  })
                }
              >
                Send an anonymous request about this
              </Button>
            )}
          </li>
        ))}
        {loading && (
          <li className="msg msg-assistant" aria-busy="true">
            <p>Checking the event info…</p>
          </li>
        )}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <label htmlFor="chat-input">Your question about {eventName}</label>
        <div className="input-row">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Is there seating near the exit?"
            autoComplete="off"
          />
          <Button type="submit" icon={Send} disabled={loading || !input.trim()}>
            Ask
          </Button>
        </div>
      </form>
    </Card>
  );
}
