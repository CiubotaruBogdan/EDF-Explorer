/**
 * EDF Explorer — Data access layer
 */

import type { Company, DatasetMeta, Project } from "./types";

// ---- Async loaders --------------------------------------------------------

let _projectsPromise: Promise<Project[]> | null = null;
let _companiesPromise: Promise<Company[]> | null = null;
let _metaPromise: Promise<DatasetMeta> | null = null;

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") + "/data";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return (await res.json()) as T;
}

const EDF_STANDARD = /^EDF-20\d{2}-/;

export function loadProjects(): Promise<Project[]> {
  if (!_projectsPromise)
    _projectsPromise = fetchJSON<Project[]>(`${BASE}/projects.json`)
      .then((ps) => ps.filter((p) => EDF_STANDARD.test(p.call_identifier)));
  return _projectsPromise;
}
export function loadCompanies(): Promise<Company[]> {
  if (!_companiesPromise) _companiesPromise = fetchJSON<Company[]>(`${BASE}/companies.json`);
  return _companiesPromise;
}
export function loadMeta(): Promise<DatasetMeta> {
  if (!_metaPromise) _metaPromise = fetchJSON<DatasetMeta>(`${BASE}/meta.json`);
  return _metaPromise;
}

export function loadAll(): Promise<[Project[], Company[], DatasetMeta]> {
  return Promise.all([loadProjects(), loadCompanies(), loadMeta()]);
}

// ---- Lookups (sync, given a loaded array) --------------------------------

export function getProjectById(projects: Project[], id: string): Project | null {
  return projects.find((p) => p.project_id === id) ?? null;
}
export function getCompanyById(companies: Company[], pic: string): Company | null {
  return companies.find((c) => c.pic === pic) ?? null;
}
export function getProjectsByIds(projects: Project[], ids: string[]): Project[] {
  const set = new Set(ids);
  return projects.filter((p) => set.has(p.project_id));
}

// ---- Derived helpers ------------------------------------------------------

/** Extract call year from call_identifier, e.g. "EDF-2021-AIR-D-2" → "2021". */
export function getYear(project: Project): string {
  const match = project.call_identifier.match(/20\d{2}/);
  return match ? match[0] : "";
}

/** Extract programme name from call_identifier. */
export function getProgram(project: Project): string {
  if (project.call_identifier.includes("EDIRPA")) return "EDIRPA";
  return "EDF";
}

/** EC portal URL for a project. */
export function projectPortalUrl(project: Project): string {
  return `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/projects-details/44181033/${project.project_id}/EDF`;
}

/** Duration in months from start/end dates. */
export function getDurationMonths(project: Project): number | null {
  if (!project.start_date || !project.end_date) return null;
  const start = new Date(project.start_date);
  const end = new Date(project.end_date);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return months > 0 ? months : null;
}

// ---- Country name mapping -------------------------------------------------

const COUNTRY_NAMES: Record<string, string> = {
  AT: "Austria", BE: "Belgium", BG: "Bulgaria", CY: "Cyprus",
  CZ: "Czech Republic", DE: "Germany", DK: "Denmark", EE: "Estonia",
  EL: "Greece", ES: "Spain", FI: "Finland", FR: "France",
  HR: "Croatia", HU: "Hungary", IE: "Ireland", IT: "Italy",
  LT: "Lithuania", LU: "Luxembourg", LV: "Latvia", MT: "Malta",
  NL: "Netherlands", PL: "Poland", PT: "Portugal", RO: "Romania",
  SE: "Sweden", SI: "Slovenia", SK: "Slovakia",
  AL: "Albania", BA: "Bosnia and Herzegovina", ME: "Montenegro",
  MK: "North Macedonia", NO: "Norway", RS: "Serbia",
  TR: "Turkey", UA: "Ukraine", UK: "United Kingdom", CH: "Switzerland",
  IS: "Iceland", GR: "Greece",
};

export function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

// ---- Filter helpers -------------------------------------------------------

export function listYears(projects: Project[]): string[] {
  return Array.from(new Set(projects.map(getYear))).filter(Boolean).sort();
}
export function listCountries(projects: Project[]): string[] {
  return Array.from(new Set(projects.flatMap((p) => p.countries))).filter(Boolean).sort();
}
export function listStatuses(projects: Project[]): string[] {
  return Array.from(new Set(projects.map((p) => p.status))).filter(Boolean).sort();
}

// ---- Formatting helpers ---------------------------------------------------

export function formatEuro(n: number | null | undefined, opts?: { compact?: boolean }): string {
  if (n == null || !isFinite(n)) return "—";
  if (opts?.compact) {
    if (n >= 1e9) return `€\u202f${(n / 1e9).toFixed(2)}\u202fbn`;
    if (n >= 1e6) return `€\u202f${(n / 1e6).toFixed(1)}\u202fM`;
    if (n >= 1e3) return `€\u202f${(n / 1e3).toFixed(0)}\u202fk`;
    return `€\u202f${n.toFixed(0)}`;
  }
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IE").format(n);
}
