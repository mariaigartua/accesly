"use client";

import { useRef, useState } from "react";
import Chat from "./Chat";
import RequestForm from "./RequestForm";
import MessageOrganizer from "./MessageOrganizer";

// Holds the AI chat, the request form and "Message the organizer" together, so a chat answer
// can pre-fill either one: a request if it's about a need, a message for anything else.
export default function EventAssistant({ eventId, eventName }) {
  const [requestPrefill, setRequestPrefill] = useState(null); // { type, note, n }
  const [messagePrefill, setMessagePrefill] = useState(null); // { text, n }
  const formRef = useRef(null);
  const messageRef = useRef(null);

  // Move focus to the form so keyboard and screen-reader users land there.
  const focus = (ref) => requestAnimationFrame(() => ref.current?.focus());

  function startRequest({ type, note }) {
    setRequestPrefill((p) => ({ type: type || "other", note: note || "", n: (p?.n ?? 0) + 1 }));
    focus(formRef);
  }

  function startMessage({ text }) {
    setMessagePrefill((p) => ({ text: text || "", n: (p?.n ?? 0) + 1 }));
    focus(messageRef);
  }

  return (
    <>
      <Chat eventId={eventId} eventName={eventName} onRequest={startRequest} onMessage={startMessage} />
      <RequestForm ref={formRef} eventId={eventId} eventName={eventName} prefill={requestPrefill} />
      <MessageOrganizer ref={messageRef} eventId={eventId} eventName={eventName} prefill={messagePrefill} />
    </>
  );
}
