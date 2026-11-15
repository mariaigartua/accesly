"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { addMyChat } from "@/lib/local";
import Button from "./ui/Button";
import Card from "./ui/Card";
import ChatThread from "./ChatThread";
import Notice from "./ui/Notice";

/** Attendee's view of one chat with an organizer (reached by private token link). */
export default function AttendeeChat({ token }) {
  const [chat, setChat] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | gone | error

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/chats/${token}?markRead=1`);
      if (res.status === 404) return setState("gone");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setChat(data);
      setState("ready");
      // Make sure this device can find the chat again (Profile → My chats).
      addMyChat({ token, eventId: data.eventId, eventName: data.eventName });
    } catch {
      setState("error");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(text) {
    const res = await fetch(`/api/chats/${token}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setChat((c) => ({ ...c, messages: [...c.messages, data] }));
  }

  if (state === "loading") return <p className="muted">Loading…</p>;
  if (state === "gone")
    return (
      <Notice tone="info" title="This chat no longer exists">
        <p>Chats are deleted automatically a week after the event.</p>
      </Notice>
    );
  if (state === "error")
    return (
      <Notice tone="error" title="Couldn't load this chat" role="alert">
        <Button variant="secondary" icon={RefreshCw} onClick={load}>
          Try again
        </Button>
      </Notice>
    );

  return (
    <div className="stack">
      <p>
        About <Link href={`/events/${chat.eventId}`}>{chat.eventName}</Link> ·{" "}
        {chat.contact ? `You shared: ${chat.contact}` : "Anonymous"}
      </p>
      <Card as="section" aria-label="Conversation">
        <ChatThread messages={chat.messages} viewer="attendee" idPrefix="ac" onSend={send} />
      </Card>
      <div className="button-row">
        <Button variant="secondary" icon={RefreshCw} onClick={load}>
          Check for replies
        </Button>
      </div>
      <p className="muted">
        Keep this link private: anyone with it can read and reply to this chat. It&apos;s deleted a week after the
        event.
      </p>
    </div>
  );
}
