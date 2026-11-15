// Starter prompts — tune these during the hackathon.

// Need types an attendee can request. Keep in sync with REQUEST_TYPE_LABELS in lib/labels.js.
export const REQUEST_TYPES = [
  "step-free-route",
  "elevator",
  "noise-reduction",
  "captions",
  "asl-interpreter",
  "reserved-seating",
  "dietary",
  "materials-in-advance",
  "large-print",
  "other",
];

export const EVENT_CHAT_SYSTEM = `You answer attendees' questions about one event's accessibility.

Rules:
- Use ONLY the EVENT and SPACE data provided. Never guess or use outside knowledge about the building.
- If the data doesn't answer the question, say clearly that the organizer hasn't confirmed it,
  and offer to send an anonymous accommodation request. Set "suggestRequest" to true.
- Never ask the attendee about their disability, diagnosis, or identity. Focus on needs.
- If an item has a "lastVerified" date, mention it when it matters.
- Be short, plain, and friendly. Write at about an 8th-grade reading level.

Respond as JSON: {"answer": string, "confirmed": boolean, "suggestRequest": boolean, "requestType": string | null}
"requestType" is the need the question is about, one of: ${REQUEST_TYPES.join(", ")} (or null).`;

export const ORGANIZER_FOLLOWUP_SYSTEM = `You help student event organizers describe their event's accessibility.
Given the event details and the space's known info, list the most important accessibility
questions the organizer has NOT answered yet. Cover physical access, sensory environment
(noise, lighting, crowds), food and allergens, communication (captions, slides, interpreters),
and schedule/breaks — but only what's relevant to this event.

Respond as JSON: {"questions": [{"id": string, "question": string, "why": string}]}
Return at most 8 questions, most important first.`;

// Used when Gemini is unavailable, so the Create event questionnaire always works.
export const FALLBACK_FOLLOWUPS = [
  { id: "stepFreeEntrance", question: "Is there a step-free way into the event room?", why: "Wheelchair and mobility-aid users need to know before they come." },
  { id: "elevator", question: "If the event isn't on the ground floor, is there a working elevator?", why: "Stairs-only access shuts people out." },
  { id: "noise", question: "Will it be loud (music, crowds), and is there a quieter area?", why: "Helps people with sensory sensitivities plan breaks." },
  { id: "captions", question: "Will talks or videos have captions?", why: "Deaf and hard-of-hearing attendees rely on them." },
  { id: "seating", question: "Will there be seating, including spots near the exit?", why: "Some people can't stand for long." },
  { id: "food", question: "Will there be food, and will allergens be labeled?", why: "Allergies and dietary needs are common." },
  { id: "materials", question: "Can you share slides or materials in advance?", why: "Helps people who use screen readers or need more time." },
];

