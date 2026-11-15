import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackLink({ href, children }) {
  return (
    <Link href={href} className="back-link">
      <ArrowLeft aria-hidden="true" focusable="false" />
      {children}
    </Link>
  );
}
