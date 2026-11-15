import { Bird, Cat, Dog, Fish, Rabbit, Squirrel, Turtle, UserRound } from "lucide-react";

// Placeholder avatars (icon + color) until the final illustrated set is chosen.
export const AVATARS = {
  cat: { label: "Cat", icon: Cat, color: "#00758a" },
  dog: { label: "Dog", icon: Dog, color: "#014cae" },
  bird: { label: "Bird", icon: Bird, color: "#8a5a00" },
  rabbit: { label: "Rabbit", icon: Rabbit, color: "#6b3fa0" },
  turtle: { label: "Turtle", icon: Turtle, color: "#1b7f3b" },
  fish: { label: "Fish", icon: Fish, color: "#b3261e" },
  squirrel: { label: "Squirrel", icon: Squirrel, color: "#5a4a3a" },
};

/** Decorative avatar circle; pair it with visible text (name or "Profile"). */
export default function Avatar({ id, size = 28 }) {
  const a = AVATARS[id];
  const Icon = a?.icon ?? UserRound;
  return (
    <span
      className={`avatar ${a ? "" : "avatar-empty"}`}
      style={{ "--avatar-size": `${size}px`, "--avatar-color": a?.color }}
      aria-hidden="true"
    >
      <Icon focusable="false" />
    </span>
  );
}
