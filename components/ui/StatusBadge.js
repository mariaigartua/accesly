import { CircleCheck, CircleX, Hourglass, LoaderCircle } from "lucide-react";
import { STATUS_LABELS } from "@/lib/labels";

// Status is always color + icon + text, never color alone.
const STATUS = {
  awaiting: { icon: Hourglass, className: "badge-awaiting" },
  "in-progress": { icon: LoaderCircle, className: "badge-in-progress" },
  confirmed: { icon: CircleCheck, className: "badge-confirmed" },
  "cannot-accommodate": { icon: CircleX, className: "badge-cannot-accommodate" },
};

export default function StatusBadge({ status, as: Tag = "p" }) {
  // Older requests still use "pending"; it means the same as "awaiting".
  const key = status === "pending" ? "awaiting" : status;
  const { icon: Icon, className } = STATUS[key] ?? STATUS.awaiting;
  return (
    <Tag className={`badge ${className}`}>
      <Icon aria-hidden="true" focusable="false" />
      <span>
        <span className="visually-hidden">Status: </span>
        {STATUS_LABELS[key] ?? STATUS_LABELS[status] ?? status}
      </span>
    </Tag>
  );
}
