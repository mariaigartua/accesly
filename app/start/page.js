import QuickStart from "@/components/QuickStart";
import BackLink from "@/components/ui/BackLink";

export const metadata = { title: "Quick start" };

export default function StartPage() {
  return (
    <div className="narrow">
      <BackLink href="/">Home</BackLink>
      <header className="page-header">
        <h1>Quick start</h1>
        <p className="lead">Tell us what you want to do, and we&apos;ll point you to the right place.</p>
      </header>
      <QuickStart />
    </div>
  );
}
