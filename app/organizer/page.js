import OrganizerDashboard from "@/components/OrganizerDashboard";

export const metadata = { title: "Organizer", robots: { index: false } };

export default function OrganizerPage() {
  return (
    <>
      <header className="page-header">
        <h1>Organizer</h1>
        <p className="lead">
          Your events on this device, their accommodation requests, and messages from attendees. No account needed:
          each event&apos;s key is saved in this browser.
        </p>
      </header>
      <OrganizerDashboard />
    </>
  );
}
