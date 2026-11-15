import { CircleCheck, CircleHelp, CircleX } from "lucide-react";
import { classifyAnswer } from "@/lib/answers";

const TONES = {
  yes: { icon: CircleCheck, label: "Yes" },
  no: { icon: CircleX, label: "No" },
  unsure: { icon: CircleHelp, label: "Not sure" },
};

/** Colored Yes / No / Not sure tag (icon + text, never color alone). */
export function AnswerTag({ tone }) {
  const t = TONES[tone];
  if (!t) return null;
  const Icon = t.icon;
  return (
    <span className={`answer-tag answer-${tone}`}>
      <Icon aria-hidden="true" focusable="false" />
      {t.label}
    </span>
  );
}

/** An answer value with its tag in front; plain text when it isn't a clear yes/no. */
export default function AnswerValue({ value }) {
  const { tone, text } = classifyAnswer(value);
  if (!tone) return <span className="answer-text">{text}</span>;
  return (
    <span className="answer-value">
      <AnswerTag tone={tone} />
      {text && <span className="answer-text">{text}</span>}
    </span>
  );
}
