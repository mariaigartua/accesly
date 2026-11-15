import Button from "@/components/ui/Button";
import { House } from "lucide-react";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="hero">
      <img src="/brand/accessly-icon-web.svg" alt="" width={72} height={72} />
      <h1>We couldn&apos;t find that page</h1>
      <p className="lead">It may have moved, or this part of Accessly isn&apos;t built yet.</p>
      <div className="button-row justify-center mt-md">
        <Button href="/" icon={House}>
          Go to Home
        </Button>
      </div>
    </section>
  );
}
