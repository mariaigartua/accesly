"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert, Copy, HandHeart, Lock } from "lucide-react";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";
import { addMyRequest, getProfile, useLocal, DEFAULT_PROFILE } from "@/lib/local";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Notice from "./ui/Notice";

// React 19: `ref` is a normal prop for function components.
// `prefill` = { type, note, n } from the event chat; `n` changes on every suggestion.
export default function RequestForm({ eventId, eventName, prefill, ref }) {
  const [profile, profileLoaded] = useLocal(getProfile, DEFAULT_PROFILE);
  const [needs, setNeeds] = useState([]);
  const [note, setNote] = useState("");
  const [shareContact, setShareContact] = useState(false);
  const [contact, setContact] = useState("");
  const [fromProfile, setFromProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [sentNeeds, setSentNeeds] = useState([]);
  const [copied, setCopied] = useState(false);
  const touched = useRef(false); // stop profile prefill once the person has edited the form

  // Prefill once from the device-only profile (needs + contact preference).
  useEffect(() => {
    if (!profileLoaded || touched.current) return;
    const saved = (profile.needs ?? []).filter((n) => REQUEST_TYPE_LABELS[n]);
    setNeeds(saved);
    setFromProfile(saved.length > 0);
    if (profile.canContact && profile.contact) {
      setContact(profile.contact);
      setShareContact(!profile.anonymousByDefault);
    }
  }, [profileLoaded, profile]);

  // When the chat suggests a request, fill in that need and the question.
  useEffect(() => {
    if (!prefill?.n) return;
    touched.current = true;
    setNeeds([REQUEST_TYPE_LABELS[prefill.type] ? prefill.type : "other"]);
    setNote(prefill.note ?? "");
    setFromProfile(false);
  }, [prefill]);

  function toggleNeed(n, on) {
    touched.current = true;
    setNeeds((cur) => (on ? [...cur, n] : cur.filter((x) => x !== n)));
  }

  async function submit(e) {
    e.preventDefault();
    if (!needs.length) {
      setError("Choose at least one thing you need.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only what's ticked in this form is sent — never the whole profile.
        body: JSON.stringify({ eventId, needs, note, contact: shareContact ? contact : "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setToken(data.accessToken);
      setSentNeeds(needs);
      // Save the private status link on this device (Profile → My requests).
      addMyRequest({ token: data.accessToken, eventId, eventName, needs });
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
    <Card as="section" id="request-form" aria-labelledby="request-heading" ref={ref} tabIndex={-1}>
      <h2 id="request-heading" className="section-heading">
        <HandHeart aria-hidden="true" focusable="false" />
        Request an accommodation
      </h2>
      <p className="muted">Tell the organizer what you need, not why. Your name is only shared if you choose to.</p>

      {token ? (
        <Notice tone="success" title="Request sent" role="status">
          <p>
            We saved the private status link on this device: find it any time in{" "}
            <a href="/profile#my-requests">Profile → My requests</a>. It&apos;s the only way to find your request,
            because we don&apos;t store who sent it. Copy it if you want to check from another device.
          </p>
          <p className="muted">Asked for: {sentNeeds.map((n) => REQUEST_TYPE_LABELS[n]).join(", ")}</p>
          <div className="button-row">
            <Button href={statusPath}>View my request status</Button>
            <Button variant="secondary" icon={Copy} onClick={copyLink}>
              {copied ? "Link copied" : "Copy link"}
            </Button>
          </div>
        </Notice>
      ) : (
        <form onSubmit={submit} noValidate>
          <fieldset className="field" aria-describedby={[fromProfile && "req-needs-hint", error && "req-error"].filter(Boolean).join(" ") || undefined}>
            <legend className="label">What do you need?</legend>
            {fromProfile && (
              <p id="req-needs-hint" className="hint">
                Pre-filled from your Profile. Untick anything you don&apos;t need for this event.
              </p>
            )}
            <div className="check-grid">
              {Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => (
                <div key={value} className="field-check">
                  <input
                    id={`req-need-${value}`}
                    type="checkbox"
                    checked={needs.includes(value)}
                    onChange={(e) => toggleNeed(value, e.target.checked)}
                  />
                  <label htmlFor={`req-need-${value}`}>{label}</label>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="req-note">Details (optional)</label>
            <p id="req-note-hint" className="hint">For example, where you&apos;d like to sit. No need to say why.</p>
            <textarea
              id="req-note"
              rows={3}
              maxLength={1000}
              value={note}
              aria-describedby="req-note-hint"
              onChange={(e) => {
                touched.current = true;
                setNote(e.target.value);
              }}
            />
          </div>

          <div className="field field-check">
            <input
              id="req-share"
              type="checkbox"
              checked={shareContact}
              onChange={(e) => {
                touched.current = true;
                setShareContact(e.target.checked);
              }}
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
            <p id="req-error" role="alert" className="error-text">
              <CircleAlert aria-hidden="true" focusable="false" />
              {error}
            </p>
          )}

          <Button type="submit" icon={shareContact ? undefined : Lock} disabled={submitting}>
            {submitting ? "Sending…" : shareContact ? "Send request" : "Send anonymous request"}
          </Button>
        </form>
      )}
    </Card>
  );
}
