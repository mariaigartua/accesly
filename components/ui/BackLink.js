import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Back link: 44px rounded button with a chevron, plus a visible label. */
export default function BackLink({ href, children }) {
  return (
    <Link href={href} className="back-link">
      <span className="back-circle" aria-hidden="true">
        <ChevronLeft focusable="false" />
      </span>
      <span>{children}</span>
    </Link>
  );
}
