// Human-friendly labels shared by server and client components (no secrets here).

// Keep in sync with REQUEST_TYPES in lib/prompts.js. Order = order shown in forms.
export const REQUEST_TYPE_LABELS = {
  "step-free-route": "Ramp / step-free route",
  elevator: "Elevator",
  "noise-reduction": "Noise reduction / quiet space",
  captions: "Live captions",
  "asl-interpreter": "ASL interpreter",
  "reserved-seating": "Reserved seating",
  dietary: "Dietary needs",
  "materials-in-advance": "Slides or materials in advance",
  "large-print": "Large print materials",
  other: "Something else",
};

// Labels for need types that were renamed; older requests may still use them.
export const LEGACY_NEED_LABELS = {
  "quiet-space": "Noise reduction / quiet space",
};

/** Label for any need type, including legacy ones. */
export const needLabel = (n) => REQUEST_TYPE_LABELS[n] ?? LEGACY_NEED_LABELS[n] ?? n;

/** Needs a person can save in their Profile ("other" is per-request only). */
export const PROFILE_NEEDS = Object.keys(REQUEST_TYPE_LABELS).filter((n) => n !== "other");

export const STATUS_LABELS = {
  awaiting: "Waiting for the organizer",
  "in-progress": "Organizer is working on it",
  // Legacy name for "awaiting" — still stored on older requests until the status rename lands.
  pending: "Waiting for the organizer",
  confirmed: "Confirmed",
  "cannot-accommodate": "Organizer can't accommodate this",
};

/** "step_free-entrance" / "stepFreeEntrance" → "Step free entrance" */
export function humanize(key) {
  const s = String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" });
}
