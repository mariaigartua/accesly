import { CircleCheck, CircleX, Hourglass, LoaderCircle } from "lucide-react";
import { STATUS_LABELS, normalizeStatus } from "@/lib/labels";

// Status is always color + icon + text, never color alone.
const STATUS = {
  awaiting: { icon: Hourglass, className: "badge-awaiting" },
  "in-progress": { icon: LoaderCircle, className: "badge-in-progress" },
  confirmed: { icon: CircleCheck, className: "badge-confirmed" },
  "cannot-accommodate": { icon: CircleX, className: "badge-cannot-accommodate" },
};

export default function StatusBadge({ status, as: Tag = "p" }) {
  const key = normalizeStatus(status);
  const { icon: Icon, className } = STATUS[key] ?? STATUS.awaiting;
  return (
    <Tag className={`badge ${className}`}>
      <Icon aria-hidden="true" focusable="false" />
      <span>
        <span className="visually-hidden">Status: </span>
        {STATUS_LABELS[key] ?? status}
      </span>
    </Tag>
  );
}
