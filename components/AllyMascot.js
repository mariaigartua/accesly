import { useId } from "react";

/**
 * Ally's friendly face: a soft blue blob with two eyes. Purely decorative (always aria-hidden);
 * the visible text around it says who Ally is. Blues only, per the design system.
 * `animated` adds a short float + blink that stops by itself (WCAG 2.2.2) and is off under reduced motion.
 */
export default function AllyMascot({ size = 48, animated = false, className = "" }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={`ally-mascot${animated ? " is-animated" : ""} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`g${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#d9f7f9" />
          <stop offset="30%" stopColor="#5ce1e6" />
          <stop offset="65%" stopColor="#0097b2" />
          <stop offset="100%" stopColor="#014cae" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill={`url(#g${id})`} />
      <g className="ally-eyes" fill="#ffffff">
        <rect x="39" y="40" width="13" height="26" rx="6.5" />
        <rect x="68" y="40" width="13" height="26" rx="6.5" />
      </g>
      <path d="M48 78 q12 9 24 0" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
