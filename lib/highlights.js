// Personalized highlights, computed in the browser only (the profile never leaves the device).
// Given the person's needs and an event's/space's info entries, says for each need whether the
// info mentions it, says it's NOT available, or doesn't confirm it at all.
// We only detect *mentions*; we show the matching text so the person can judge it themselves.

const NEED_PATTERNS = {
  "step-free-route": /step[\s-]?free|ramp|wheelchair|level (entrance|access)|no steps|accessible entrance/i,
  elevator: /elevator|\blift\b/i,
  "noise-reduction": /noise|quiet|loud|sound|music|sensory/i,
  captions: /caption|subtitl|\bcart\b/i,
  "asl-interpreter": /\basl\b|interpret|sign language/i,
  "reserved-seating": /seat|chair/i,
  dietary: /food|diet|allergen|vegan|vegetarian|gluten|halal|kosher|nut/i,
  "materials-in-advance": /slides?\b|materials?\b|handouts?|in advance|agenda/i,
  "large-print": /large[\s-]?print|font size/i,
};

// "No elevator", "Not available", "None" → the info says it's missing.
const NEGATIVE = /^\s*(no|none|not)\b|\bnot (available|accessible|provided|wheelchair)|\bunavailable\b|\bno (elevator|ramp|captions|interpreter)/i;

const keyWords = (k) => String(k).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");

/**
 * @param needs   e.g. ["elevator", "captions"]
 * @param entries [{ key, value, source }] — event accessibility answers + space features
 * @returns [{ need, status: "info" | "not-available" | "not-confirmed", matches: entries[] }]
 */
export function computeHighlights(needs, entries) {
  return needs
    .filter((n) => NEED_PATTERNS[n])
    .map((need) => {
      const re = NEED_PATTERNS[need];
      const matches = entries.filter((e) => re.test(`${keyWords(e.key)} ${e.value}`));
      if (!matches.length) return { need, status: "not-confirmed", matches };
      const allNegative = matches.every((e) => NEGATIVE.test(e.value));
      return { need, status: allNegative ? "not-available" : "info", matches };
    });
}
