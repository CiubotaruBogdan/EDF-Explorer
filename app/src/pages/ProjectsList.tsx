import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import Layout from "@/components/Layout";
import FilterPanel, { type Facet, type FilterState } from "@/components/FilterPanel";
import { useDataset } from "@/lib/useDataset";
import { formatEuro, formatNumber, getYear, getProgram, countryName } from "@/lib/data";
import type { Project } from "@/lib/types";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type SortKey = "acronym" | "year" | "budget" | "eu" | "members" | "country";

function initialStateFromUrl(): FilterState {
  const params = new URLSearchParams(window.location.search);
  const selected: Record<string, string[]> = {};
  ["year", "status", "country"].forEach((k) => {
    const v = params.get(k);
    if (v) selected[k] = v.split(",").filter(Boolean);
  });
  return { q: params.get("q") ?? "", selected };
}

export default function ProjectsList() {
  const { projects, loading, error } = useDataset();
  const [loc] = useLocation();

  const [state, setState] = useState<FilterState>(() => initialStateFromUrl());
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "year",
    dir: "desc",
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    url.search = "";
    if (state.q) url.searchParams.set("q", state.q);
    for (const [k, vs] of Object.entries(state.selected)) {
      if (vs.length) url.searchParams.set(k, vs.join(","));
    }
    window.history.replaceState({}, "", url.pathname + (url.search || "") + url.hash);
  }, [state]);


  const filtered: Project[] = useMemo(() => {
    if (!projects) return [];
    const sel = state.selected;
    let base = projects.filter((p) => {
      if (sel.year?.length && !sel.year.includes(getYear(p))) return false;
      if (sel.status?.length && !sel.status.includes(p.status)) return false;
      if (sel.country?.length && !sel.country.some((c) => p.countries.includes(c))) return false;
      return true;
    });
    const q = state.q.trim().toLowerCase();
    if (q) {
      base = base.filter((p) => {
        const haystack = [
          p.acronym,
          p.title,
          p.objective,
          p.coordinator?.name,
          p.call_identifier,
          p.topic,
          ...p.participants.map((m) => m.name),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    return base;
  }, [projects, state]);

  const facets: Facet[] = useMemo(() => {
    if (!projects) return [];
    const countAll = (key: "year" | "status" | "country") => {
      const m = new Map<string, number>();
      for (const p of filtered) {
        let vals: string[] = [];
        if (key === "year") vals = [getYear(p)];
        else if (key === "status") vals = [p.status];
        else if (key === "country") vals = p.countries;
        for (const v of vals) if (v) m.set(v, (m.get(v) ?? 0) + 1);
      }
      return m;
    };
    const allValues = (key: "year" | "status" | "country") => {
      const set = new Set<string>();
      for (const p of projects) {
        let vals: string[] = [];
        if (key === "year") vals = [getYear(p)];
        else if (key === "status") vals = [p.status];
        else if (key === "country") vals = p.countries;
        for (const v of vals) if (v) set.add(v);
      }
      return Array.from(set).sort();
    };
    const buildFacet = (label: string, k: "year" | "status" | "country"): Facet => {
      const counts = countAll(k);
      let opts = allValues(k).map((v) => ({ value: v, label: k === "country" ? countryName(v) : undefined, count: counts.get(v) ?? 0 }));
      opts.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
      if (k === "country" && opts.length > 30) opts = opts.slice(0, 30);
      return { key: k, label, options: opts, searchable: k === "country" };
    };
    return [
      buildFacet("Year", "year"),
      buildFacet("Status", "status"),
      buildFacet("Country", "country"),
    ];
  }, [projects, filtered]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sort.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sort.key) {
        case "acronym":
          return dir * String(a.acronym ?? "").localeCompare(String(b.acronym ?? ""));
        case "year":
          return dir * getYear(a).localeCompare(getYear(b));
        case "budget":
          return dir * ((a.overall_budget ?? 0) - (b.overall_budget ?? 0));
        case "eu":
          return dir * ((a.eu_contribution ?? 0) - (b.eu_contribution ?? 0));
        case "members":
          return dir * (a.consortium_size - b.consortium_size);
        case "country":
          return dir * (a.countries.length - b.countries.length);
      }
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  const onSort = (k: SortKey) =>
    setSort((s) => (s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "desc" }));

  return (
    <Layout>
      <header className="mb-6 max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Index</p>
        <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl font-semibold">
          Projects
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {loading
            ? "Loading dataset…"
            : `${formatNumber(sorted.length)} of ${formatNumber(projects?.length ?? 0)} projects matching the current filters.`}
        </p>
      </header>

      {error && (
        <div className="border border-destructive bg-destructive/5 p-4 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:gap-8 lg:gap-10">
        {!loading && projects && (
          <FilterPanel facets={facets} state={state} onChange={setState} matchedCount={sorted.length} />
        )}

        <div className="flex-1 min-w-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0 border-y border-border md:border-y-0 md:border md:border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <Th onClick={() => onSort("acronym")} sort={sort} k="acronym" className="text-left">Project</Th>
                  <Th onClick={() => onSort("year")} sort={sort} k="year" className="text-left hidden sm:table-cell">Year</Th>
                  <th className="text-left font-medium py-2 px-3 hidden lg:table-cell">Coordinator</th>
                  <Th onClick={() => onSort("members")} sort={sort} k="members" className="text-right hidden md:table-cell">Members</Th>
                  <Th onClick={() => onSort("country")} sort={sort} k="country" className="text-right hidden lg:table-cell">Countries</Th>
                  <Th onClick={() => onSort("budget")} sort={sort} k="budget" className="text-right">Budget</Th>
                  <Th onClick={() => onSort("eu")} sort={sort} k="eu" className="text-right hidden sm:table-cell">EU funding</Th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.project_id} className="border-b border-border last:border-b-0 hover:bg-secondary/40">
                    <td className="py-3 px-3 align-top">
                      <Link href={`/projects/${p.project_id}`} className="block">
                        <div style={{ fontFamily: "var(--font-serif)" }} className="font-semibold text-foreground">
                          {p.acronym ?? "—"}
                          {p.status === "Ended" && (
                            <span className="ml-2 text-[10px] uppercase tracking-widest border border-border px-1.5 py-0.5 text-muted-foreground align-middle">
                              Ended
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.title}</div>
                        <div className="sm:hidden text-xs text-muted-foreground mt-1">
                          <span className="font-medium text-foreground">{getYear(p)}</span> · {formatEuro(p.overall_budget, { compact: true })}
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-3 align-middle text-center text-foreground/80 num hidden sm:table-cell">{getYear(p)}</td>
                    <td className="py-3 px-3 align-middle text-muted-foreground hidden lg:table-cell text-xs">
                      <span className="line-clamp-2">{p.coordinator?.name ?? "—"}</span>
                    </td>
                    <td className="py-3 px-3 align-middle text-center num text-foreground/80 hidden md:table-cell">{p.consortium_size}</td>
                    <td className="py-3 px-3 align-middle text-center num text-foreground/80 hidden lg:table-cell">{p.countries.length}</td>
                    <td className="py-3 px-3 align-middle text-center num text-foreground">
                      {formatEuro(p.overall_budget, { compact: true })}
                    </td>
                    <td className="py-3 px-3 align-middle text-center num text-muted-foreground hidden sm:table-cell">
                      {formatEuro(p.eu_contribution, { compact: true })}
                    </td>
                  </tr>
                ))}
                {!loading && sorted.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      No projects match the current filters.
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
