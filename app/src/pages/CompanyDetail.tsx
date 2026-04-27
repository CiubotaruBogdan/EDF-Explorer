import { Link, useRoute } from "wouter";
import Layout from "@/components/Layout";
import { useDataset } from "@/lib/useDataset";
import { formatEuro, formatNumber, getProjectsByIds, getYear, countryName } from "@/lib/data";
import { ArrowLeft, ExternalLink } from "lucide-react";
import NotFound from "./NotFound";

export default function CompanyDetail() {
  const [, params] = useRoute<{ id: string }>("/companies/:id");
  const { companies, projects, loading, error } = useDataset();

  if (loading) {
    return (
      <Layout>
        <div className="text-sm text-muted-foreground">Loading…</div>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout>
        <div className="border border-destructive bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      </Layout>
    );
  }
  if (!companies || !projects) return <NotFound />;

  const pic = params ? decodeURIComponent(params.id) : "";
  const company = companies.find((c) => c.pic === pic);
  if (!company) return <NotFound />;

  const projectIds = company.participations.map((x) => x.project_id);
  const participationProjects = getProjectsByIds(projects, projectIds).sort((a, b) =>
    getYear(b).localeCompare(getYear(a)),
  );

  const ecOrgUrl = `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/org-details/${company.pic}`;

  return (
    <Layout>
      <Link
        href="/companies"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> All companies
      </Link>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Entity · {company.country ? countryName(company.country) : "—"}
          {company.city && <> · {company.city}</>}
        </p>
        <h1
          style={{ fontFamily: "var(--font-serif)" }}
          className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight"
        >
          {company.legal_name}
        </h1>
        {company.classification_type && (
          <p className="mt-1 text-xs text-muted-foreground">{company.classification_type}</p>
        )}
      </header>

      <section className="grid grid-cols-3 gap-px bg-border border border-border mb-10">
        <Stat label="Projects" value={formatNumber(participationProjects.length)} />
        <Stat label="As coordinator" value={formatNumber(participationProjects.filter(p => p.coordinator?.pic === company.pic).length)} />
        <Stat label="PIC" value={company.pic} />
      </section>

      <section className="mb-10">
        <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-semibold mb-4">
          Project participations
        </h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0 border-y border-border md:border md:border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium py-2 px-3">Project</th>
                <th className="text-left font-medium py-2 px-3 hidden sm:table-cell">Year · Status</th>
                <th className="text-left font-medium py-2 px-3 hidden md:table-cell">Role</th>
                <th className="text-right font-medium py-2 px-3">Total budget</th>
              </tr>
            </thead>
            <tbody>
              {participationProjects.map((p) => {
                const participation = company.participations.find((pp) => pp.project_id === p.project_id);
                const isCoord = participation?.role === "coordinator";
                return (
                  <tr
                    key={p.project_id}
                    className="border-b border-border last:border-b-0 hover:bg-secondary/40"
                  >
                    <td className="py-3 px-3 align-middle">
                      <Link href={`/projects/${p.project_id}`} className="block">
                        <div
                          style={{ fontFamily: "var(--font-serif)" }}
                          className="font-semibold text-foreground"
                        >
                          {p.acronym ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {p.title}
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-3 align-middle text-foreground/85 hidden sm:table-cell">
                      {getYear(p)} · {p.status}
                    </td>
                    <td className="py-3 px-3 align-middle text-foreground/85 hidden md:table-cell">
                      {isCoord ? (
                        <span className="text-[10px] uppercase tracking-widest font-medium px-1.5 py-0.5 bg-foreground text-background">
                          Coordinator
                        </span>
                      ) : (
                        "Member"
                      )}
                    </td>
                    <td className="py-3 px-3 align-middle text-right num text-foreground">
                      {formatEuro(p.overall_budget, { compact: true })}
                    </td>
                  </tr>
                );
              })}
              {participationProjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground text-sm">
                    No participations recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-semibold mb-3">
          Source
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href={ecOrgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
            >
              EC Funding & Tenders Portal — Organisation profile
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
        </ul>
      </section>
    </Layout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-4 sm:p-5">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-xl sm:text-2xl text-foreground num font-medium">{value}</div>
    </div>
  );
}
