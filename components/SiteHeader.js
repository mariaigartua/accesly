"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TabBar from "./TabBar";

function AskAllyLink({ className }) {
  const pathname = usePathname() ?? "/";
  const onAlly = pathname === "/ally" || pathname.startsWith("/ally/");
  return (
    <Link href="/ally" className={`btn btn-cyan ${className}`} aria-current={onAlly ? "page" : undefined}>
      {/* Decorative: the visible "Ask Ally" text is the label. */}
      <img src="/brand/accessly-icon-web.svg" alt="" className="ally-avatar" width={28} height={28} />
      Ask Ally
    </Link>
  );
}

/** Blue rounded-bottom app header: logo, white tab track, Ask Ally (desktop). Not shown on Home. */
export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  if (pathname === "/") return null; // Home is the full-screen main menu
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        {/* aria-label gives the link a name on mobile, where only the decorative icon shows. */}
        <Link href="/" className="logo-link" aria-label="Accessly home">
          <img src="/brand/accessly-icon-web.svg" alt="" className="logo-icon" width={44} height={44} />
          <img src="/brand/accessly-wordmark-web-white.svg" alt="" className="logo-wordmark" width={141} height={40} />
        </Link>
        <div className="header-actions">
          <TabBar />
          <AskAllyLink className="ask-ally-header" />
        </div>
      </div>
    </header>
  );
}

/** Floating "Ask Ally" button for mobile and tablet; hidden on Ally itself and on Home ("Go somewhere" opens Ally). */
export function AskAllyFab() {
  const pathname = usePathname() ?? "/";
  if (pathname === "/" || pathname === "/ally" || pathname.startsWith("/ally/")) return null;
  return <AskAllyLink className="ask-ally-fab" />;
}
