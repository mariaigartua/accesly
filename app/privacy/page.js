import { ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export const metadata = { title: "Privacy & FAQ" };

const FAQ = [
  {
    q: "Do I need an account?",
    a: "No. There are no attendee accounts. Your profile and your saved request links live in this browser only.",
  },
  {
    q: "What does the organizer see when I send a request?",
    a: "Only the needs you ticked on that request and any details you typed. Your name or email is shared only if you turn on “Share” for that request.",
  },
  {
    q: "Do I have to say why I need something?",
    a: "Never. Accessly asks what you need, not why. You never have to disclose a disability or diagnosis.",
  },
  {
    q: "How do I check on a request?",
    a: "Each request gets a private link, saved under Profile → My requests on the device you sent it from. Copy the link if you want to check from another device. Anyone with the link can see that request, so keep it private.",
  },
  {
    q: "How long is my request kept?",
    a: "Requests are deleted automatically 7 days after the event.",
  },
  {
    q: "Are my questions to the AI saved?",
    a: "No. Questions to the event chat and to Ally are not stored or logged. Answers about an event come only from what the organizer shared.",
  },
  {
    q: "How do I delete my data?",
    a: "Go to Profile and press “Clear all my data”. That removes everything Accessly stored in this browser.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="narrow">
      <header className="page-header">
        <h1>Privacy &amp; FAQ</h1>
        <p className="lead">We care about your privacy! This is how we protect it.</p>
      </header>

      <div className="stack">
        <Card as="section" tint aria-labelledby="promises-heading">
          <h2 id="promises-heading" className="section-heading">
            <ShieldCheck aria-hidden="true" focusable="false" />
            Our promises
          </h2>
          <ul>
            <li>
              <strong>Your profile stays on your device.</strong> It&apos;s never sent to our server.
            </li>
            <li>
              <strong>Anonymous by default.</strong> Contact info is shared only when you choose, per request.
            </li>
            <li>
              <strong>Needs, not reasons.</strong> We never ask why you need something.
            </li>
            <li>
              <strong>Auto-delete.</strong> Requests are deleted 7 days after the event.
            </li>
            <li>
              <strong>The AI never stores your questions.</strong>
            </li>
          </ul>
        </Card>

        <Card as="section" aria-labelledby="ask-heading">
          <h2 id="ask-heading">Ask a question</h2>
          {/* Hands the question to Ally (help mode) via the URL; nothing is stored. */}
          <form action="/ally" method="get">
            <input type="hidden" name="mode" value="help" />
            <div className="field">
              <label htmlFor="privacy-q">Your question about Accessly or your privacy</label>
              <textarea id="privacy-q" name="q" rows={3} required />
            </div>
            <Button type="submit">Ask Ally</Button>
          </form>
        </Card>

        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading">FAQ</h2>
          <div className="faq">
            {FAQ.map(({ q, a }) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
