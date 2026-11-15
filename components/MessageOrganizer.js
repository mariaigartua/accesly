"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert, Lock, MessageCircle } from "lucide-react";
import { addMyChat, getProfile, useLocal, DEFAULT_PROFILE } from "@/lib/local";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Notice from "./ui/Notice";

/**
 * "Message the organizer": a free-form question (parking, bringing a friend…), separate from
 * accommodation requests. Anonymous by default. `prefill` = { text, n } from the event chat.
 */
export default function MessageOrganizer({ eventId, eventName, prefill, ref }) {
  const [profile, profileLoaded] = useLocal(getProfile, DEFAULT_PROFILE);
  const [text, setText] = useState("");
  const [shareContact, setShareContact] = useState(false);
  const [contact, setContact] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const textRef = useRef(null);

  useEffect(() => {
    if (profileLoaded && profile.canContact && profile.contact) {
      setContact(profile.contact);
      setShareContact(!profile.anonymousByDefault);
    }
  }, [profileLoaded, profile]);

  useEffect(() => {
    if (prefill?.n) {
      setText(prefill.text ?? "");
      setToken("");
    }
  }, [prefill]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError("Write your message.");
      textRef.current?.focus();
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, text, contact: shareContact ? contact : "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't send.");
      addMyChat({ token: data.accessToken, eventId, eventName });
      setToken(data.accessToken);
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card as="section" id="message-organizer" aria-labelledby="msg-org-heading" ref={ref} tabIndex={-1}>
      <h2 id="msg-org-heading" className="section-heading">
        <MessageCircle aria-hidden="true" focusable="false" />
        Message the organizer
      </h2>
      <p className="muted">For any other question, like parking or bringing a friend. Anonymous unless you choose to share.</p>

      {token ? (
        <Notice tone="success" title="Message sent" role="status">
          <p>
            Your private chat link is saved in <a href="/profile#my-chats">Profile → My chats</a>. You&apos;ll see the
            organizer&apos;s reply there.
          </p>
          <div className="button-row">
            <Button href={`/chats/${token}`}>Open the chat</Button>
            <Button variant="secondary" onClick={() => setToken("")}>
              Send another message
            </Button>
          </div>
        </Notice>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="msg-text">Your message</label>
            <textarea
              id="msg-text"
              ref={textRef}
              rows={3}
              maxLength={1000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? "msg-error" : undefined}
            />
          </div>
          <div className="field field-check">
            <input id="msg-share" type="checkbox" checked={shareContact} onChange={(e) => setShareContact(e.target.checked)} />
            <label htmlFor="msg-share">Share a name or email with the organizer</label>
          </div>
          {shareContact && (
            <div className="field">
              <label htmlFor="msg-contact">Name or email</label>
              <input id="msg-contact" type="text" autoComplete="email" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
          )}
          {error && (
            <p id="msg-error" role="alert" className="error-text">
              <CircleAlert aria-hidden="true" focusable="false" />
              {error}
            </p>
          )}
          <Button type="submit" icon={shareContact ? undefined : Lock} disabled={sending}>
            {sending ? "Sending…" : shareContact ? "Send message" : "Send anonymously"}
          </Button>
        </form>
      )}
    </Card>
  );
}
