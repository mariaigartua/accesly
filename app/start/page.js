import QuickStart from "@/components/QuickStart";
import BackLink from "@/components/ui/BackLink";

export const metadata = { title: "Quick start" };

export default function StartPage() {
  return (
    <>
      <BackLink href="/">Home</BackLink>
      <QuickStart />
    </>
  );
}
