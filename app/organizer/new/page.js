import CreateEventFlow from "@/components/CreateEventFlow";
import BackLink from "@/components/ui/BackLink";

export const metadata = { title: "Create event", robots: { index: false } };

// Prefill comes from the URL (e.g. Quick start: /organizer/new?name=...&description=...) and is never stored.
export default async function NewEventPage({ searchParams }) {
  const sp = await searchParams;
  const prefill = {
    name: String(sp?.name ?? "").slice(0, 200),
    description: String(sp?.description ?? "").slice(0, 3000),
  };
  return (
    <div className="narrow">
      <BackLink href="/organizer">Organizer</BackLink>
      <header className="page-header">
        <h1>Create an event</h1>
        <p className="lead">Three short steps. No account: we&apos;ll give you a private organizer key at the end.</p>
      </header>
      <CreateEventFlow prefill={prefill} />
    </div>
  );
}
