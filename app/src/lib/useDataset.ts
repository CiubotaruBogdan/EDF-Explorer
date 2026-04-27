import { useEffect, useState } from "react";
import { loadAll } from "./data";
import type { Company, DatasetMeta, Project } from "./types";

export interface DatasetState {
  projects: Project[] | null;
  companies: Company[] | null;
  meta: DatasetMeta | null;
  loading: boolean;
  error: string | null;
}

export function useDataset(): DatasetState {
  const [state, setState] = useState<DatasetState>({
    projects: null,
    companies: null,
    meta: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    loadAll()
      .then(([projects, companies, meta]) => {
        if (cancelled) return;
        setState({ projects, companies, meta, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          projects: null,
          companies: null,
          meta: null,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
