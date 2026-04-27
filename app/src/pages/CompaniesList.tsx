import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import FilterPanel, { type Facet, type FilterState } from "@/components/FilterPanel";
import { useDataset } from "@/lib/useDataset";
import { formatNumber, countryName } from "@/lib/data";
import type { Company } from "@/lib/types";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type SortKey = "name" | "projects" | "country";

function initialStateFromUrl(): FilterState {
  const params = new URLSearchParams(window.location.search);
  const selected: Record<string, string[]> = {};
  ["country"].forEach((k) => {
    const v = params.get(k);
    if (v) selected[k] = v.split(",").filter(Boolean);
  });
  return { q: params.get("q") ?? "", selected };
}

export default function CompaniesList() {
  const { companies, projects, loading, error } = useDataset();
  const validProjectIds = useMemo(() => new Set(projects?.map((p) => p.project_id) ?? []), [projects]);
  const [state, setState] = useState<FilterState>(() => initialStateFromUrl());
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "projects",
    dir: "desc",
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    url.search = "";
    if (state.q) url.searchParams.set("q", state.q);
    for (const [k, vs] of Object.entries(state.selected)) {
      if (vs.length) url.searchParams.set(k, vs.join(","));
    }
    window.history.replaceState({}, "", url.pathname + (url.search || ""));
  }, [state]);

  const filtered: Company[] = useMemo(() => {
    if (!companies) return [];
    const q = state.q.trim().toLowerCase();
    return companies.filter((c) => {
      if (q) {
        const hay = [c.legal_name, c.business_name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const sel = state.selected;
      if (sel.country?.length && !sel.country.includes(c.country)) return false;
      return true;
    });
  }, [companies, state]);

  const facets: Facet[] = useMemo(() => {
    if (!companies) return [];
    const countries = new Map<string, number>();
    for (const c of filtered) {
      if (c.country) countries.set(c.country, (countries.get(c.country) ?? 0) + 1);
    }
    const allCountries = Array.from(new Set(companies.map((c) => c.country).filter(Boolean))).sort();
    let countryOpts = allCountries
      .map((v) => ({ value: v, label: countryName(v), count: countries.get(v) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
    if (countryOpts.length > 30) countryOpts = countryOpts.slice(0, 30);
    return [
      { key: "country", label: "Country", options: countryOpts, searchable: true },
    ];
  }, [companies, filtered]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sort.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sort.key) {
        case "name":
          return dir * a.legal_name.localeCompare(b.legal_name);
        case "projects":
          return dir * (a.project_count - b.project_count);
        case "country":
          return dir * (a.country ?? "").localeCompare(b.country ?? "");
      }
    });
    return arr;
  }, [filtered, sort]);

  const onSort = (k: SortKey) =>
    setSort((s) => (s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "desc" }));

  return (
    <Layout>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Companies & entities
        </p>
        <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl font-semibold">
          Participating organisations
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {loading
            ? "Loading…"
            : `${formatNumber(sorted.length)} of ${formatNumber(companies?.length ?? 0)} unique organisations matching the current filters.`}
        </p>
      </header>

      {error && (
        <div className="border border-destructive bg-destructive/5 p-4 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:gap-8 lg:gap-10">
        {!loading && companies && (
          <FilterPanel facets={facets} state={state} onChange={setState} matchedCount={sorted.length} />
        )}
        <div className="flex-1 min-w-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0 border-y border-border md:border md:border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <Th onClick={() => onSort("name")} sort={sort} k="name" className="text-left">Entity</Th>
                  <Th onClick={() => onSort("country")} sort={sort} k="country" className="text-left hidden sm:table-cell">Country</Th>
                  <Th onClick={() => onSort("projects")} sort={sort} k="projects" className="text-right">Projects</Th>
                  <th className="text-left font-medium py-2 px-3 hidden md:table-cell">Type</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <tr key={c.pic} className="border-b border-border last:border-b-0 hover:bg-secondary/40">
                    <td className="py-3 px-3 align-middle">
                      <Link href={`/companies/${encodeURIComponent(c.pic)}`} className="text-foreground hover:underline">
                        {c.legal_name}
                      </Link>
                      <div className="sm:hidden text-xs text-muted-foreground mt-1">
                        {c.country ? countryName(c.country) : "—"} · {(c.participations ?? []).filter((p) => validProjectIds.has(p.project_id)).length} projects
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle text-muted-foreground hidden sm:table-cell">
                      {c.country ? countryName(c.country) : "—"}
                    </td>
                    <td className="py-3 px-3 align-middle text-center num text-foreground">{(c.participations ?? []).filter((p) => validProjectIds.has(p.project_id)).length}</td>
                    <td className="py-3 px-3 align-top text-muted-foreground hidden md:table-cell text-xs">
                      {c.classification_type ?? "—"}
                    </td>
                  </tr>
                ))}
                {!loading && sorted.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground text-sm">
                      No entities match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Th({
  children,
  onClick,
  sort,
  k,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  sort: { key: string; dir: "asc" | "desc" };
  k: string;
  className?: string;
}) {
  const active = sort.key === k;
  return (
    <th onClick={onClick} className={"font-medium py-2 px-3 cursor-pointer select-none " + (className ?? "")}>
      <span className="inline-flex items-center gap-1">
        {children}
        {active ? (
          sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30" />
        )}
      </span>
    </th>
  );
}
