"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash } from "lucide-react";
import { getMyRequests, removeMyRequest, useLocal } from "@/lib/local";
import { needLabel, formatDate } from "@/lib/labels";
import Button from "./ui/Button";
import StatusBadge from "./ui/StatusBadge";

/** Profile → My requests: private status links saved on this device, with live status. */
export default function MyRequests() {
  const [list, loaded] = useLocal(getMyRequests, []);
  const [statuses, setStatuses] = useState({}); // token → { status, organizerReply } | "gone" | "error"

  useEffect(() => {
    let cancelled = false;
    list.forEach(async ({ token }) => {
      try {
        const res = await fetch(`/api/requests/status/${token}`);
        const value = res.status === 404 ? "gone" : res.ok ? await res.json() : "error";
        if (!cancelled) setStatuses((s) => ({ ...s, [token]: value }));
      } catch {
        if (!cancelled) setStatuses((s) => ({ ...s, [token]: "error" }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [list]);

  if (!loaded) return <p className="muted">Loading…</p>;
  if (!list.length) {
    return (
      <p>
        No requests yet. When you send one from an event page, its private status link is saved here, on this
        device only.
      </p>
    );
  }

  return (
    <ul className="card-list">
      {list.map((r) => {
        const s = statuses[r.token];
        return (
          <li key={r.token} className="card">
            <h3 className="h3">
              <Link href={`/requests/${r.token}`}>{r.eventName || "Your request"}</Link>
            </h3>
            <p className="muted">
              {(r.needs ?? []).map(needLabel).join(", ")}
              {r.createdAt && <> · sent {formatDate(r.createdAt)}</>}
            </p>
            {!s && <p className="muted">Checking status…</p>}
            {s === "error" && <p className="muted">Couldn&apos;t check the status right now.</p>}
            {s === "gone" && (
              <p className="muted">This request no longer exists. Requests are deleted a week after the event.</p>
            )}
            {s && typeof s === "object" && (
              <>
                <StatusBadge status={s.status} />
                {s.organizerReply && (
                  <p className="mt-md">
                    <strong>Organizer&apos;s reply:</strong> {s.organizerReply}
                  </p>
                )}
              </>
            )}
            <div className="button-row mt-md">
              <Button variant="ghost" icon={Trash} onClick={() => removeMyRequest(r.token)}>
                Remove from this device
                <span className="visually-hidden">: {r.eventName || "request"}</span>
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
