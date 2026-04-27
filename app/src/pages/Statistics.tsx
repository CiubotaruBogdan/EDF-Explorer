import { useMemo } from "react";
import Layout from "@/components/Layout";
import ReactECharts from "echarts-for-react";
import { useDataset } from "@/lib/useDataset";
import { formatEuro, formatNumber, getYear, countryName } from "@/lib/data";

const EDF_NAVY = "#0a1f44";
const ACCENT_BLUE = "#3b5998";
const ACCENT_SLATE = "#5d7a99";

const TOP_N = 10;

export default function Statistics() {
  const { projects, companies, loading, error } = useDataset();

  const stats = useMemo(() => {
    if (!projects || !companies) return null;

    const totalEuContrib = projects.reduce((s, p) => s + (p.eu_contribution ?? 0), 0);
    const totalBudget = projects.reduce((s, p) => s + (p.overall_budget ?? 0), 0);
    const uniqueCountries = new Set(projects.flatMap((p) => p.countries)).size;

    // EU funding and project count by year
    const yearMap = new Map<string, { funding: number; count: number }>();
    for (const p of projects) {
      const y = getYear(p);
      if (!y) continue;
      const cur = yearMap.get(y) ?? { funding: 0, count: 0 };
      yearMap.set(y, { funding: cur.funding + (p.eu_contribution ?? 0), count: cur.count + 1 });
    }
    const years = Array.from(yearMap.keys()).sort();
    const byYear = {
      years,
      funding: years.map((y) => yearMap.get(y)!.funding),
      counts: years.map((y) => yearMap.get(y)!.count),
    };

    // Top countries by project participations
    const countryMap = new Map<string, number>();
    for (const p of projects) {
      for (const c of p.countries) countryMap.set(c, (countryMap.get(c) ?? 0) + 1);
    }
    const topCountries = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, TOP_N);

    // Top coordinators
    const topCoordinators = [...companies]
      .filter((c) => c.coordination_count > 0)
      .sort((a, b) => b.coordination_count - a.coordination_count)
      .slice(0, TOP_N)
      .map((c) => ({ name: c.legal_name, led_projects: c.coordination_count }));

    // Consortium size distribution
    const sizeBuckets = new Map<string, number>();
    for (const p of projects) {
      const s = p.consortium_size;
      let label: string;
      if (s <= 5) label = "1–5";
      else if (s <= 10) label = "6–10";
      else if (s <= 15) label = "11–15";
      else if (s <= 20) label = "16–20";
      else if (s <= 30) label = "21–30";
      else label = "31+";
      sizeBuckets.set(label, (sizeBuckets.get(label) ?? 0) + 1);
    }
    const sizeOrder = ["1–5", "6–10", "11–15", "16–20", "21–30", "31+"];
    const consortiumSizeDist = sizeOrder
      .filter((l) => sizeBuckets.has(l))
      .map((l) => ({ label: l, count: sizeBuckets.get(l)! }));

    return { totalEuContrib, totalBudget, uniqueCountries, byYear, topCountries, topCoordinators, consortiumSizeDist };
  }, [projects, companies]);

  if (loading) {
    return (
      <Layout>
        <div className="text-sm text-muted-foreground">Loading statistics…</div>
      </Layout>
    );
  }
  if (error || !stats || !projects || !companies) {
    return (
      <Layout>
        <div className="border border-destructive bg-destructive/5 p-4 text-sm text-destructive">
          {error ?? "Statistics unavailable."}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Statistics</p>
        <h1
          style={{ fontFamily: "var(--font-serif)" }}
          className="text-3xl sm:text-4xl font-semibold"
        >
          The full picture, in figures
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Pre-computed views over the entire dataset. For ad-hoc analysis, use the{" "}
          <a
            href="/charts"
            className="underline underline-offset-2"
          >
            Chart Builder
          </a>
          .
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-border border border-border mb-10">
        <Stat label="Projects" value={formatNumber(projects.length)} />
        <Stat label="Total budget" value={formatEuro(stats.totalBudget, { compact: true })} />
        <Stat label="EU funding" value={formatEuro(stats.totalEuContrib, { compact: true })} />
        <Stat label="Entities" value={formatNumber(companies.length)} />
        <Stat label="Countries" value={formatNumber(stats.uniqueCountries)} />
      </section>

      <ChartCard title="EU funding and project count, by call year">
        <ReactECharts
          style={{ height: 360 }}
          notMerge
          option={{
            grid: { left: 80, right: 80, top: 40, bottom: 30 },
            tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
            legend: { top: 0, textStyle: { fontFamily: "DM Sans" } },
            xAxis: { type: "category", data: stats.byYear.years },
            yAxis: [
              {
                type: "value",
                name: "EU funding",
                nameTextStyle: { fontFamily: "DM Sans", fontSize: 10 },
                axisLabel: { formatter: (v: number) => formatEuro(v, { compact: true }) },
              },
              {
                type: "value",
                name: "Projects",
                nameTextStyle: { fontFamily: "DM Sans", fontSize: 10, color: ACCENT_SLATE },
                minInterval: 1,
              },
            ],
            series: [
              {
                name: "EU funding",
                type: "bar",
                yAxisIndex: 0,
                itemStyle: { color: EDF_NAVY },
                data: stats.byYear.funding,
                tooltip: { valueFormatter: (v: number) => formatEuro(v, { compact: true }) },
              },
              {
                name: "Projects",
                type: "line",
                yAxisIndex: 1,
                symbolSize: 8,
                lineStyle: { color: ACCENT_SLATE, width: 2 },
                itemStyle: { color: ACCENT_SLATE },
                data: stats.byYear.counts,
              },
            ],
          }}
        />
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        <ChartCard title={`Top ${TOP_N} countries by project participations`}>
          <ReactECharts
            style={{ height: 320 }}
            notMerge
            option={{
              color: [EDF_NAVY],
              grid: { left: 60, right: 30, top: 10, bottom: 20 },
              tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                valueFormatter: (v: number) => `${v} participations`,
              },
              xAxis: { type: "value" },
              yAxis: {
                type: "category",
                data: [...stats.topCountries].reverse().map((c) => countryName(c.country)),
                axisLabel: { fontFamily: "DM Sans", fontSize: 11 },
              },
              series: [
                {
                  type: "bar",
                  data: [...stats.topCountries].reverse().map((c) => c.count),
                  label: { show: true, position: "right", fontFamily: "JetBrains Mono", fontSize: 10 },
                },
              ],
            }}
          />
        </ChartCard>

        <ChartCard title="Consortium size distribution">
          <ReactECharts
            style={{ height: 320 }}
            notMerge
            option={{
              color: [ACCENT_BLUE],
              grid: { left: 50, right: 20, top: 10, bottom: 30 },
              tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                valueFormatter: (v: number) => `${v} projects`,
              },
              xAxis: {
                type: "category",
                data: stats.consortiumSizeDist.map((b) => b.label),
              },
              yAxis: { type: "value" },
              series: [{ type: "bar", data: stats.consortiumSizeDist.map((b) => b.count) }],
            }}
          />
        </ChartCard>
      </div>

      <ChartCard title={`Top ${TOP_N} coordinators by number of led projects`}>
        <ReactECharts
          style={{ height: 360 }}
          notMerge
          option={{
            color: [ACCENT_SLATE],
            grid: { left: 200, right: 40, top: 10, bottom: 20 },
            tooltip: {
              trigger: "axis",
              axisPointer: { type: "shadow" },
              valueFormatter: (v: number) => `${v} projects coordinated`,
            },
            xAxis: { type: "value", minInterval: 1 },
            yAxis: {
              type: "category",
              data: [...stats.topCoordinators].reverse().map((c) => truncate(c.name, 36)),
              axisLabel: { fontFamily: "DM Sans", fontSize: 11, width: 180, overflow: "truncate" },
            },
            series: [
              {
                type: "bar",
                data: [...stats.topCoordinators].reverse().map((c) => c.led_projects),
                label: { show: true, position: "right", fontFamily: "JetBrains Mono", fontSize: 10 },
              },
            ],
          }}
        />
      </ChartCard>
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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border p-4 sm:p-5 mb-8 bg-card">
      <h2
        style={{ fontFamily: "var(--font-serif)" }}
        className="text-lg font-semibold mb-3"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
