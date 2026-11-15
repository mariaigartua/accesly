"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { CircleAlert, Copy, Download, Link2, Pencil, QrCode, Share2 } from "lucide-react";
import { keyForEvent } from "@/lib/local";
import { SLUG_HELP, SLUG_RE, shortUrl, slugify } from "@/lib/slug";
import Button from "./ui/Button";
import Card from "./ui/Card";

/**
 * Share an event: short link (/e/<slug>) + QR code for fliers and social media.
 * Organizers on this device (key saved, or passed in) can customize the link.
 */
export default function ShareEventCard({ eventId, eventName, initialSlug = "", organizerKey = "", headingRef }) {
  const [origin, setOrigin] = useState("");
  const [key, setKey] = useState(organizerKey);
  const [slug, setSlug] = useState(initialSlug);
  const [svg, setSvg] = useState("");
  const [status, setStatus] = useState(""); // announced politely
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const linkRef = useRef(null); // focus target after saving/cancelling a custom link

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanShare(typeof navigator.share === "function");
    if (!organizerKey) setKey(keyForEvent(eventId) || "");
  }, [eventId, organizerKey]);

  const url = origin ? (slug ? shortUrl(slug, origin) : `${origin}/events/${eventId}`) : "";
  const fileBase = slug || slugify(eventName);

  useEffect(() => {
    if (!url) return;
    let alive = true;
    QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "M", color: { dark: "#014cae", light: "#ffffff" } })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(""));
    return () => {
      alive = false;
    };
  }, [url]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Link copied.");
    } catch {
      setStatus("Couldn't copy. Select the link and copy it yourself.");
    }
  }

  async function share() {
    try {
      await navigator.share({ title: eventName, text: `${eventName}: accessibility info and anonymous requests on Accessly`, url });
    } catch {
      /* closed the share sheet */
    }
  }

  function download(href, name) {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function downloadPng() {
    try {
      const data = await QRCode.toDataURL(url, { width: 1200, margin: 2, errorCorrectionLevel: "M", color: { dark: "#014cae", light: "#ffffff" } });
      download(data, `${fileBase}-qr.png`);
      setStatus("QR code downloaded as PNG.");
    } catch {
      setStatus("Couldn't create the PNG. Try the SVG instead.");
    }
  }

  function downloadSvg() {
    const href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    download(href, `${fileBase}-qr.svg`);
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    setStatus("QR code downloaded as SVG.");
  }

  async function saveLink(value) {
    const v = value.trim().toLowerCase();
    if (value !== undefined && v && !SLUG_RE.test(v)) {
      setError(`Use ${SLUG_HELP.toLowerCase()}`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${eventId}/link`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-organizer-key": key },
        body: JSON.stringify(v ? { slug: v } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error === "not authorized" ? "This device doesn't have the organizer key for this event." : data.error);
      setSlug(data.slug);
      setEditing(false);
      requestAnimationFrame(() => linkRef.current?.focus());
      setStatus(`Link saved. The QR code now opens ${shortUrl(data.slug, origin)}. Old fliers with the previous link won't work.`);
    } catch (e) {
      setError(e.message || "Couldn't save the link.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card as="section" aria-labelledby="share-heading" className="share-card">
      <h2 id="share-heading" ref={headingRef} tabIndex={headingRef ? -1 : undefined} className="section-heading">
        <QrCode aria-hidden="true" focusable="false" />
        Share your event
      </h2>
      <p>Put the link or QR code on fliers and social media. It opens the event page with its accessibility info.</p>

      <div className="share-layout">
        <figure className="qr-figure">
          {svg ? (
            <div className="qr-code" role="img" aria-label={`QR code that opens ${url}`} dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <div className="qr-code qr-loading" aria-hidden="true" />
          )}
          <figcaption>Scan to open the event</figcaption>
        </figure>

        <div className="share-actions">
          <p className="label no-margin" id="share-link-label">
            Event link
          </p>
          <p className="share-link">
            <Link2 aria-hidden="true" focusable="false" />
            <a href={url} ref={linkRef} aria-describedby="share-link-label">{url.replace(/^https?:\/\//, "")}</a>
          </p>
          <div className="button-row">
            <Button variant="secondary" icon={Copy} onClick={copy} disabled={!url}>
              Copy link
            </Button>
            {canShare && (
              <Button variant="secondary" icon={Share2} onClick={share}>
                Share
              </Button>
            )}
          </div>
          <div className="button-row">
            <Button variant="secondary" icon={Download} onClick={downloadPng} disabled={!svg}>
              QR as PNG
            </Button>
            <Button variant="secondary" icon={Download} onClick={downloadSvg} disabled={!svg}>
              QR as SVG
            </Button>
          </div>

          {key && !slug && (
            <Button variant="ghost" icon={Link2} onClick={() => saveLink("")} disabled={saving}>
              Create a short link
            </Button>
          )}
          {key && slug && !editing && (
            <Button
              variant="ghost"
              icon={Pencil}
              onClick={() => {
                setDraft(slug);
                setError("");
                setEditing(true);
              }}
            >
              Customize link
            </Button>
          )}
          {editing && (
            <form
              className="slug-form"
              onSubmit={(e) => {
                e.preventDefault();
                saveLink(draft);
              }}
              noValidate
            >
              <div className="field">
                <label htmlFor="slug-input">Custom link</label>
                <p id="slug-help" className="hint">
                  {SLUG_HELP} Changing it breaks links and QR codes you already shared.
                </p>
                <div className="slug-input">
                  <span aria-hidden="true">{shortUrl("", origin).replace(/^https?:\/\//, "")}</span>
                  <input
                    id="slug-input"
                    type="text"
                    value={draft}
                    maxLength={40}
                    autoComplete="off"
                    spellCheck={false}
                    autoFocus
                    onChange={(e) => setDraft(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    aria-invalid={!!error}
                    aria-describedby={error ? "slug-help slug-error" : "slug-help"}
                  />
                </div>
              </div>
              {error && (
                <p id="slug-error" role="alert" className="error-text">
                  <CircleAlert aria-hidden="true" focusable="false" />
                  {error}
                </p>
              )}
              <div className="button-row">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save link"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    requestAnimationFrame(() => linkRef.current?.focus());
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
          {!editing && error && (
            <p role="alert" className="error-text">
              <CircleAlert aria-hidden="true" focusable="false" />
              {error}
            </p>
          )}
        </div>
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        {status}
      </p>
      {status.startsWith("Link saved") && <p className="hint">{status}</p>}
    </Card>
  );
}
