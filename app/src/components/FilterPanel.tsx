/**
 * FilterPanel — facets sidebar (desktop) / drawer (mobile).
 *
 * Theme: minimalist editorial. No accordions, no fancy chrome — flat lists of
 * checkboxes grouped by facet. Selection chips appear above the table.
 */

import { useEffect, useState } from "react";
import { X, SlidersHorizontal, Search } from "lucide-react";

export interface Facet {
  key: string;
  label: string;
  options: { value: string; label?: string; count: number }[];
  searchable?: boolean;
}

export interface FilterState {
  q: string;
  selected: Record<string, string[]>;
}

interface Props {
  facets: Facet[];
  state: FilterState;
  onChange: (next: FilterState) => void;
  /** Total number of items currently matching (shown in the apply button on mobile). */
  matchedCount?: number;
}

export default function FilterPanel({ facets, state, onChange, matchedCount }: Props) {
  const [open, setOpen] = useState(false);

  // Close drawer when route changes (basic body scroll lock for mobile drawer)
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleOption = (facetKey: string, value: string) => {
    const cur = state.selected[facetKey] ?? [];
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    onChange({ ...state, selected: { ...state.selected, [facetKey]: next } });
  };

  const clearAll = () => onChange({ q: "", selected: {} });

  const selectedCount = Object.values(state.selected).reduce((s, arr) => s + arr.length, 0)
    + (state.q ? 1 : 0);

  return (
    <>
      {/* Mobile trigger row */}
      <div className="md:hidden mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm hover:bg-secondary"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {selectedCount > 0 && (
            <span className="ml-1 num text-xs px-1.5 py-0.5 bg-foreground text-background">
              {selectedCount}
            </span>
          )}
        </button>
        <SearchInput value={state.q} onChange={(q) => onChange({ ...state, q })} />
      </div>

      {/* Desktop fixed sidebar */}
      <aside className="hidden md:block w-60 lg:w-64 flex-shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto overflow-x-hidden pr-2">
        <FilterList
          facets={facets}
          state={state}
          toggleOption={toggleOption}
          onSearch={(q) => onChange({ ...state, q })}
          clearAll={clearAll}
          selectedCount={selectedCount}
        />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-background shadow-xl border-r border-border flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span style={{ fontFamily: "var(--font-serif)" }} className="text-lg font-semibold">
                Filters
              </span>
              <button type="button" onClick={() => setOpen(false)} className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterList
                facets={facets}
                state={state}
                toggleOption={toggleOption}
                onSearch={(q) => onChange({ ...state, q })}
                clearAll={clearAll}
                selectedCount={selectedCount}
              />
            </div>
            <div className="p-4 border-t border-border">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full bg-foreground text-background py-3 text-sm font-medium"
              >
                Show {matchedCount ?? "all"} results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterList({
  facets,
  state,
  toggleOption,
  onSearch,
  clearAll,
  selectedCount,
}: {
  facets: Facet[];
  state: FilterState;
  toggleOption: (k: string, v: string) => void;
  onSearch: (q: string) => void;
  clearAll: () => void;
  selectedCount: number;
}) {
  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <SearchInput value={state.q} onChange={onSearch} />
      </div>
      {selectedCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Clear all filters
        </button>
      )}
      {facets.map((facet) => (
        <FacetBlock key={facet.key} facet={facet} state={state} toggleOption={toggleOption} />
      ))}
    </div>
  );
}

function FacetBlock({
  facet,
  state,
  toggleOption,
}: {
  facet: Facet;
  state: FilterState;
  toggleOption: (k: string, v: string) => void;
}) {
  const [q, setQ] = useState("");
  const sel = new Set(state.selected[facet.key] ?? []);
  const visible = facet.searchable && q.trim()
    ? facet.options.filter((o) => (o.label ?? o.value).toLowerCase().includes(q.trim().toLowerCase()))
    : facet.options;

  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
        {facet.label}
        {sel.size > 0 && <span className="ml-1 normal-case text-foreground/60">({sel.size})</span>}
      </h3>
      {facet.searchable && (
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search countries…"
          className="w-full mb-2 px-2 py-1 text-xs bg-background border border-input focus:border-foreground focus:outline-none"
        />
      )}
      <ul className={`space-y-1 overflow-y-auto overflow-x-hidden ${facet.searchable ? "max-h-[26rem]" : "max-h-52"}`}>
        {visible.map((opt) => {
          const checked = sel.has(opt.value);
          return (
            <li key={opt.value}>
              <label
                className={
                  "flex items-center justify-between gap-2 text-sm py-1 px-1 rounded-sm cursor-pointer " +
                  (checked ? "bg-secondary" : "hover:bg-secondary/60")
                }
              >
                <span className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(facet.key, opt.value)}
                    className="h-3.5 w-3.5 accent-foreground"
                  />
                  <span className={"truncate " + (checked ? "text-foreground" : "text-foreground/85")}>
                    {opt.label ?? opt.value}
                  </span>
                </span>
                <span className="num text-xs text-muted-foreground tabular-nums shrink-0">
                  {opt.count}
                </span>
              </label>
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="text-xs text-muted-foreground py-1">No countries match.</li>
        )}
      </ul>
    </div>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search…"
        className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input focus:border-foreground focus:ring-0 focus:outline-none"
      />
    </div>
  );
}
