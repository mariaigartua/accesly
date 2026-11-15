// Reads a plain-language accessibility answer ("Yes. Ramp on the north side", "No elevator",
// "Not sure yet") and says whether it's a yes, a no or unsure, so it can get a colored tag.
// Only clear answers get a tone; descriptive text without yes/no gets no tag (we don't guess).

const YES = /^\s*(yes|yep|available|provided|confirmed)\b/i;
const NO = /^\s*(no|none|not available|not accessible|not provided|unavailable)\b/i;
const UNSURE = /^\s*(not sure|unsure|unknown|not confirmed|to be confirmed|tbc|tbd|maybe)\b/i;
// A bare leading "Yes." / "No," / "Not sure yet —" is dropped from the text once the tag shows it.
const LEAD = /^\s*(yes|no|not sure( yet)?|unsure|unknown)\s*[.,:;!—–-]+\s*/i;
const ONLY = /^\s*(yes|no|not sure( yet)?|unsure|unknown)\s*[.!]?\s*$/i;

/** @returns {{ tone: "yes" | "no" | "unsure" | null, text: string }} */
export function classifyAnswer(value) {
  const raw = String(value ?? "");
  const tone = UNSURE.test(raw) ? "unsure" : YES.test(raw) ? "yes" : NO.test(raw) ? "no" : null;
  if (!tone) return { tone, text: raw };
  if (ONLY.test(raw)) return { tone, text: "" };
  return { tone, text: raw.replace(LEAD, "") };
}
