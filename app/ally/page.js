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
      <section className="feature-card ally-intro" aria-labelledby="ally-heading">
        <div className="ally-intro-row">
          <img src="/brand/accessly-icon-web.svg" alt="" width={56} height={56} className="ally-intro-avatar" />
          <div>
            <h1 id="ally-heading">I&apos;m Ally, your AI guide.</h1>
            <p className="no-margin">
              {mode === "help"
                ? "Ask me how Accessly works and how it protects your privacy."
                : "I check Accessly's campus data and the web, show my sources, and tell you when I'm not sure."}
            </p>
          </div>
        </div>
      </section>
      <AllyChat initialQuestion={q} mode={mode} />
    </>
  );
}
