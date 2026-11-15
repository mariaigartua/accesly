import { notFound, redirect } from "next/navigation";
import { collections } from "@/lib/mongodb";
import { SLUG_RE } from "@/lib/slug";

export const dynamic = "force-dynamic";

// Short link from fliers and QR codes: /e/<slug> → the event page.
export default async function ShortLink({ params }) {
  const { slug } = await params;
  const s = String(slug).toLowerCase();
  if (!SLUG_RE.test(s)) notFound();
  const { events } = await collections();
  const event = await events.findOne({ slug: s }, { projection: { _id: 1 } });
  if (!event) notFound();
  redirect(`/events/${event._id}`);
}
