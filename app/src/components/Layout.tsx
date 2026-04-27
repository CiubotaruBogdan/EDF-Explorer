/**
 * Layout — top-of-the-page chrome for every route.
 *
 * Theme: Editorial Government Dossier. The single piece of "decoration" is the
 * 3px gold rule under the brand name (EU-flag derived).
 */

import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/projects", label: "Projects" },
  { to: "/companies", label: "Companies" },
  { to: "/statistics", label: "Statistics" },
  { to: "/charts", label: "Chart Builder" },
  { to: "/about", label: "About" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [loc] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-2 select-none">
              <span style={{ fontFamily: "var(--font-serif)" }} className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                EDF Explorer
              </span>
              <span className="hidden sm:inline text-xs uppercase tracking-widest text-muted-foreground">
                Open dataset
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle navigation"
              className="md:hidden p-2 -mr-2 rounded-sm hover:bg-secondary"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((item) => {
                const active = loc === item.to || (item.to !== "/" && loc.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    className={
                      "relative px-3 py-2 text-sm transition-colors " +
                      (active
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {item.label}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-foreground"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        {mobileNavOpen && (
          <nav className="md:hidden border-t border-border bg-background">
            <div className="max-w-[1320px] mx-auto px-4 py-2 flex flex-col">
              {NAV.map((item) => {
                const active = loc === item.to || (item.to !== "/" && loc.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className={
                      "py-3 px-2 text-sm border-b border-border last:border-b-0 " +
                      (active
                        ? "text-foreground font-medium"
                        : "text-muted-foreground")
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {children}
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-8">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 text-xs text-muted-foreground space-y-2 text-center">
          <p>
            Independent visualisation of public data published by the European Commission,
            Directorate-General for Defence Industry and Space (DG DEFIS). Not affiliated with the European Union.
          </p>
          <p>
            Data sourced from the{" "}
            <a href="https://api.tech.ec.europa.eu/search-api/prod/rest/search" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">EC Funding & Tenders Portal API</a>.
            {" "}Open source —{" "}
            <a href="https://github.com/CiubotaruBogdan/ec-edf-api" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">API scraper</a>
            {" "}·{" "}
            <a href="https://github.com/CiubotaruBogdan/edf-explorer" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Application</a> on GitHub.
          </p>
          <p>
            Generated by{" "}
            <a href="https://ciubotarubogdan.ro/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              Ciubotaru Bogdan-Iulian, PhD
            </a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
