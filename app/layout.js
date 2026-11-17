import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import Link from "next/link";
import SiteHeader, { AskAllyFab } from "@/components/SiteHeader";
import ServicesPausedDialog from "@/components/ServicesPausedDialog";
import "./globals.css";

// Brand font for headings, buttons, tabs.
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
// Body text: designed for low-vision readability.
const body = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: { default: "Accessly", template: "%s · Accessly" },
  description: "Know before you go. Ask for what you need, without explaining why.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {/* Lets keyboard and screen-reader users jump past the header. */}
        <a className="skip-link" href="#main">Skip to main content</a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>{children}</main>
        <AskAllyFab />
        <ServicesPausedDialog />
        <footer className="site-footer">
          <div className="container">
            <p>Accessly · Know before you go. Ask for what you need, without explaining why.</p>
            <p>
              <Link href="/privacy">How we protect your privacy</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
