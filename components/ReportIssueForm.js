"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Flag, Lock } from "lucide-react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Notice from "./ui/Notice";

const MAX = 500;

/** Anonymous "Report an issue" form for a building/space. */
export default function ReportIssueForm({ spaceId, spaceName }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError("Describe the issue.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/spaces/${spaceId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't send the report.");
      setSent(true);
      setText("");
      router.refresh(); // show the new report in "Recent issues"
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card as="section" aria-labelledby="report-heading">
      <h2 id="report-heading" className="section-heading">
        <Flag aria-hidden="true" focusable="false" />
        Report an issue
      </h2>
      <p className="muted">
        Something wrong at {spaceName}, like a broken elevator or a blocked ramp? Reports are anonymous: we only save
        what you write and when.
      </p>

      {sent && (
        <Notice tone="success" title="Thanks, report sent" role="status">
          <p>It now shows under recent issues so others know before they go.</p>
        </Notice>
      )}

      <form onSubmit={submit} noValidate className={sent ? "mt-md" : undefined}>
        <div className="field">
          <label htmlFor="report-text">What&apos;s the issue?</label>
          <p id="report-hint" className="hint">
            Up to {MAX} characters. Don&apos;t include names or personal details.
          </p>
          <textarea
            id="report-text"
            rows={3}
            maxLength={MAX}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSent(false);
            }}
            aria-describedby={error ? "report-hint report-error" : "report-hint"}
            aria-invalid={!!error}
          />
        </div>
        {error && (
          <p id="report-error" role="alert" className="error-text">
            <CircleAlert aria-hidden="true" focusable="false" />
            {error}
          </p>
        )}
        <Button type="submit" icon={Lock} disabled={sending}>
          {sending ? "Sending…" : "Send anonymous report"}
        </Button>
      </form>
    </Card>
  );
}
