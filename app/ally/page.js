import AllyChat from "@/components/AllyChat";
import BackLink from "@/components/ui/BackLink";

export const metadata = { title: "Ally, your AI guide" };

// ?q= prefills (and asks) a question, e.g. from Quick start or the Privacy page. Never stored.
// ?mode=help answers questions about Accessly itself.
export default async function AllyPage({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp?.q ?? "").slice(0, 1000);
  const mode = sp?.mode === "help" ? "help" : "";
  return (
    <>
      <BackLink href="/">Home</BackLink>
      <AllyChat initialQuestion={q} mode={mode} />
    </>
  );
}
