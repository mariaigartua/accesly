"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUp, CalendarDays, CalendarPlus, ChevronRight, CircleAlert, Footprints, MapPin, Navigation, ShieldCheck, Sparkles, UserRound,
} from "lucide-react";
import { DESTINATIONS, destinationHref, keywordRoute } from "@/lib/start";
import Button from "./ui/Button";

const ICONS = {
  "create-event": CalendarPlus,
  "find-events": CalendarDays,
  "find-location": MapPin,
  "ask-ally": Navigation,
  "set-up-profile": UserRound,
  privacy: ShieldCheck,
};

const EXAMPLES = [
  { text: "Create an event for my club", icon: CalendarPlus },
  { text: "Find an accessible event this week", icon: CalendarDays },
  { text: "Can I get to the library without stairs?", icon: Footprints },
  { text: "Set up my accessibility needs", icon: UserRound },
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

  function onKeyDown(e) {
    // Enter sends, Shift+Enter adds a new line (explained in the hint below the box).
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      route(text);
    }
  }

  return (
    <div className="ally-chat">
      <section className="ally-hero start-hero" aria-labelledby="start-heading">
        <p className="start-eyebrow">
          <Sparkles aria-hidden="true" focusable="false" />
          Quick start
        </p>
        <h1 id="start-heading">
          Tell us what you want to do, we&apos;ll show you <span className="ally-name">where to go</span>.
        </h1>
        <p className="ally-hero-sub">Say it in your own words. We suggest a place in Accessly, and you choose.</p>
      </section>

      <section aria-labelledby="start-examples-heading">
        <h2 id="start-examples-heading" className="visually-hidden">
          Examples
        </h2>
        <ul className="ally-tiles">
          {EXAMPLES.map(({ text: ex, icon: ExIcon }) => (
            <li key={ex}>
              <button type="button" className="ally-tile" onClick={() => route(ex)} disabled={loading}>
                <span className="ally-tile-icon">
                  <ExIcon aria-hidden="true" focusable="false" />
                </span>
                {ex}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <form className="ally-composer" onSubmit={(e) => { e.preventDefault(); route(text); }} noValidate>
        <label htmlFor="start-text" className="ally-composer-label">
          What would you like to do?
        </label>
        <div className="ally-input-pill">
          <textarea
            id="start-text"
            ref={inputRef}
            rows={1}
            maxLength={1000}
            value={text}
            placeholder="e.g. Find a quiet event on Friday"
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            onKeyDown={onKeyDown}
            aria-invalid={!!error}
            aria-describedby={error ? "start-hint start-error" : "start-hint"}
          />
          <button type="submit" className="ally-send" disabled={loading} aria-label={loading ? "Finding the right place" : "Find where to go"}>
            {loading ? <span className="spinner" aria-hidden="true" /> : <ArrowUp aria-hidden="true" focusable="false" />}
          </button>
        </div>
        {error && (
          <p id="start-error" role="alert" className="error-text">
            <CircleAlert aria-hidden="true" focusable="false" />
            {error}
          </p>
        )}
        <p id="start-hint" className="hint">
          Enter to send, Shift+Enter for a new line. Nothing you type here is saved.
        </p>
      </form>

      <div aria-live="polite">
        {loading && (
          <p className="ally-typing">
            <span className="dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            Finding the right place…
          </p>
        )}
      </div>

      {result && !loading && (
        <section className="start-result stack" aria-labelledby="start-result-heading" ref={resultRef} tabIndex={-1}>
          <div className="start-answer">
            <span className="start-answer-icon" aria-hidden="true">
              <Icon focusable="false" />
            </span>
            <div className="start-answer-body">
              <h2 id="start-result-heading">
                I&apos;ll take you to <span className="ally-name">{dest.label}</span>.
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
            </div>
          </div>
          {showAll && <DestinationList id="all-destinations" />}
        </section>
      )}

      <p className="start-privacy">
        First time? <Link href="/privacy">Read how we protect your privacy</Link>.
      </p>
    </div>
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
