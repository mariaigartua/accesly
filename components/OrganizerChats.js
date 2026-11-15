"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/labels";
import { getMyEvents, keyForEvent, organizerKeys, useLocal } from "@/lib/local";
import Button from "./ui/Button";
import Card from "./ui/Card";
import ChatThread from "./ChatThread";

/** Organizer's chat inbox across this device's events. Open a chat to read and reply. */
export default function OrganizerChats() {
  const [myEvents, loaded] = useLocal(getMyEvents, []);
  const [chats, setChats] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const keys = organizerKeys();
    if (!keys.length) return setChats([]);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/organizer/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChats(data.chats);
    } catch (err) {
      setError(err.message || "Couldn't load chats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loaded) load();
  }, [loaded, myEvents.length, load]);

  async function open(chat) {
    setOpenId(chat._id);
    if (!chat.unreadForOrganizer) return;
    // Mark read on the server, then locally.
    await fetch(`/api/organizer/chats/${chat._id}`, {
      method: "PATCH",
      headers: { "x-organizer-key": keyForEvent(chat.eventId) },
    }).catch(() => {});
    setChats((cs) => cs.map((c) => (c._id === chat._id ? { ...c, unreadForOrganizer: false } : c)));
  }

  async function reply(chat, text) {
    const res = await fetch(`/api/organizer/chats/${chat._id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-organizer-key": keyForEvent(chat.eventId) },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setChats((cs) => cs.map((c) => (c._id === chat._id ? { ...c, messages: [...c.messages, data] } : c)));
  }

  if (!loaded) return <p className="muted">Loading…</p>;
  if (!myEvents.length) return <p>Add an event in the Organizer tab to see its chats here.</p>;

  const unread = chats.filter((c) => c.unreadForOrganizer).length;
  return (
    <>
      <div className="toolbar">
        <p role="status" className="muted">
          {loading ? "Loading…" : `${chats.length} chat${chats.length === 1 ? "" : "s"}, ${unread} unread.`}
        </p>
        <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>
      {error && (
        <p role="alert" className="error-text">
          <CircleAlert aria-hidden="true" focusable="false" />
          {error}
        </p>
      )}
      {!loading && !chats.length && <p>No chats yet. Attendees can message you from your event pages.</p>}
      <ul className="queue">
        {chats.map((c) => {
          const last = c.messages.at(-1);
          const isOpen = openId === c._id;
          return (
            <Card as="li" key={c._id}>
              <div className="queue-head">
                <h2 className="h3">
                  {c.unreadForOrganizer && (
                    <span className="unread-dot" aria-hidden="true" />
                  )}
                  {c.unreadForOrganizer && <span className="visually-hidden">Unread: </span>}
                  {c.contact ? c.contact : "Anonymous attendee"}
                </h2>
              </div>
              <p className="muted">
                {c.eventName} · {formatDate(c.updatedAt)}
              </p>
              {!isOpen && last && <p className="preview">{last.from === "organizer" ? "You: " : ""}{last.text}</p>}
              {isOpen ? (
                <ChatThread
                  messages={c.messages}
                  viewer="organizer"
                  idPrefix={`oc-${c._id}`}
                  onSend={(text) => reply(c, text)}
                />
              ) : (
                <Button variant={c.unreadForOrganizer ? "primary" : "secondary"} onClick={() => open(c)}>
                  {c.unreadForOrganizer ? "Read and reply" : "Open"}
                  <span className="visually-hidden">: chat about {c.eventName}</span>
                </Button>
              )}
            </Card>
          );
        })}
      </ul>
    </>
  );
}
