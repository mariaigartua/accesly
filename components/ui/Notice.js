import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

const TONES = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
};

/**
 * A callout box. Meaning comes from the title/text and icon, not only the color.
 * Pass role="status" or role="alert" when it appears dynamically.
 */
export default function Notice({ tone = "info", title, titleAs: Title = "p", children, className = "", ...props }) {
  const Icon = TONES[tone] ?? Info;
  return (
    <div className={`notice notice-${tone} ${className}`} {...props}>
      <Icon aria-hidden="true" focusable="false" />
      <div className="notice-body">
        {title && <Title className="notice-title">{title}</Title>}
        {children}
      </div>
    </div>
  );
}
