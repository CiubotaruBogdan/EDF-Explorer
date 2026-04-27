/**
 * Lightweight in-memory search index built from the projects dataset.
 */

import MiniSearch from "minisearch";
import type { Project } from "./types";

interface IndexedDoc {
  id: string;
  acronym: string;
  title: string;
  objective: string;
  coordinator: string;
  members: string;
}

const cache = new WeakMap<Project[], MiniSearch<IndexedDoc>>();

function buildIndex(projects: Project[]): MiniSearch<IndexedDoc> {
  const docs: IndexedDoc[] = projects.map((p) => ({
    id: p.project_id,
    acronym: p.acronym ?? "",
    title: p.title ?? "",
    objective: p.objective ?? "",
    coordinator: p.coordinator?.name ?? "",
    members: p.participants.map((m) => m.name).join(" "),
  }));
  const idx = new MiniSearch<IndexedDoc>({
    fields: ["acronym", "title", "objective", "coordinator", "members"],
    storeFields: ["id"],
    searchOptions: {
      boost: { acronym: 4, title: 2, coordinator: 1.5 },
      fuzzy: 0.2,
      prefix: true,
    },
  });
  idx.addAll(docs);
  return idx;
}

function getIndex(projects: Project[]): MiniSearch<IndexedDoc> {
  let idx = cache.get(projects);
  if (!idx) {
    idx = buildIndex(projects);
    cache.set(projects, idx);
  }
  return idx;
}

export function searchProjects(projects: Project[], query: string): Project[] {
  if (!query.trim()) return projects;
  const idx = getIndex(projects);
  const hits = idx.search(query.trim());
  const byId = new Map(projects.map((p) => [p.project_id, p] as const));
  return hits.map((h) => byId.get(h.id as string)).filter((p): p is Project => !!p);
}
