"use client";

import { useRef, useState } from "react";
import Chat from "./Chat";
import RequestForm from "./RequestForm";

// Holds the chat and the request form together so a chat answer can pre-fill the form.
export default function EventAssistant({ eventId, eventName }) {
  const [prefill, setPrefill] = useState(null); // { type, note, n }
  const formRef = useRef(null);

  function startRequest({ type, note }) {
    setPrefill((p) => ({ type: type || "other", note: note || "", n: (p?.n ?? 0) + 1 }));
    // Move focus to the form so keyboard and screen-reader users land there.
    requestAnimationFrame(() => formRef.current?.focus());
  }

  return (
    <>
      <Chat eventId={eventId} eventName={eventName} onRequest={startRequest} />
      <RequestForm ref={formRef} eventId={eventId} eventName={eventName} prefill={prefill} />
    </>
  );
}
