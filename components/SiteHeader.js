"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TabBar from "./TabBar";

function AllyAvatar() {
  // Decorative: the visible "Ask Ally" text is the label.
  return <img src="/brand/accessly-icon-web.svg" alt="" className="ally-avatar" width={28} height={28} />;
}

function AskAllyLink({ className }) {
  const pathname = usePathname() ?? "/";
  const onAlly = pathname === "/ally" || pathname.startsWith("/ally/");
  return (
    <Link
      href="/ally"
      className={`btn btn-secondary btn-pill ${className}`}
      aria-current={onAlly ? "page" : undefined}
    >
      <AllyAvatar />
      Ask Ally
    </Link>
  );
}

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        {/* aria-label gives the link a name on mobile, where only the decorative icon shows. */}
        <Link href="/" className="logo-link" aria-label="Accessly home" aria-current={pathname === "/" ? "page" : undefined}>
          <img src="/brand/accessly-icon-web.svg" alt="" className="logo-icon" width={44} height={44} />
          <picture className="logo-wordmark">
            <source srcSet="/brand/accessly-wordmark-web-dark.svg" media="(prefers-color-scheme: dark)" />
            <img src="/brand/accessly-wordmark-web.svg" alt="Accessly" width={141} height={40} />
          </picture>
        </Link>
        <div className="header-actions">
          <TabBar />
          <AskAllyLink className="ask-ally-header" />
        </div>
      </div>
    </header>
  );
}

/** Floating "Ask Ally" button for mobile and tablet; hidden on the Ally page itself. */
export function AskAllyFab() {
  const pathname = usePathname() ?? "/";
  if (pathname === "/ally" || pathname.startsWith("/ally/")) return null;
  return <AskAllyLink className="ask-ally-fab" />;
}
