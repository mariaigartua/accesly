import Link from "next/link";
import { CalendarDays, Navigation, Sparkles } from "lucide-react";

// Home = main menu. Three big choices; everything else is one tap away in the tab bar.
const CHOICES = [
  {
    href: "/ally",
    title: "Go somewhere",
    text: "Ask Ally how to get somewhere accessibly.",
    icon: Navigation,
  },
  {
    href: "/explore#events",
    title: "Events",
    text: "Find events and see their accessibility before you go.",
    icon: CalendarDays,
  },
  {
    href: "/start",
    title: "Quick start",
    text: "Tell us what you want to do and we'll point you to the right place.",
    icon: Sparkles,
  },
];

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <img src="/brand/accessly-icon-web.svg" alt="" width={72} height={72} />
        <h1>Know before you go.</h1>
        <p className="lead">Ask for what you need, without explaining why.</p>
      </section>

      <nav aria-label="Main menu">
        <ul className="menu-grid">
          {CHOICES.map(({ href, title, text, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="menu-card">
                <Icon aria-hidden="true" focusable="false" />
                <span className="menu-title">{title}</span>
                <span className="menu-text">{text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
