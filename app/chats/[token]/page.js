import { notFound } from "next/navigation";
import AttendeeChat from "@/components/AttendeeChat";
import BackLink from "@/components/ui/BackLink";

export const metadata = { title: "Chat with the organizer", robots: { index: false } };

export default async function ChatPage({ params }) {
  const { token } = await params;
  if (!/^[a-f0-9]{32}$/.test(token ?? "")) notFound();
  return (
    <div className="narrow">
      <BackLink href="/profile#my-chats">My chats</BackLink>
      <header className="page-header">
        <h1>Chat with the organizer</h1>
      </header>
      <AttendeeChat token={token} />
    </div>
  );
}
