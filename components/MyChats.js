"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash } from "lucide-react";
import { getMyChats, removeMyChat, useLocal } from "@/lib/local";
import Button from "./ui/Button";

/** Profile → My chats: private chat links saved on this device, with an unread dot. */
export default function MyChats() {
  const [list, loaded] = useLocal(getMyChats, []);
  const [info, setInfo] = useState({}); // token → chat | "gone" | "error"

  useEffect(() => {
    let cancelled = false;
    list.forEach(async ({ token }) => {
      try {
        // No markRead here: only opening the chat marks it read.
        const res = await fetch(`/api/chats/${token}`);
        const value = res.status === 404 ? "gone" : res.ok ? await res.json() : "error";
        if (!cancelled) setInfo((s) => ({ ...s, [token]: value }));
      } catch {
        if (!cancelled) setInfo((s) => ({ ...s, [token]: "error" }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [list]);

  if (!loaded) return <p className="muted">Loading…</p>;
  if (!list.length) {
    return <p>No chats yet. Use “Message the organizer” on an event page; the private link is saved here.</p>;
  }

  return (
    <ul className="card-list">
      {list.map((c) => {
        const chat = info[c.token];
        const unread = chat && typeof chat === "object" && chat.unreadForAttendee;
        const last = chat && typeof chat === "object" ? chat.messages.at(-1) : null;
        return (
          <li key={c.token} className="card">
            <h3 className="h3">
              {unread && <span className="unread-dot" aria-hidden="true" />}
              <Link href={`/chats/${c.token}`}>
                {unread && <span className="visually-hidden">New reply: </span>}
                {c.eventName || "Chat with the organizer"}
              </Link>
            </h3>
            {!chat && <p className="muted">Checking for replies…</p>}
            {chat === "error" && <p className="muted">Couldn&apos;t check for replies right now.</p>}
            {chat === "gone" && <p className="muted">This chat no longer exists. Chats are deleted a week after the event.</p>}
            {last && (
              <p className="preview">
                {unread ? <strong>New reply: </strong> : last.from === "attendee" ? "You: " : "Organizer: "}
                {last.text}
              </p>
            )}
            <Button variant="ghost" icon={Trash} onClick={() => removeMyChat(c.token)}>
              Remove from this device
              <span className="visually-hidden">: {c.eventName || "chat"}</span>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
