// Human-friendly labels shared by server and client components (no secrets here).

export const REQUEST_TYPE_LABELS = {
  captions: "Live captions",
  "asl-interpreter": "ASL interpreter",
  "step-free-route": "Step-free route / entrance",
  "reserved-seating": "Reserved seating",
  "quiet-space": "Quiet space to take a break",
  dietary: "Dietary needs",
  "materials-in-advance": "Slides or materials in advance",
  "large-print": "Large print materials",
  other: "Something else",
};

export const STATUS_LABELS = {
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
