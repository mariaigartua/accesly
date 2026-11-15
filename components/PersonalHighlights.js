"use client";

import Link from "next/link";
import { CircleCheck, CircleHelp, CircleX, UserRound } from "lucide-react";
import { getProfile, useLocal, DEFAULT_PROFILE } from "@/lib/local";
import { computeHighlights } from "@/lib/highlights";
import { needLabel } from "@/lib/labels";
import Card from "./ui/Card";

const STATUS = {
  info: { icon: CircleCheck, text: "Info on file", className: "hl-info", tone: "yes" },
  "not-available": { icon: CircleX, text: "Listed as not available", className: "hl-not-available", tone: "no" },
  "not-confirmed": { icon: CircleHelp, text: "Not confirmed", className: "hl-not-confirmed", tone: "unsure" },
};

/**
 * "For your needs" box on event and building pages. Reads the device-only profile and
 * matches it against the page's info entirely in the browser. Nothing is sent anywhere.
 * entries: [{ key, value, source }]; requestHref: where "Request it" points (event page only).
 */
export default function PersonalHighlights({ entries, requestHref }) {
  const [profile, loaded] = useLocal(getProfile, DEFAULT_PROFILE);
  if (!loaded) return null;

  const needs = profile.needs ?? [];
  if (!needs.length) {
    return (
      <Card as="section" className="hl-card" aria-labelledby="hl-heading">
        <h2 id="hl-heading" className="section-heading">
          <UserRound aria-hidden="true" focusable="false" />
          For your needs
        </h2>
        <p>
          <Link href="/profile">Add your needs in Profile</Link> to see what matches here. They stay on this device.
        </p>
      </Card>
    );
  }

  const results = computeHighlights(needs, entries);
  return (
    <Card as="section" className="hl-card" aria-labelledby="hl-heading">
      <h2 id="hl-heading" className="section-heading">
        <UserRound aria-hidden="true" focusable="false" />
        For your needs
      </h2>
      <p className="muted">Checked on this device against your Profile. Nothing is sent.</p>
      <ul className="hl-list">
        {results.map(({ need, status, matches }) => {
          const { icon: Icon, text, className, tone } = STATUS[status];
          return (
            <li key={need} className={className}>
              <p className="hl-title">
                <strong>{needLabel(need)}</strong>
                <span className={`answer-tag answer-${tone}`}>
                  <Icon aria-hidden="true" focusable="false" />
                  {text}
                </span>
              </p>
              {matches.map((m) => (
                <p key={`${m.source}-${m.key}`} className="hl-detail">
                  {m.source}: {m.value}
                </p>
              ))}
              {status !== "info" && requestHref && (
                <p className="hl-detail">
                  <a href={requestHref}>Request it anonymously</a>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
