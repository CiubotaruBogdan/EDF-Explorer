/**
 * NotFound — editorial 404 that stays inside the site frame so users keep
 * their bearings (header, navigation, gold rule).
 */

import Layout from "@/components/Layout";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="py-16 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Error · 404
        </p>
        <h1
          style={{ fontFamily: "var(--font-serif)" }}
          className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight"
        >
          That page is not in the dossier.
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          The address you followed does not match any project, company or
          section in this dataset. It may have been moved or never existed.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-foreground hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to overview
          </Link>
          <Link href="/projects" className="text-foreground hover:underline">
            Browse all projects
          </Link>
          <Link href="/companies" className="text-foreground hover:underline">
            Browse all companies
          </Link>
        </div>
      </div>
    </Layout>
  );
}
