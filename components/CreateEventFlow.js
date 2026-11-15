"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, CircleAlert, Copy, KeyRound, MapPinOff, Plus, Search, TriangleAlert } from "lucide-react";
import { addMyEvent } from "@/lib/local";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Notice from "./ui/Notice";
import Stepper from "./ui/Stepper";
import { Segmented } from "./ui/Pickers";

const STEPS = ["Event details", "Location", "Accessibility questions"];
const ANSWERS = [
  ["yes", "Yes"],
  ["no", "No"],
  ["unsure", "Not sure"],
];
const ANSWER_TEXT = { yes: "Yes", no: "No", unsure: "Not sure yet" };

function ErrorText({ id, children }) {
  return (
    <p id={id} className="error-text">
      <CircleAlert aria-hidden="true" focusable="false" />
      {children}
    </p>
  );
}

/** Combines a date ("2026-11-20") and time ("18:00") in the organizer's local time zone. */
const toDate = (date, time) => (date && time ? new Date(`${date}T${time}`) : null);

/**
 * Create event: 1) details 2) location 3) AI follow-up questions → publish → organizer key.
 * `prefill` = { name, description } from the URL (e.g. from Quick start); never stored.
 */
export default function CreateEventFlow({ prefill = {} }) {
  const [step, setStep] = useState(1); // 1..3, then 4 = published
  const headingRef = useRef(null);
  const firstRender = useRef(true);

  // Step 1
  const [details, setDetails] = useState({
    name: prefill.name ?? "",
    org: "",
    date: "",
    start: "",
    end: "",
    description: prefill.description ?? "",
  });
  const [errors, setErrors] = useState({});

  // Step 2
  const [spaceQuery, setSpaceQuery] = useState("");
  const [spaces, setSpaces] = useState(null); // null = not loaded yet
  const [spaceId, setSpaceId] = useState(""); // "" = no location yet
  const [addingSpace, setAddingSpace] = useState(false);
  const [newSpace, setNewSpace] = useState({ building: "", room: "" });
  const [spaceError, setSpaceError] = useState("");

  // Step 3
  const [questions, setQuestions] = useState(null); // null = loading
  const [questionSource, setQuestionSource] = useState("");
  const [answers, setAnswers] = useState({}); // id → { choice, details }
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  // Result
  const [created, setCreated] = useState(null); // { _id, organizerKey, name }
  const [copied, setCopied] = useState(false);

  // Move focus to the new step's heading so keyboard and screen-reader users know where they are.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const setD = (field, value) => setDetails((d) => ({ ...d, [field]: value }));

  // ---------- Step 1 ----------
  function nextFromDetails(e) {
    e.preventDefault();
    const errs = {};
    if (!details.name.trim()) errs.name = "Add the event name.";
    if (!details.date) errs.date = "Choose the date.";
    if (!details.start) errs.start = "Choose the start time.";
    const startsAt = toDate(details.date, details.start);
    const endsAt = toDate(details.date, details.end);
    if (startsAt && endsAt && endsAt <= startsAt) errs.end = "The end time must be after the start time.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`ev-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStep(2);
    if (spaces === null) searchSpaces("");
  }

  // ---------- Step 2 ----------
  async function searchSpaces(q) {
    setSpaceError("");
    try {
      const res = await fetch(`/api/spaces?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      setSpaces(await res.json());
    } catch {
      setSpaceError("Couldn't load saved places. You can still add a new one or continue without a location.");
      setSpaces([]);
    }
  }

  async function addSpace(e) {
    e.preventDefault();
    if (!newSpace.building.trim()) {
      setSpaceError("Add the building name.");
      document.getElementById("new-building")?.focus();
      return;
    }
    setSpaceError("");
    try {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ building: newSpace.building, room: newSpace.room }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const id = String(data._id);
      setSpaces((list) => [{ ...data, _id: id }, ...(list ?? [])]);
      setSpaceId(id);
      setAddingSpace(false);
      setNewSpace({ building: "", room: "" });
    } catch (err) {
      setSpaceError(err.message || "Couldn't save the place.");
    }
  }

  async function nextFromLocation() {
    setStep(3);
    setQuestions(null);
    try {
      const res = await fetch("/api/events/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: details.name, description: details.description, spaceId: spaceId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
      setQuestionSource(data.source);
    } catch {
      setQuestions([]);
      setQuestionSource("error");
    }
  }

  // ---------- Step 3 ----------
  const setAnswer = (id, patch) => setAnswers((a) => ({ ...a, [id]: { choice: "", details: "", ...a[id], ...patch } }));
  const answeredCount = Object.values(answers).filter((a) => a.choice || a.details.trim()).length;

  async function publish() {
    setPublishing(true);
    setPublishError("");
    const accessibility = {};
    for (const q of questions ?? []) {
      const a = answers[q.id];
      if (!a || (!a.choice && !a.details.trim())) continue; // skipped
      const parts = [a.choice ? ANSWER_TEXT[a.choice] : "", a.details.trim()].filter(Boolean);
      accessibility[q.id] = parts.join(". ");
    }
    const startsAt = toDate(details.date, details.start);
    const endsAt = toDate(details.date, details.end);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name,
          org: details.org,
          description: details.description,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt ? endsAt.toISOString() : null,
          spaceId: spaceId || null,
          accessibility,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't publish the event.");
      const id = String(data._id);
      // Save the key on this device so the Organizer tab can open this event's requests and chats.
      addMyEvent({ eventId: id, organizerKey: data.organizerKey, name: data.name });
      setCreated({ _id: id, organizerKey: data.organizerKey, name: data.name });
      setStep(4);
    } catch (err) {
      setPublishError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(created.organizerKey);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  // ---------- Render ----------
  if (step === 4 && created) {
    return (
      <div className="stack">
        <Notice tone="success" title="Your event is published" role="status">
          <p>“{created.name}” is live. Attendees can now see its accessibility info, ask questions and send requests.</p>
        </Notice>
        <Card as="section" aria-labelledby="key-heading">
          <h2 id="key-heading" ref={headingRef} tabIndex={-1} className="section-heading">
            <KeyRound aria-hidden="true" focusable="false" />
            Your organizer key
          </h2>
          <p>
            This key is your password for this event&apos;s requests and chats. We saved it in this browser, so it already
            appears in your Organizer tab.
          </p>
          <div className="key-box">
            <code id="org-key-value">{created.organizerKey}</code>
            <Button variant="secondary" icon={Copy} onClick={copyKey} aria-describedby="org-key-value">
              {copied ? "Copied" : "Copy key"}
            </Button>
          </div>
          <p className="visually-hidden" role="status">
            {copied ? "Key copied to clipboard." : ""}
          </p>
          <Notice tone="warning" title="We only show it once" className="mt-md">
            <p>Copy it somewhere safe if you&apos;ll manage this event from another device. We can&apos;t recover it.</p>
          </Notice>
        </Card>
        <div className="button-row">
          <Button href={`/organizer/${created._id}`} variant="cta">
            Open request queue
          </Button>
          <Button href={`/events/${created._id}`} variant="secondary">
            View the event page
          </Button>
          <Button href="/organizer" variant="ghost">
            Back to Organizer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Stepper steps={STEPS} current={step} />

      {step === 1 && (
        <Card as="form" onSubmit={nextFromDetails} noValidate aria-labelledby="step-heading">
          <h2 id="step-heading" ref={headingRef} tabIndex={-1}>
            Event details
          </h2>
          {Object.keys(errors).length > 0 && (
            <p role="alert" className="error-text">
              <CircleAlert aria-hidden="true" focusable="false" />
              Fix {Object.keys(errors).length === 1 ? "1 field" : `${Object.keys(errors).length} fields`} below.
            </p>
          )}
          <div className="field">
            <label htmlFor="ev-name">Event name (required)</label>
            <input
              id="ev-name"
              type="text"
              value={details.name}
              maxLength={200}
              onChange={(e) => setD("name", e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "ev-name-err" : undefined}
              required
            />
            {errors.name && <ErrorText id="ev-name-err">{errors.name}</ErrorText>}
          </div>
          <div className="field">
            <label htmlFor="ev-org">Club or organization</label>
            <input id="ev-org" type="text" value={details.org} maxLength={200} onChange={(e) => setD("org", e.target.value)} autoComplete="organization" />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="ev-date">Date (required)</label>
              <input
                id="ev-date"
                type="date"
                value={details.date}
                onChange={(e) => setD("date", e.target.value)}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "ev-date-err" : undefined}
                required
              />
              {errors.date && <ErrorText id="ev-date-err">{errors.date}</ErrorText>}
            </div>
            <div className="field">
              <label htmlFor="ev-start">Start time (required)</label>
              <input
                id="ev-start"
                type="time"
                value={details.start}
                onChange={(e) => setD("start", e.target.value)}
                aria-invalid={!!errors.start}
                aria-describedby={errors.start ? "ev-start-err" : undefined}
                required
              />
              {errors.start && <ErrorText id="ev-start-err">{errors.start}</ErrorText>}
            </div>
            <div className="field">
              <label htmlFor="ev-end">End time</label>
              <input
                id="ev-end"
                type="time"
                value={details.end}
                onChange={(e) => setD("end", e.target.value)}
                aria-invalid={!!errors.end}
                aria-describedby={errors.end ? "ev-end-err" : undefined}
              />
              {errors.end && <ErrorText id="ev-end-err">{errors.end}</ErrorText>}
            </div>
          </div>
          <div className="field">
            <label htmlFor="ev-desc">Description</label>
            <p id="ev-desc-hint" className="hint">What will happen? The AI uses this to suggest accessibility questions.</p>
            <textarea
              id="ev-desc"
              rows={4}
              maxLength={3000}
              value={details.description}
              onChange={(e) => setD("description", e.target.value)}
              aria-describedby="ev-desc-hint"
            />
          </div>
          <div className="step-actions">
            <span />
            <Button type="submit" variant="cta">
              Next: location
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card as="section" aria-labelledby="step-heading">
          <h2 id="step-heading" ref={headingRef} tabIndex={-1}>
            Where is it?
          </h2>
          <p className="muted">Pick a saved place so attendees see what we already know about it.</p>

          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              searchSpaces(spaceQuery);
            }}
            className="field"
          >
            <label htmlFor="space-q">Search saved places</label>
            <div className="pill-field on-card">
              <Search aria-hidden="true" focusable="false" />
              <input id="space-q" type="search" value={spaceQuery} onChange={(e) => setSpaceQuery(e.target.value)} placeholder="e.g. library, Room 101" autoComplete="off" />
              <button type="submit" className="icon-btn" aria-label="Search places">
                <Search aria-hidden="true" focusable="false" />
              </button>
            </div>
          </form>

          {spaceError && (
            <p role="alert" className="error-text">
              <CircleAlert aria-hidden="true" focusable="false" />
              {spaceError}
            </p>
          )}

          <fieldset className="field">
            <legend className="label">Location</legend>
            {spaces === null ? (
              <p className="muted">Loading places…</p>
            ) : (
              <ul className="option-list">
                {spaces.map((s, i) => {
                  const id = String(s._id);
                  return (
                    <li key={id}>
                      <label className="option">
                        <input type="radio" name="space" value={id} checked={spaceId === id} onChange={() => setSpaceId(id)} />
                        <span className={`row-thumb c${i % 3}`} aria-hidden="true">
                          <Building2 focusable="false" />
                        </span>
                        <span>
                          <span className="option-title">{[s.building, s.room].filter(Boolean).join(", ")}</span>
                          <span className="option-meta">
                            {Object.keys(s.features ?? {}).length
                              ? `${Object.keys(s.features).length} accessibility details on file`
                              : "No accessibility details on file yet"}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
                {spaces.length === 0 && <li className="muted">No saved places match. Add it below.</li>}
                <li>
                  <label className="option">
                    <input type="radio" name="space" value="" checked={spaceId === ""} onChange={() => setSpaceId("")} />
                    <span className="row-thumb c2" aria-hidden="true">
                      <MapPinOff focusable="false" />
                    </span>
                    <span>
                      <span className="option-title">No location yet</span>
                      <span className="option-meta">Attendees will see “location to be announced”.</span>
                    </span>
                  </label>
                </li>
              </ul>
            )}
          </fieldset>

          {addingSpace ? (
            <form onSubmit={addSpace} noValidate className="card card-tint">
              <h3 className="h3">Add a new place</h3>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="new-building">Building (required)</label>
                  <input id="new-building" type="text" value={newSpace.building} maxLength={200} onChange={(e) => setNewSpace((n) => ({ ...n, building: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="new-room">Room</label>
                  <input id="new-room" type="text" value={newSpace.room} maxLength={100} onChange={(e) => setNewSpace((n) => ({ ...n, room: e.target.value }))} />
                </div>
              </div>
              <p className="hint">Only add facts you&apos;ve checked. Accessibility details for the place can be added later.</p>
              <div className="button-row">
                <Button type="submit">Save place</Button>
                <Button variant="secondary" onClick={() => setAddingSpace(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button variant="secondary" icon={Plus} onClick={() => setAddingSpace(true)}>
              Add a new place
            </Button>
          )}

          <div className="step-actions">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="cta" onClick={nextFromLocation}>
              Next: questions
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card as="section" aria-labelledby="step-heading">
          <h2 id="step-heading" ref={headingRef} tabIndex={-1}>
            Accessibility questions
          </h2>
          <p className="muted">
            Answer what you can and skip the rest. Answers appear on your event page, and the event chat uses only these
            answers, so be accurate.
          </p>

          <div aria-live="polite">
            {questions === null && (
              <p className="thinking">
                <span className="spinner" aria-hidden="true" />
                Writing questions for your event…
              </p>
            )}
            {questionSource === "fallback" && (
              <Notice tone="info" title="Standard questions">
                <p>The AI is busy right now, so these are our standard questions. They cover the most common needs.</p>
              </Notice>
            )}
            {questionSource === "error" && (
              <Notice tone="warning" title="Couldn't load questions">
                <p>You can still publish now and add details later, or go back and try again.</p>
              </Notice>
            )}
          </div>

          {questions?.length > 0 && (
            <>
              {questions.map((q) => {
                const a = answers[q.id] ?? { choice: "", details: "" };
                return (
                  <fieldset key={q.id} className="question" aria-describedby={q.why ? `why-${q.id}` : undefined}>
                    <legend>{q.question}</legend>
                    {q.why && (
                      <p id={`why-${q.id}`} className="hint">
                        {q.why}
                      </p>
                    )}
                    <Segmented name={`q-${q.id}`} options={ANSWERS} value={a.choice} onChange={(v) => setAnswer(q.id, { choice: v })} />
                    <div className="field mt-md">
                      <label htmlFor={`d-${q.id}`}>Details (optional)</label>
                      <input id={`d-${q.id}`} type="text" maxLength={500} value={a.details} onChange={(e) => setAnswer(q.id, { details: e.target.value })} />
                    </div>
                    {(a.choice || a.details) && (
                      <Button variant="ghost" onClick={() => setAnswer(q.id, { choice: "", details: "" })}>
                        Clear answer<span className="visually-hidden"> to: {q.question}</span>
                      </Button>
                    )}
                  </fieldset>
                );
              })}
              <p className="muted" role="status">
                {answeredCount} of {questions.length} answered. Unanswered questions show as “not confirmed”.
              </p>
            </>
          )}

          {publishError && (
            <p role="alert" className="error-text">
              <TriangleAlert aria-hidden="true" focusable="false" />
              {publishError}
            </p>
          )}

          <div className="step-actions">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button variant="cta" onClick={publish} disabled={publishing || questions === null}>
              {publishing ? "Publishing…" : "Publish event"}
            </Button>
          </div>
        </Card>
      )}

      {step < 4 && (
        <p className="muted mt-md">
          Already have an event? <Link href="/organizer">Go to your Organizer tab</Link>.
        </p>
      )}
    </>
  );
}
