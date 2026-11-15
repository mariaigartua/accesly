import Link from "next/link";
import { Building2, CalendarCheck, ChevronRight } from "lucide-react";
import { TopicChips } from "./NeedChips";

/** Location list row. `space`: { _id, name, features: string[], lastChecked } (serializable). */
export default function SpaceCard({ space, index = 0, headingLevel: H = "h3" }) {
  return (
    <article className="card card-link list-row">
      <span className={`row-thumb c${index % 3}`} aria-hidden="true">
        <Building2 focusable="false" />
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
