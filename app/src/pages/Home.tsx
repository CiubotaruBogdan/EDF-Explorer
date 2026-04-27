import Layout from "@/components/Layout";
import { Link } from "wouter";
import { useMemo } from "react";
import { ArrowRight, BookOpen, Building2, LineChart, Layers3, Search } from "lucide-react";
import { useDataset } from "@/lib/useDataset";
import { formatEuro, formatNumber } from "@/lib/data";

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-border bg-card p-5 sm:p-6">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-mono text-2xl sm:text-3xl text-foreground tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function NavCard({
  to,
  title,
  blurb,
  icon: Icon,
}: {
  to: string;
  title: string;
  blurb: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={to}
      className="group block border border-border bg-card p-5 sm:p-6 hover:border-foreground transition-colors"
    >
      <div className="flex items-start gap-4">
        <Icon className="h-5 w-5 mt-1 text-muted-foreground group-hover:text-foreground transition-colors" />
        <div className="flex-1">
          <div
            style={{ fontFamily: "var(--font-serif)" }}
            className="text-lg font-semibold text-foreground"
          >
            {title}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-foreground">
            Open <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { projects, companies, meta, loading, error } = useDataset();

  const totals = useMemo(() => {
    if (!projects || !companies) return null;
    const euContrib = projects.reduce((s, p) => s + (p.eu_contribution ?? 0), 0);
    const countries = new Set(projects.flatMap((p) => p.countries)).size;
    return { projects: projects.length, euContrib, companies: companies.length, countries };
  }, [projects, companies]);

  return (
    <Layout>
      <section className="max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          European Defence Fund — open dataset
        </p>
        <h1
          style={{ fontFamily: "var(--font-serif)" }}
          className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground leading-tight"
        >
          A reading room for every project funded by the European Defence Fund.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
          Browse, search and analyse EDF grant agreements published by the European Commission —
          projects, consortia, budgets and participating organisations.
          Data sourced directly from the{" "}
          <strong className="text-foreground">EC Funding & Tenders Portal API</strong>.
        </p>
      </section>

      {error && (
        <div className="mt-8 border border-destructive bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load dataset: {error}
        </div>
      )}

      <section className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="Projects"
          value={loading ? "—" : formatNumber(totals?.projects ?? 0)}
          hint="EDF calls 2021–2025"
        />
        <StatTile
          label="EU contribution"
          value={loading ? "—" : formatEuro(totals?.euContrib ?? 0, { compact: true })}
          hint="awarded across all calls"
        />
        <StatTile
          label="Companies & labs"
          value={loading ? "—" : formatNumber(totals?.companies ?? 0)}
          hint="unique participants"
        />
        <StatTile
          label="Countries"
          value={loading ? "—" : formatNumber(totals?.countries ?? 0)}
          hint="represented in consortia"
        />
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <h2
            style={{ fontFamily: "var(--font-serif)" }}
            className="text-xl sm:text-2xl font-semibold"
          >
            Where to begin
          </h2>
          {meta && (
            <span className="text-xs text-muted-foreground">
              Updated {new Date(meta.generated_at).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <NavCard
            to="/projects"
            title="Browse all projects"
            blurb="Filter by year, country, status. Open any project to read the full consortium and the official portal entry."
            icon={Search}
          />
          <NavCard
            to="/companies"
            title="Companies & laboratories"
            blurb="See which industrial groups, SMEs and research bodies appear most often as coordinators or beneficiaries."
            icon={Building2}
          />
          <NavCard
            to="/statistics"
            title="Statistics dashboard"
            blurb="Funding by year, by country. Consortium size distributions and top coordinators."
            icon={LineChart}
          />
          <NavCard
            to="/charts"
            title="Build your own chart"
            blurb="Pick any axis combination — year, country, coordinator — and render it as a chart instantly."
            icon={Layers3}
          />
          <NavCard
            to="/about"
            title="About the data"
            blurb="Sources, methodology, dataset schema and licensing."
            icon={BookOpen}
          />
        </div>
      </section>
    </Layout>
  );
}
