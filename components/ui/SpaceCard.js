import Link from "next/link";
import {
  BookOpen, Building, Building2, CalendarCheck, ChevronRight, Drama, Dumbbell, FlaskConical, Hotel, Landmark,
  School, Sofa, Trees, Users, UtensilsCrossed,
} from "lucide-react";
import { TopicChips } from "./NeedChips";

// Icon by kind of place (from its name); otherwise a rotation so neighbouring rows differ.
const KIND_ICONS = [
  [/librar/i, BookOpen],
  [/union|student center|campus center/i, Users],
  [/arts?\b|theat|music|gallery/i, Drama],
  [/science|lab|engineering|research/i, FlaskConical],
  [/rec\b|gym|athletic|sport|fitness/i, Dumbbell],
  [/dining|caf|food|kitchen/i, UtensilsCrossed],
  [/commons|lounge/i, Sofa],
  [/residen|dorm|house/i, Hotel],
  [/garden|pond|park|lawn/i, Trees],
  [/hall\b|auditorium|lecture/i, School],
];
const FALLBACK_ICONS = [Building2, Landmark, Building];
export function iconForSpace(name = "", index = 0) {
  return KIND_ICONS.find(([re]) => re.test(name))?.[1] ?? FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

/** Location list row. `space`: { _id, name, features: string[], lastChecked } (serializable). */
export default function SpaceCard({ space, index = 0, headingLevel: H = "h3" }) {
  const Icon = iconForSpace(space.name, index);
  return (
    <article className="card card-link list-row">
      <span className={`row-thumb c${index % 3}`} aria-hidden="true">
        <Icon focusable="false" />
      </span>
      <div className="row-body">
        <H>
          <Link href={`/spaces/${space._id}`} className="stretch">
            {space.name}
          </Link>
        </H>
        <p className="meta no-margin">
          <CalendarCheck aria-hidden="true" focusable="false" />
          {space.lastChecked ? `Last checked ${space.lastChecked}` : "Not checked yet"}
        </p>
        <TopicChips topics={space.features.slice(0, 4)} label="Accessibility info on file" />
      </div>
      <ChevronRight className="row-chevron" aria-hidden="true" focusable="false" />
    </article>
  );
}
