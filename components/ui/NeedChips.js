import {
  Accessibility,
  ArrowUpDown,
  Armchair,
  Captions,
  CircleCheck,
  FileText,
  Hand,
  Type,
  Utensils,
  VolumeX,
  Bath,
  Footprints,
  Info,
} from "lucide-react";
import { needLabel, humanize } from "@/lib/labels";

// Icons for request/need types (lib/labels.js keys, plus the planned ones from CLAUDE.md).
const NEED_ICONS = {
  "step-free-route": Accessibility,
  elevator: ArrowUpDown,
  "noise-reduction": VolumeX,
  "quiet-space": VolumeX,
  captions: Captions,
  "asl-interpreter": Hand,
  "reserved-seating": Armchair,
  dietary: Utensils,
  "materials-in-advance": FileText,
  "large-print": Type,
  other: Info,
};

// Free-form event/space topics ("entrance", "food", "noise"…) → a best-guess icon.
const TOPIC_ICONS = [
  [/step|ramp|entrance|wheelchair|access/i, Accessibility],
  [/elevator|lift/i, ArrowUpDown],
  [/noise|quiet|sound|music|loud/i, VolumeX],
  [/caption|subtitle/i, Captions],
  [/asl|interpret|sign/i, Hand],
  [/seat|chair/i, Armchair],
  [/food|diet|allergen|meal/i, Utensils],
  [/restroom|bathroom|toilet/i, Bath],
  [/route|path|walk|distance/i, Footprints],
  [/material|slide|handout/i, FileText],
  [/print|font/i, Type],
];

/** Decorative icon for one need type. */
export function NeedIcon({ need }) {
  const Icon = NEED_ICONS[need] ?? Info;
  return <Icon aria-hidden="true" focusable="false" />;
}

export function iconForTopic(key) {
  return TOPIC_ICONS.find(([re]) => re.test(key))?.[1] ?? CircleCheck;
}

function ChipList({ items, label }) {
  if (!items.length) return null;
  return (
    <ul className="chip-list" aria-label={label}>
      {items.map(({ key, text, Icon }) => (
        <li key={key} className="chip">
          <Icon aria-hidden="true" focusable="false" />
          {text}
        </li>
      ))}
    </ul>
  );
}

/** Need types (e.g. ["captions", "elevator"]) as icon + label chips. */
export default function NeedChips({ needs = [], label }) {
  const items = needs.filter(Boolean).map((n) => ({
    key: n,
    text: needLabel(n) === n ? humanize(n) : needLabel(n),
    Icon: NEED_ICONS[n] ?? Info,
  }));
  return <ChipList items={items} label={label} />;
}

/** Event/space accessibility topics (object keys) as icon + label chips. */
export function TopicChips({ topics = [], label }) {
  const items = topics.map((t) => ({ key: t, text: humanize(t), Icon: iconForTopic(t) }));
  return <ChipList items={items} label={label} />;
}
