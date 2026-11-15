// Attendee ↔ organizer chats: free conversation about anything ("Is there parking nearby?").
// Separate from accommodation requests (no status). Same privacy rules: anonymous by default,
// token-based access for the attendee, auto-deleted 7 days after the event.
import crypto from "node:crypto";

export const MAX_TEXT = 1000;
export const MAX_MESSAGES = 200;
const DAY_MS = 24 * 60 * 60 * 1000;

export const newToken = () => crypto.randomBytes(16).toString("hex");
export const isToken = (t) => /^[a-f0-9]{32}$/.test(t ?? "");

/** Trimmed text, or an error message. */
export function cleanText(text) {
  const t = typeof text === "string" ? text.trim() : "";
  if (!t) return { error: "Write a message." };
  if (t.length > MAX_TEXT) return { error: `Keep messages under ${MAX_TEXT} characters.` };
  return { text: t };
}

/** When the chat should be deleted: 7 days after the event ends. */
export function deleteAfterFor(event) {
  const end = event.endsAt ?? event.startsAt ?? new Date();
  return new Date(new Date(end).getTime() + 7 * DAY_MS);
}

/** Public shape of a chat (never includes accessToken). */
export function chatView(chat, eventName) {
  return {
    _id: String(chat._id),
    eventId: String(chat.eventId),
    eventName: eventName ?? "",
    messages: (chat.messages ?? []).map((m) => ({ from: m.from, text: m.text, createdAt: m.createdAt })),
    contact: chat.contact ?? null,
    unreadForOrganizer: !!chat.unreadForOrganizer,
    unreadForAttendee: !!chat.unreadForAttendee,
    updatedAt: chat.updatedAt,
  };
}
