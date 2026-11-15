"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CircleAlert, Trash } from "lucide-react";
import { clearAll, getProfile, saveProfile, storageAvailable, useLocal, DEFAULT_PROFILE } from "@/lib/local";
import { PROFILE_NEEDS, REQUEST_TYPE_LABELS } from "@/lib/labels";
import Avatar, { AVATARS } from "./ui/Avatar";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Notice from "./ui/Notice";
import { ChipPicker, Switch } from "./ui/Pickers";

/** Device-only profile form. Saving writes to localStorage; nothing is sent to the server. */
export default function ProfileForm() {
  const [stored, loaded] = useLocal(getProfile, DEFAULT_PROFILE);
  const [p, setP] = useState(DEFAULT_PROFILE);
  const [status, setStatus] = useState(""); // announced via role="status"
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [noStorage, setNoStorage] = useState(false);
  const loadedOnce = useRef(false);

  // Load the saved profile into the form once (later storage changes mustn't wipe unsaved edits).
  useEffect(() => {
    if (!loaded || loadedOnce.current) return;
    loadedOnce.current = true;
    setP(stored);
  }, [loaded, stored]);

  useEffect(() => {
    setNoStorage(!storageAvailable());
  }, []);

  const set = (field, value) => {
    setP((cur) => ({ ...cur, [field]: value }));
    setStatus("");
  };

  function save(e) {
    e.preventDefault();
    if (p.canContact && !p.contact.trim()) {
      setError("Add a name or email, or turn off “Can contact me”.");
      return;
    }
    setError("");
    setStatus(saveProfile(p) ? "Profile saved on this device." : "Couldn't save: storage is blocked in this browser.");
  }

  function clear() {
    clearAll();
    setP(DEFAULT_PROFILE);
    setConfirmClear(false);
    setStatus("All your Accessly data was removed from this device.");
  }

  return (
    <>
      {noStorage && (
        <Notice tone="warning" title="This browser is blocking storage" className="mt-md">
          <p>Your profile can&apos;t be saved here (for example in some private windows). You can still send requests.</p>
        </Notice>
      )}

      <form onSubmit={save} noValidate className="stack">
        <Card as="fieldset" className="fieldset-card">
          <legend className="h3">About you (all optional)</legend>
          <fieldset className="field">
            <legend className="label">Avatar</legend>
            <div className="avatar-choices">
              {Object.entries(AVATARS).map(([id, a]) => (
                <label key={id} className="avatar-choice">
                  <input
                    type="radio"
                    name="avatar"
                    value={id}
                    checked={p.avatar === id}
                    onChange={() => set("avatar", id)}
                  />
                  <Check className="pick-check" aria-hidden="true" focusable="false" />
                  <Avatar id={id} size={40} />
                  <span>{a.label}</span>
                </label>
              ))}
              <label className="avatar-choice">
                <input type="radio" name="avatar" value="" checked={!p.avatar} onChange={() => set("avatar", "")} />
                <Check className="pick-check" aria-hidden="true" focusable="false" />
                <Avatar id="" size={40} />
                <span>None</span>
              </label>
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="pf-username">Username</label>
            <input id="pf-username" type="text" value={p.username} onChange={(e) => set("username", e.target.value)} autoComplete="nickname" />
          </div>
          <div className="field">
            <label htmlFor="pf-pronouns">Pronouns</label>
            <input id="pf-pronouns" type="text" value={p.pronouns} onChange={(e) => set("pronouns", e.target.value)} placeholder="e.g. they/them" />
          </div>
        </Card>

        <Card as="fieldset" className="fieldset-card">
          <legend className="h3">Privacy</legend>
          <Switch
            id="pf-anon"
            title="Anonymous by default"
            description="Requests start without your contact info. You can still share it on any request."
            checked={p.anonymousByDefault}
            onChange={(v) => set("anonymousByDefault", v)}
          />
          <Switch
            id="pf-contact-on"
            title="Can contact me"
            description="Saves a name or email here so it's ready to share. It's only sent on a request when you choose “Share” on that request."
            checked={p.canContact}
            onChange={(v) => set("canContact", v)}
          />
          {p.canContact && (
            <div className="field mt-md">
              <label htmlFor="pf-contact">Name or email</label>
              <input
                id="pf-contact"
                type="text"
                value={p.contact}
                onChange={(e) => set("contact", e.target.value)}
                autoComplete="email"
                aria-invalid={!!error}
                aria-describedby={error ? "pf-error" : undefined}
              />
            </div>
          )}
        </Card>

        <Card as="section" aria-labelledby="pf-needs-heading">
          <h2 id="pf-needs-heading" className="h3">
            Your accessibility needs
          </h2>
          <ChipPicker
            idPrefix="pf-needs"
            legend="Select those that apply"
            hint="We use these to pre-fill requests and show what matches on event and building pages. They stay on this device."
            options={PROFILE_NEEDS.map((n) => [n, REQUEST_TYPE_LABELS[n]])}
            value={p.needs}
            onChange={(v) => set("needs", v)}
          />
          <div className="field">
            <label htmlFor="pf-notes">Describe anything helpful about accommodations</label>
            <p id="pf-notes-hint" className="hint">A note for yourself, e.g. what to ask for. Never sent anywhere.</p>
            <textarea id="pf-notes" rows={3} value={p.notes} onChange={(e) => set("notes", e.target.value)} aria-describedby="pf-notes-hint" />
          </div>
        </Card>

        {error && (
          <p id="pf-error" role="alert" className="error-text">
            <CircleAlert aria-hidden="true" focusable="false" />
            {error}
          </p>
        )}

        <div className="button-row">
          <Button type="submit" variant="cta">
            Save profile
          </Button>
          <p role="status" className="muted no-margin">
            {status}
          </p>
        </div>
      </form>

      <Card as="section" aria-labelledby="clear-heading" className="mt-xl">
        <h2 id="clear-heading" className="h3">
          Clear all my data
        </h2>
        <p>Removes your profile and saved request and chat links from this device. Requests you sent stay with the organizer until they auto-delete.</p>
        {confirmClear ? (
          <div className="button-row" role="group" aria-label="Confirm clearing your data">
            <Button variant="danger" icon={Trash} onClick={clear}>
              Yes, clear everything
            </Button>
            <Button variant="secondary" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="danger" icon={Trash} onClick={() => setConfirmClear(true)}>
            Clear all my data
          </Button>
        )}
      </Card>
    </>
  );
}
