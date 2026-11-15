"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Navigation, Pause, Play, Sparkles } from "lucide-react";

const CHOICES = [
  { href: "/ally", title: "Go somewhere", text: "Ask Ally how to get there accessibly.", icon: Navigation, tone: "cyan" },
  { href: "/explore#events", title: "Events", text: "See accessibility before you go.", icon: CalendarDays, tone: "sky" },
  { href: "/start", title: "Quick start", text: "Tell us what you want to do.", icon: Sparkles, tone: "" },
];

/**
 * Home = full-screen blue splash with the main menu. The decorative circles drift slowly;
 * the Pause button stops them (WCAG 2.2.2), and they never move under prefers-reduced-motion.
 */
export default function HomeSplash() {
  const [paused, setPaused] = useState(false);
  return (
    <section className={`splash ${paused ? "paused" : ""}`} aria-labelledby="home-heading">
      <span className="splash-circle c1" aria-hidden="true" />
      <span className="splash-circle c2" aria-hidden="true" />
      <span className="splash-circle c3" aria-hidden="true" />

      <div className="splash-content">
        <img src="/brand/accessly-wordmark-web-white.svg" alt="Accessly" className="splash-wordmark" width={197} height={56} />
        <h1 id="home-heading">Know before you go.</h1>
        <p className="lead">Ask for what you need, without explaining why.</p>

        <nav aria-label="Main menu">
          <ul className="menu-grid">
            {CHOICES.map(({ href, title, text, icon: Icon, tone }) => (
              <li key={href}>
                <Link href={href} className={`menu-card ${tone}`}>
                  <span className="menu-icon" aria-hidden="true">
                    <Icon focusable="false" />
                  </span>
                  <span className="menu-body">
                    <span className="menu-title">{title}</span>
                    <span className="menu-text">{text}</span>
                  </span>
                  <span className="arrow-circle" aria-hidden="true">
                    <ArrowRight focusable="false" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <button type="button" className="splash-pause" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
        {paused ? <Play aria-hidden="true" focusable="false" width={16} height={16} /> : <Pause aria-hidden="true" focusable="false" width={16} height={16} />}{" "}
        {paused ? "Play animation" : "Pause animation"}
      </button>
    </section>
  );
}
