import { Link, useRoute } from "wouter";
import Layout from "@/components/Layout";
import { useDataset } from "@/lib/useDataset";
import { formatEuro, formatNumber, getYear, getProgram, getDurationMonths, projectPortalUrl, countryName } from "@/lib/data";
import type { Project } from "@/lib/types";
import { ArrowLeft, ExternalLink, Globe, Users } from "lucide-react";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const [, params] = useRoute<{ key: string }>("/projects/:key");
  const { projects, companies, loading, error } = useDataset();

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
  if (!projects) return <NotFound />;

  const project = params ? projects.find((p) => p.project_id === params.key) : null;
  if (!project) return <NotFound />;

  const year = getYear(project);
  const program = getProgram(project);
  const durationMonths = getDurationMonths(project);

  const fundingRatio =
    project.overall_budget && project.eu_contribution
      ? (project.eu_contribution / project.overall_budget) * 100
      : project.eu_contribution_rate ?? null;

  // Other projects led by the same coordinator (match by PIC)
  const sameCoordinator = project.coordinator?.pic
    ? projects.filter(
        (p) =>
          p.coordinator?.pic === project.coordinator?.pic &&
          p.project_id !== project.project_id,
      ).slice(0, 6)
    : [];

  return (
    <Layout>
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {program} · {year}
          {project.status === "Ended" && (
            <span className="ml-2 align-middle text-[10px] uppercase tracking-widest border border-border px-1.5 py-0.5">
              Ended
            </span>
          )}
        </p>
        <h1
          style={{ fontFamily: "var(--font-serif)" }}
          className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight"
        >
          {project.acronym}
        </h1>
        {project.title && (
          <p
            style={{ fontFamily: "var(--font-serif)" }}
            className="mt-2 text-lg sm:text-xl text-foreground/80 italic"
          >
            {project.title}
          </p>
        )}
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border mb-10">
        <Stat label="Total budget" value={formatEuro(project.overall_budget, { compact: true })} />
        <Stat label="EU contribution" value={formatEuro(project.eu_contribution, { compact: true })} />
        <Stat
          label="Funding rate"
          value={fundingRatio != null ? `${fundingRatio.toFixed(1)}\u00a0%` : "—"}
        />
        <Stat
          label="Duration"
          value={durationMonths != null ? `${durationMonths} mo` : "—"}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-10">
          {project.objective && (
            <section>
              <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-semibold mb-3">
                Objective
              </h2>
              <p className="text-base leading-relaxed text-foreground/85">
                {project.objective}
              </p>
            </section>
          )}

          {project.keywords.length > 0 && (
            <section>
              <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-semibold mb-3">
                Keywords
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs border border-border px-2 py-1 text-muted-foreground"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-semibold mb-3">
              Call and topic
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6 text-sm">
              <DT>Programme</DT><DD>{program} · {year}</DD>
              <DT>Call</DT><DD>{project.call_identifier || "—"}</DD>
              <DT>Topic</DT><DD>{project.topic || "—"}</DD>
              <DT>Type of action</DT><DD>{project.type_of_action || "—"}</DD>
              <DT>Implementing body</DT><DD>{project.implementing_body || "—"}</DD>
              {project.start_date && (
                <>
                  <DT>Start date</DT><DD>{project.start_date}</DD>
                </>
              )}
              {project.end_date && (
                <>
                  <DT>End date</DT><DD>{project.end_date}</DD>
                </>
              )}
              {project.ec_signature_date && (
                <>
                  <DT>EC signature</DT><DD>{project.ec_signature_date}</DD>
                </>
              )}
            </dl>
          </section>

          <section>
            <h2
              style={{ fontFamily: "var(--font-serif)" }}
              className="text-2xl font-semibold mb-3 flex items-baseline justify-between"
            >
              <span>Consortium</span>
              <span className="text-sm font-sans font-normal text-muted-foreground">
                <Users className="inline h-4 w-4 mr-1" />
                <span className="num">{formatNumber(project.consortium_size)}</span> entities ·{" "}
                <Globe className="inline h-4 w-4 ml-1 mr-1" />
                <span className="num">{formatNumber(project.countries.length)}</span> countries
              </span>
            </h2>
            <ol className="divide-y divide-border border-y border-border">
              {project.participants.map((m, idx) => (
                <li key={idx} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    {m.pic ? (
                      <Link href={`/companies/${m.pic}`} className="text-sm text-foreground hover:underline">
                        {m.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-foreground">{m.name}</span>
                    )}
                    {m.role === "coordinator" && (
                      <span className="ml-2 align-middle text-[10px] uppercase tracking-widest font-medium px-1.5 py-0.5 bg-foreground text-background">
                        Coordinator
                      </span>
                    )}
                    {m.role === "thirdParty" && (
                      <span className="ml-2 align-middle text-[10px] uppercase tracking-widest border border-border px-1.5 py-0.5 text-muted-foreground">
                        Third party
                      </span>
                    )}
                    {m.city && (
                      <div className="text-xs text-muted-foreground mt-0.5">{m.city}</div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground shrink-0">
                    {m.country ? countryName(m.country) : "—"}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-semibold mb-3">
              Source
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={projectPortalUrl(project)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
                >
                  EC Funding & Tenders Portal
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </section>
        </div>

        <aside className="lg:border-l lg:border-border lg:pl-8 space-y-8">
          {sameCoordinator.length > 0 && (
            <RelatedListBlock title="Other projects led by this coordinator" projects={sameCoordinator} />
          )}
        </aside>
      </div>
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
function DT({ children }: { children: React.ReactNode }) {
  return <dt className="sm:col-span-1 text-xs uppercase tracking-widest text-muted-foreground">{children}</dt>;
}
function DD({ children, className }: { children: React.ReactNode; className?: string }) {
  return <dd className={"sm:col-span-2 text-foreground/85 " + (className ?? "")}>{children}</dd>;
}

function RelatedListBlock({ title, projects }: { title: string; projects: Project[] }) {
  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">{title}</h3>
      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.project_id} className="marginalia">
            <Link href={`/projects/${p.project_id}`} className="block">
              <span style={{ fontFamily: "var(--font-serif)" }} className="text-foreground font-semibold">
                {p.acronym ?? "—"}
              </span>
              <span className="text-muted-foreground"> · {getProgram(p)} {getYear(p)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
