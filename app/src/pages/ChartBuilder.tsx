/**
 * ChartBuilder — let the user assemble a chart by picking a dimension,
 * a measure, an aggregation, an optional series-split and a chart type.
 *
 * Filters from the URL are honoured so the user can pre-filter the dataset on
 * /projects then jump here with the same state.
 */

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import ReactECharts from "echarts-for-react";
import {
  formatEuro,
  formatNumber,
  getYear,
  countryName,
  listCountries,
  listYears,
} from "@/lib/data";
import { useDataset } from "@/lib/useDataset";
import type { Project } from "@/lib/types";
import { Download } from "lucide-react";

type Dim = "year" | "country" | "coordinator" | "type_of_action";
type Measure = "count" | "budget" | "eu" | "members";
type Agg = "sum" | "avg" | "max" | "min";
type ChartType = "bar" | "line" | "pie" | "horizontal";

const DIMENSIONS: { v: Dim; label: string }[] = [
  { v: "year", label: "Call year" },
  { v: "country", label: "Country (in consortium)" },
  { v: "coordinator", label: "Coordinator" },
  { v: "type_of_action", label: "Type of action" },
];

// Quick-view presets so the most-asked questions are one click away.
type Preset = {
  key: string;
  label: string;
  apply: () => {
    dim: Dim; seriesDim: Dim | "none"; measure: Measure; agg: Agg;
    chartType: ChartType; topN: number;
  };
};
const PRESETS: Preset[] = [
  {
    key: "country-year",
    label: "Participations per country, by year",
    apply: () => ({ dim: "country", seriesDim: "year", measure: "count", agg: "sum", chartType: "horizontal", topN: 20 }),
  },
  {
    key: "year-eu",
    label: "EU funding by call year",
    apply: () => ({ dim: "year", seriesDim: "none", measure: "eu", agg: "sum", chartType: "bar", topN: 50 }),
  },
  {
    key: "country-funding",
    label: "EU funding by country",
    apply: () => ({ dim: "country", seriesDim: "none", measure: "eu", agg: "sum", chartType: "horizontal", topN: 20 }),
  },
  {
    key: "coordinator-count",
    label: "Top coordinators by project count",
    apply: () => ({ dim: "coordinator", seriesDim: "none", measure: "count", agg: "sum", chartType: "horizontal", topN: 15 }),
  },
];
const MEASURES: { v: Measure; label: string }[] = [
  { v: "count", label: "Project count" },
  { v: "budget", label: "Total budget (€)" },
  { v: "eu", label: "EU contribution (€)" },
  { v: "members", label: "Consortium members" },
];

const COLORS = ["#0a1f44", "#3b5998", "#ffcc00", "#a3784e", "#8aa05a", "#c44f3b", "#5d6d7e", "#7a4f9f"];

export default function ChartBuilder() {
  const [dim, setDim] = useState<Dim>("year");
  const [measure, setMeasure] = useState<Measure>("eu");
  const [agg, setAgg] = useState<Agg>("sum");
  const [seriesDim, setSeriesDim] = useState<Dim | "none">("none");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [topN, setTopN] = useState<number>(20);
  const [filters, setFilters] = useState<{ years: string[]; countries: string[] }>({
    years: [], countries: [],
  });

  const applyPreset = (key: string) => {
    const p = PRESETS.find((x) => x.key === key);
    if (!p) return;
    const v = p.apply();
    setDim(v.dim); setSeriesDim(v.seriesDim); setMeasure(v.measure);
    setAgg(v.agg); setChartType(v.chartType); setTopN(v.topN);
  };

  const { projects, loading, error } = useDataset();
  const allProjects: Project[] = projects ?? [];

  // When the chosen measure is not 'count', sum/avg apply naturally; min/max
  // operate on the per-project value of the measure.
  const filtered: Project[] = useMemo(() => {
    return allProjects.filter((p) => {
      if (filters.years.length && !filters.years.includes(getYear(p))) return false;
      if (filters.countries.length && !filters.countries.some((c) => p.countries.map(countryName).includes(c))) return false;
      return true;
    });
  }, [allProjects, filters]);

  const data = useMemo(() => buildSeries(filtered, dim, seriesDim, measure, agg, topN), [filtered, dim, seriesDim, measure, agg, topN]);

  const option = useMemo(() => buildOption(data, chartType, measure), [data, chartType, measure]);

  // Allow PNG export via ECharts instance ref.
  const [chartRef, setChartRef] = useState<ReactECharts | null>(null);
  const exportPng = () => {
    if (!chartRef) return;
    const echart = chartRef.getEchartsInstance();
    const url = echart.getDataURL({ pixelRatio: 2, backgroundColor: "#fbfaf6" });
    const a = document.createElement("a");
    a.href = url; a.download = `edf-explorer-chart-${Date.now()}.png`;
    a.click();
  };

  useEffect(() => {
    // If there is no series-dim conflict, leave it; otherwise reset.
    if (seriesDim === dim) setSeriesDim("none");
  }, [dim, seriesDim]);

  if (loading) {
    return (
      <Layout>
        <div className="text-sm text-muted-foreground">Loading dataset…</div>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout>
        <div className="border border-destructive bg-destructive/5 p-4 text-sm text-destructive">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Chart Builder</p>
        <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl font-semibold">
          Compose your own view
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Pick a dimension, a measure, an aggregation and (optionally) a series
          split. The chart renders client-side from the same dataset that powers
          the rest of the site.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground mr-1">
            Quick views:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key)}
              className="text-xs border border-border bg-card px-2.5 py-1.5 hover:border-foreground hover:bg-secondary/40 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <Group label="Dimension (X axis / slice)">
            <Select value={dim} onChange={(v) => setDim(v as Dim)} options={DIMENSIONS.map((d) => ({ value: d.v, label: d.label }))} />
          </Group>
          <Group label="Measure">
            <Select value={measure} onChange={(v) => setMeasure(v as Measure)} options={MEASURES.map((m) => ({ value: m.v, label: m.label }))} />
          </Group>
          <Group label="Aggregation">
            <Select value={agg} onChange={(v) => setAgg(v as Agg)} options={[
              { value: "sum", label: "Sum" }, { value: "avg", label: "Average" },
              { value: "max", label: "Maximum" }, { value: "min", label: "Minimum" },
            ]} disabled={measure === "count"} />
          </Group>
          <Group label="Series (split by)">
            <Select value={seriesDim} onChange={(v) => setSeriesDim(v as any)} options={[
              { value: "none", label: "None" },
              ...DIMENSIONS.filter((d) => d.v !== dim).map((d) => ({ value: d.v, label: d.label })),
            ]} disabled={chartType === "pie"} />
          </Group>
          <Group label="Chart type">
            <Select value={chartType} onChange={(v) => setChartType(v as ChartType)} options={[
              { value: "bar", label: "Bar (vertical)" },
              { value: "horizontal", label: "Bar (horizontal)" },
              { value: "line", label: "Line" },
              { value: "pie", label: "Pie / donut" },
            ]} />
          </Group>
          <Group label={`Top ${topN} categories`}>
            <input
              type="range" min={5} max={60} step={1}
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </Group>

          <FilterBlock label="Years" all={listYears(allProjects)} value={filters.years}
            onChange={(v) => setFilters((f) => ({ ...f, years: v }))} />
          <FilterBlock label="Countries" all={listCountries(allProjects).map(countryName)} value={filters.countries}
            onChange={(v) => setFilters((f) => ({ ...f, countries: v }))} collapsed />
        </aside>

        <section className="lg:col-span-3">
          <div className="border border-border bg-card p-4 sm:p-5">
            <div className="flex items-baseline justify-between mb-2">
              <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-lg font-semibold">
                {labelOfMeasure(measure, agg)} by {labelOfDim(dim)}{seriesDim !== "none" && chartType !== "pie" ? `, split by ${labelOfDim(seriesDim as Dim)}` : ""}
              </h2>
              <button
                onClick={exportPng}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" /> PNG
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {filtered.length} project{filtered.length === 1 ? "" : "s"} included after filters.
            </p>
            <ReactECharts
              ref={(r) => setChartRef(r)}
              style={{ height: 480 }}
              option={option}
              notMerge={true}
            />
          </div>

          {/* Tabular fallback */}
          <div className="border border-border bg-card p-4 sm:p-5 mt-6 overflow-x-auto">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Underlying data</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left py-1.5 px-2">{labelOfDim(dim)}</th>
                  {data.seriesLabels.map((s) => (
                    <th key={s} className="text-right py-1.5 px-2">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.categories.map((cat, i) => (
                  <tr key={cat} className="border-b border-border last:border-b-0">
                    <td className="py-1.5 px-2 align-top">{cat}</td>
                    {data.matrix[i].map((v, j) => (
                      <td key={j} className="text-right num py-1.5 px-2">{formatValue(v, measure)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}

// ---- Helpers --------------------------------------------------------------

function labelOfDim(d: Dim) {
  return DIMENSIONS.find((x) => x.v === d)?.label ?? d;
}
function labelOfMeasure(m: Measure, a: Agg) {
  const mLabel = MEASURES.find((x) => x.v === m)?.label ?? m;
  if (m === "count") return mLabel;
  return `${a.charAt(0).toUpperCase() + a.slice(1)} of ${mLabel.toLowerCase()}`;
}

function formatValue(v: number, m: Measure): string {
  if (v == null || !isFinite(v)) return "—";
  if (m === "budget" || m === "eu") return formatEuro(v, { compact: true });
  return formatNumber(Math.round(v));
}

function valueOf(p: Project, m: Measure): number {
  if (m === "count") return 1;
  if (m === "budget") return p.overall_budget ?? 0;
  if (m === "eu") return p.eu_contribution ?? 0;
  if (m === "members") return p.consortium_size;
  return 0;
}

/** Returns the dimension keys for one project — usually a single value but
 *  e.g. country expands to all consortium countries. */
function dimKeysOf(p: Project, d: Dim): string[] {
  switch (d) {
    case "year": return [getYear(p) || "Unknown"];
    case "country": return p.countries.length ? p.countries.map(countryName) : ["Unknown"];
    case "coordinator": return [p.coordinator?.name ?? "Unknown"];
    case "type_of_action": return [p.type_of_action || "Unknown"];
  }
}

interface SeriesData {
  categories: string[];
  seriesLabels: string[];
  matrix: number[][]; // [categoryIndex][seriesIndex]
}

function buildSeries(
  projects: Project[],
  dim: Dim,
  series: Dim | "none",
  measure: Measure,
  agg: Agg,
  topN: number,
): SeriesData {
  const map = new Map<string, Map<string, { sum: number; n: number; min: number; max: number }>>();
  for (const p of projects) {
    const dimKeys = dimKeysOf(p, dim);
    const seriesKeys = series === "none" ? ["All"] : dimKeysOf(p, series as Dim);
    for (const dk of dimKeys) {
      const inner = map.get(dk) ?? new Map();
      for (const sk of seriesKeys) {
        const v = valueOf(p, measure);
        const cur = inner.get(sk) ?? { sum: 0, n: 0, min: Infinity, max: -Infinity };
        cur.sum += v; cur.n += 1;
        cur.min = Math.min(cur.min, v); cur.max = Math.max(cur.max, v);
        inner.set(sk, cur);
      }
      map.set(dk, inner);
    }
  }
  const allCategories = Array.from(map.keys());
  // When the series split is by year we want chronological order so the
  // colour ramp reads left-to-right instead of being shuffled alphabetically
  // (which still works for years here, but we keep the comment explicit).
  const allSeries = Array.from(
    new Set(Array.from(map.values()).flatMap((m) => Array.from(m.keys())))
  ).sort();

  const reduce = (rec: { sum: number; n: number; min: number; max: number }) => {
    if (measure === "count") return rec.n;
    if (agg === "sum") return rec.sum;
    if (agg === "avg") return rec.n ? rec.sum / rec.n : 0;
    if (agg === "min") return rec.min === Infinity ? 0 : rec.min;
    if (agg === "max") return rec.max === -Infinity ? 0 : rec.max;
    return 0;
  };

  const matrixFull: { cat: string; total: number; row: number[] }[] = allCategories.map((cat) => {
    const inner = map.get(cat)!;
    const row = allSeries.map((s) => {
      const r = inner.get(s);
      return r ? reduce(r) : 0;
    });
    return { cat, total: row.reduce((a, b) => a + b, 0), row };
  });

  // Sort categories: chronological if year, otherwise by total desc, then top-N
  let sorted = matrixFull;
  if (dim === "year") sorted = [...matrixFull].sort((a, b) => a.cat.localeCompare(b.cat));
  else sorted = [...matrixFull].sort((a, b) => b.total - a.total).slice(0, topN);

  return {
    categories: sorted.map((r) => r.cat),
    seriesLabels: allSeries,
    matrix: sorted.map((r) => r.row),
  };
}

function buildOption(data: SeriesData, chartType: ChartType, measure: Measure): any {
  const valueFormatter = (v: number) => formatValue(v, measure);

  if (chartType === "pie") {
    // For pie we ignore series split and sum across all series per category
    const items = data.categories.map((cat, i) => ({
      name: cat, value: data.matrix[i].reduce((a, b) => a + b, 0),
    }));
    return {
      color: COLORS,
      tooltip: { trigger: "item", valueFormatter },
      legend: { type: "scroll", bottom: 0, textStyle: { fontFamily: "DM Sans" } },
      series: [{ type: "pie", radius: ["40%", "70%"], data: items, label: { fontFamily: "DM Sans" } }],
    };
  }
  if (chartType === "horizontal") {
    return {
      color: COLORS,
      grid: { left: 200, right: 40, top: 30, bottom: 30 },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter },
      legend: data.seriesLabels.length > 1 ? { top: 0, textStyle: { fontFamily: "DM Sans" } } : undefined,
      xAxis: { type: "value", axisLabel: { formatter: valueFormatter } },
      yAxis: { type: "category", data: [...data.categories].reverse(), axisLabel: { fontFamily: "DM Sans", fontSize: 11, width: 180, overflow: "truncate" } },
      series: data.seriesLabels.map((s, si) => ({
        name: s,
        type: "bar",
        stack: "x",
        data: [...data.matrix].reverse().map((row) => row[si]),
      })),
    };
  }
  // bar (vertical) or line
  return {
    color: COLORS,
    grid: { left: 70, right: 30, top: 30, bottom: 50 },
    tooltip: { trigger: "axis", axisPointer: { type: chartType === "line" ? "line" : "shadow" }, valueFormatter },
    legend: data.seriesLabels.length > 1 ? { top: 0, textStyle: { fontFamily: "DM Sans" } } : undefined,
    xAxis: {
      type: "category",
      data: data.categories,
      axisLabel: { fontFamily: "DM Sans", fontSize: 11, rotate: data.categories.length > 8 ? 35 : 0, interval: 0 },
    },
    yAxis: { type: "value", axisLabel: { formatter: valueFormatter } },
    series: data.seriesLabels.map((s, si) => ({
      name: s,
      type: chartType === "line" ? "line" : "bar",
      stack: chartType === "bar" ? "x" : undefined,
      smooth: chartType === "line",
      data: data.matrix.map((row) => row[si]),
    })),
  };
}

// ---- Form atoms -----------------------------------------------------------

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}
function Select({ value, onChange, options, disabled }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full bg-background border border-input px-2.5 py-1.5 text-sm focus:border-foreground focus:outline-none disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function FilterBlock({ label, all, value, onChange, collapsed }: {
  label: string; all: string[]; value: string[];
  onChange: (next: string[]) => void; collapsed?: boolean;
}) {
  const [open, setOpen] = useState(!collapsed);
  return (
    <div>
      <button
        type="button"
        className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground mb-1.5 inline-flex items-center gap-2"
        onClick={() => setOpen((v) => !v)}
      >
        {label}{value.length ? <span className="num text-foreground/80 normal-case">({value.length})</span> : null}
        <span className="text-[10px]">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="max-h-40 overflow-y-auto border border-border p-2 space-y-1">
          {all.map((v) => {
            const checked = value.includes(v);
            return (
              <label key={v} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox" checked={checked}
                  onChange={() =>
                    onChange(checked ? value.filter((x) => x !== v) : [...value, v])
                  }
                  className="h-3 w-3 accent-foreground"
                />
                <span className="truncate">{v}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
