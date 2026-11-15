import OrganizerChats from "@/components/OrganizerChats";
import BackLink from "@/components/ui/BackLink";

export const metadata = { title: "Chats · Organizer", robots: { index: false } };

export default function OrganizerChatsPage() {
  return (
    <>
      <BackLink href="/organizer">Organizer</BackLink>
      <header className="page-header">
        <h1>Chats</h1>
        <p className="lead">Questions attendees asked you directly. Anonymous unless they chose to share contact info.</p>
      </header>
      <div className="narrow">
        <OrganizerChats />
      </div>
    </>
  );
}
