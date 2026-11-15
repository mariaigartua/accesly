import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { TopicChips } from "./NeedChips";

/** Building/space summary card. `space`: { _id, name, features: string[], lastChecked } (serializable). */
export default function SpaceCard({ space, headingLevel: H = "h3" }) {
  return (
    <article className="card card-link">
      <H className="h3">
        <Link href={`/spaces/${space._id}`}>{space.name}</Link>
      </H>
      <TopicChips topics={space.features.slice(0, 5)} label="Accessibility info on file" />
      <ul className="meta">
        <li>
          <CalendarCheck aria-hidden="true" focusable="false" />
          {space.lastChecked ? `Last checked ${space.lastChecked}` : "Not checked yet"}
        </li>
      </ul>
    </article>
  );
}
