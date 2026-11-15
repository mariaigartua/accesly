"use client";

import { useState } from "react";
import { EyeOff, UserRound } from "lucide-react";
import { needLabel, formatDate } from "@/lib/labels";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { NeedIcon } from "./ui/NeedChips";
import StatusBadge from "./ui/StatusBadge";
import RequestEditor from "./RequestEditor";

/** One accommodation request in an organizer list, with its Respond/Update action. */
export default function RequestCard({ request: r, organizerKey, showEvent = false, onSaved }) {
  const [editing, setEditing] = useState(false);
  const needs = r.needs ?? [];
  const title = needs.map(needLabel).join(", ") || "Request";
  return (
    <Card as="li">
      <div className="queue-head">
        <h3 className="h3 section-heading">
          <NeedIcon need={needs[0]} />
          {title}
        </h3>
        <StatusBadge status={r.status} />
      </div>
      {r.note && <p>{r.note}</p>}
      <ul className="meta">
        {showEvent && r.eventName && <li>For {r.eventName}</li>}
        <li>
          {r.contact ? <UserRound aria-hidden="true" focusable="false" /> : <EyeOff aria-hidden="true" focusable="false" />}
          {r.contact ? <>Contact shared: {r.contact}</> : "Anonymous"}
        </li>
        <li>Sent {formatDate(r.createdAt)}</li>
      </ul>
      {r.organizerReply && !editing && (
        <p className="mt-md">
          <strong>Your reply:</strong> {r.organizerReply}
        </p>
      )}
      {editing ? (
        <RequestEditor
          request={r}
          organizerKey={organizerKey}
          onCancel={() => setEditing(false)}
          onSaved={(status) => {
            setEditing(false);
            onSaved?.(status);
          }}
        />
      ) : (
        <div className="button-row mt-md">
          <Button variant={r.status === "awaiting" ? "primary" : "secondary"} onClick={() => setEditing(true)}>
            {r.status === "awaiting" ? "Respond" : "Update"}
            <span className="visually-hidden">: {title}</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
