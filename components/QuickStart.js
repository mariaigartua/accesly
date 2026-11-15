"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, CalendarPlus, ChevronRight, CircleAlert, MapPin, Navigation, ShieldCheck, UserRound } from "lucide-react";
import { DESTINATIONS, destinationHref, keywordRoute } from "@/lib/start";
import Button from "./ui/Button";
import Card from "./ui/Card";

const ICONS = {
  "create-event": CalendarPlus,
  "find-events": CalendarDays,
  "find-location": MapPin,
  "ask-ally": Navigation,
  "set-up-profile": UserRound,
  privacy: ShieldCheck,
};

const EXAMPLES = [
  "Create an event for my club",
  "Find an accessible event this week",
  "Can I get to the library without stairs?",
  "Set up my accessibility needs",
];

/**
 * Quick start: describe what you want → AI picks ONE fixed destination → the person confirms
 * with a "Go" link (no automatic page change; WCAG 3.2.2). Falls back to keyword matching,
 * then to the full list of destinations.
 */
export default function QuickStart() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { destination, prefill, explanation }
  const [showAll, setShowAll] = useState(false);
  const resultRef = useRef(null);
  const inputRef = useRef(null);

  async function route(value) {
    const t = value.trim();
    if (!t) {
      setError("Tell us what you'd like to do.");
      inputRef.current?.focus();
      return;
    }
    setText(t);
    setError("");
    setShowAll(false);
    setLoading(true);
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch {
      // Server unreachable: route in the browser with keywords instead.
      setResult({ ...keywordRoute(t), explanation: "" });
    } finally {
      setLoading(false);
      requestAnimationFrame(() => resultRef.current?.focus());
    }
  }

  const dest = result ? DESTINATIONS[result.destination] : null;
  const Icon = result ? ICONS[result.destination] : null;

  return (
    <>
      <Card as="form" onSubmit={(e) => { e.preventDefault(); route(text); }} noValidate>
        <div className="field">
          <label htmlFor="start-text">What would you like to do?</label>
          <p id="start-hint" className="hint">Say it in your own words. We&apos;ll suggest where to go, and you choose.</p>
          <textarea
            id="start-text"
            ref={inputRef}
            rows={3}
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "start-hint start-error" : "start-hint"}
          />
        </div>
        {error && (
          <p id="start-error" role="alert" className="error-text">
            <CircleAlert aria-hidden="true" focusable="false" />
            {error}
          </p>
        )}
        <div className="suggestions" role="group" aria-label="Examples">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="chip-button" onClick={() => route(ex)} disabled={loading}>
              {ex}
            </button>
          ))}
        </div>
        <Button type="submit" variant="cta" disabled={loading}>
          {loading ? "Finding the right place…" : "Find where to go"}
        </Button>
      </Card>

      <div aria-live="polite">
        {loading && (
          <p className="thinking mt-md">
            <span className="spinner" aria-hidden="true" />
            Finding the right place…
          </p>
        )}
      </div>

      {result && !loading && (
        <section className="start-result stack" aria-labelledby="start-result-heading" ref={resultRef} tabIndex={-1}>
          <Card tint>
            <h2 id="start-result-heading" className="section-heading">
              <Icon aria-hidden="true" focusable="false" />
              <span>
                I&apos;ll take you to <strong>{dest.label}</strong>.
              </span>
            </h2>
            <p>{result.explanation || dest.text}</p>
            <div className="button-row">
              <Button href={destinationHref(result.destination, result.prefill)} variant="cta">
                Go<span className="visually-hidden"> to {dest.label}</span>
              </Button>
              <Button variant="secondary" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll} aria-controls="all-destinations">
                Choose something else
              </Button>
            </div>
          </Card>
          {showAll && <DestinationList id="all-destinations" />}
        </section>
      )}

      <p className="mt-xl">
        First time? <Link href="/privacy">Read how we protect your privacy</Link>.
      </p>
    </>
  );
}

function DestinationList({ id }) {
  return (
    <nav id={id} aria-label="All destinations">
      <ul className="dest-list">
        {Object.entries(DESTINATIONS).map(([key, d], i) => {
          const Icon = ICONS[key];
          return (
            <li key={key}>
              <Link href={destinationHref(key)} className="dest-link">
                <span className={`row-thumb c${i % 3}`} aria-hidden="true">
                  <Icon focusable="false" />
                </span>
                <span className="row-body">
                  <span className="option-title">{d.label}</span>
                  <span className="option-meta">{d.text}</span>
                </span>
                <ChevronRight className="row-chevron" aria-hidden="true" focusable="false" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
