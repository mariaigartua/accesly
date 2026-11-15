import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";
import MyRequests from "@/components/MyRequests";
import MyChats from "@/components/MyChats";
import Card from "@/components/ui/Card";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <>
      <header className="page-header">
        <h1>Profile</h1>
        <p className="lead">Stored on this device only. We never see it.</p>
      </header>

      <div className="split">
        <div>
          <ProfileForm />
        </div>

        <div className="stack">
          <Card as="section" tint aria-labelledby="privacy-heading">
            <h2 id="privacy-heading" className="section-heading">
              <ShieldCheck aria-hidden="true" focusable="false" />
              Your privacy
            </h2>
            <ul>
              <li>Your profile lives only in this browser.</li>
              <li>Requests are anonymous unless you choose to share contact info.</li>
              <li>We ask what you need, never why.</li>
              <li>Requests auto-delete 7 days after the event.</li>
            </ul>
            <p>
              <Link href="/privacy">How we protect your privacy, and FAQ</Link>
            </p>
          </Card>

          <section id="my-requests" aria-labelledby="my-requests-heading" className="stack" tabIndex={-1}>
            <h2 id="my-requests-heading">My requests</h2>
            <MyRequests />
          </section>

          <section id="my-chats" aria-labelledby="my-chats-heading" className="stack" tabIndex={-1}>
            <h2 id="my-chats-heading">My chats</h2>
            <MyChats />
          </section>
        </div>
      </div>
    </>
  );
}
