import "./globals.css";

export const metadata = {
  title: "Accesly",
  description: "Know before you go. Ask for what you need — without explaining why.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Lets keyboard and screen-reader users jump past the header. */}
        <a className="skip-link" href="#main">Skip to main content</a>
        <header className="site-header">
          <a href="/" className="brand">Accesly</a>
        </header>
        <main id="main" tabIndex={-1}>{children}</main>
      </body>
    </html>
  );
}
