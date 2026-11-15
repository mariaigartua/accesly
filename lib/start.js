// Quick start: the fixed list of destinations, how to build each link (prefill via query
// string, never stored), and a keyword fallback for when Gemini is unavailable.
// Shared by /api/start (server) and the /start page (client).

export const DESTINATIONS = {
  "create-event": { label: "Create an event", text: "Post your club's event with its accessibility info." },
  "find-events": { label: "Find events", text: "Browse upcoming events and their accessibility." },
  "find-location": { label: "Find a campus place", text: "Check a building or room before you go." },
  "ask-ally": { label: "Ask Ally", text: "Get there accessibly: buses, routes, places off campus." },
  "set-up-profile": { label: "Set up my needs", text: "Save your needs on this device to pre-fill requests." },
  privacy: { label: "Privacy & FAQ", text: "How Accessly protects your data." },
};

const clip = (s, n) => (typeof s === "string" ? s.trim().slice(0, n) : "");

// Words that would only narrow a search to nothing (every event/place is about accessibility).
const GENERIC = /\b(accessible|accessibility|events?|places?|this week|today|tonight|tomorrow|weekend|near me|on campus|an?|the|find|some)\b/gi;
const searchWords = (s) => clip(s, 100).replace(GENERIC, " ").replace(/\s+/g, " ").trim();

/** Keeps only the prefill fields each destination uses, trimmed. */
export function cleanPrefill(destination, prefill = {}) {
  switch (destination) {
    case "create-event":
      return { name: clip(prefill.name, 200), description: clip(prefill.description, 1000) };
    case "find-events":
    case "find-location":
      return { query: searchWords(prefill.query) };
    case "ask-ally":
      return { question: clip(prefill.question, 1000) };
    default:
      return {};
  }
}

/** The link for a destination, with prefill in the query string. */
export function destinationHref(destination, prefill = {}) {
  const qs = (params) => {
    const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return s ? `?${s}` : "";
  };
  switch (destination) {
    case "create-event":
      return `/organizer/new${qs({ name: prefill.name, description: prefill.description })}`;
    case "find-events":
      return `/explore${qs({ events: prefill.query })}#events`;
    case "find-location":
      return `/explore${qs({ locations: prefill.query })}#locations`;
    case "ask-ally":
      return `/ally${qs({ q: prefill.question })}`;
    case "set-up-profile":
      return "/profile";
    case "privacy":
      return "/privacy";
    default:
      return "/ally";
  }
}

const RULES = [
  ["privacy", /privacy|private|data|delete|who can see|anonymous|track/i],
  ["set-up-profile", /profile|my needs|set ?up|preferences|avatar|pronoun/i],
  ["create-event", /create|organi[sz]e|host|post|publish|my club|our club|new event/i],
  ["find-events", /event|happening|this week|tonight|weekend|meetup|party|club/i],
  ["find-location", /building|room|library|hall|center|centre|elevator|entrance|ramp|stairs/i],
];

/** Best-effort routing without AI. Unknown → ask-ally. */
export function keywordRoute(text) {
  const t = String(text ?? "");
  const destination = RULES.find(([, re]) => re.test(t))?.[0] ?? "ask-ally";
  const prefill =
    destination === "ask-ally"
      ? { question: t }
      : destination === "find-events" && /caption|asl|quiet|step[- ]?free|wheelchair|elevator/i.test(t)
        ? { query: t.match(/caption|asl|quiet|step[- ]?free|wheelchair|elevator/i)[0] }
        : {};
  return { destination, prefill: cleanPrefill(destination, prefill) };
}
