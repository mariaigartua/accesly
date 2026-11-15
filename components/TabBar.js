"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Compass, UserRound } from "lucide-react";
import { getProfile, useLocal, DEFAULT_PROFILE } from "@/lib/local";
import Avatar from "./ui/Avatar";

// `sections` = other paths that belong to this tab (e.g. an event page lives under Explore).
const TABS = [
  { href: "/explore", label: "Explore", icon: Compass, sections: ["/events", "/spaces"] },
  { href: "/organizer", label: "Organizer", icon: CalendarDays, sections: [] },
  { href: "/profile", label: "Profile", icon: UserRound, sections: ["/requests", "/chats", "/privacy"] },
];

const within = (path, base) => path === base || path.startsWith(`${base}/`);

export default function TabBar() {
  const pathname = usePathname() ?? "/";
  const [profile] = useLocal(getProfile, DEFAULT_PROFILE);
  return (
    <nav className="tabbar" aria-label="Main">
      <ul>
        {TABS.map(({ href, label, icon: Icon, sections }) => {
          // "page" for the tab's own page; "true" when on a page inside that section.
          const current =
            pathname === href ? "page" : [href, ...sections].some((b) => within(pathname, b)) ? "true" : undefined;
          return (
            <li key={href}>
              <Link href={href} className="tab" aria-current={current}>
                {href === "/profile" && profile.avatar ? (
                  <Avatar id={profile.avatar} size={22} />
                ) : (
                  <Icon aria-hidden="true" focusable="false" />
                )}
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
