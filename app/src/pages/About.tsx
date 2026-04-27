/**
 * About — methodology, sources, licensing, contributing.
 */

import Layout from "@/components/Layout";

export default function About() {
  return (
    <Layout>
      <article className="prose prose-stone max-w-3xl">
        <header className="mb-8 not-prose">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">About</p>
          <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl font-semibold">
            About EDF Explorer
          </h1>
        </header>

        <Section title="What this is">
          <p>
            EDF Explorer is an independent, open-source visualisation of the
            results of the <strong>European Defence Fund (EDF)</strong>, the
            European Commission's main instrument for funding collaborative
            defence research and capability-development projects. The current
            edition covers all five EDF calls so far
            (<strong>2021, 2022, 2023, 2024 and 2025</strong>) — in total
            <strong> 283 projects</strong>, <strong>2 354 entities</strong>
            and <strong>28 countries</strong>. The two predecessor
            programmes (PADR 2017–2019 and EDIDP 2019–2020) are intentionally
            excluded so that all figures, charts and rankings on this site
            describe the EDF proper. The site is not affiliated with the
            European Union, the European Commission, or any of the entities
            listed.
          </p>
        </Section>

        <Section title="Where the data comes from">
          <p>
            All figures shown on this site are extracted directly from the
            official factsheet PDFs published by the European Commission's
            Directorate-General for Defence Industry and Space (DG DEFIS), on
            its own website. Each project page links back to its original PDF
            so any figure can be verified against the source in one click.
          </p>
          <p>
            The data is processed offline by an open Python pipeline
            (in the same GitHub repository): factsheets are downloaded
            sequentially with polite delays, parsed using <em>pdfplumber</em>{" "}
            (positional word extraction to handle multi-line consortium names),
            and merged into a single JSON dataset that ships with the static
            build.
          </p>
        </Section>

        <Section title="Project continuations">
          <p>
            Multi-phase capabilities are detected automatically using three
            complementary heuristics, each tagged on the project page:
          </p>
          <ul>
            <li><strong>Phase numbering</strong> — projects share an acronym base with
            an incrementing suffix (e.g. FAMOUS → FAMOUS2 → FAMOUS3).</li>
            <li><strong>Explicit mention in description</strong> — the later project's
            description contains phrases such as “follow-up of”, “builds upon”,
            “extension of”, “successor of”, referencing an earlier acronym.</li>
            <li><strong>Cross-call reference</strong> — a description
            contains a textual reference such as <em>EDF 2022 ACRONYM</em>.</li>
          </ul>
        </Section>

        <Section title="Known data limitations">
          <p>
            A few known imperfections remain in the current dataset and are
            surfaced in the interface with a small gold <em>data quality</em>
            badge on each affected project page:
          </p>
          <ul>
            <li><strong>Glued entity names in source PDFs.</strong> Some
            factsheet PDFs do not embed inter-word spaces in consortium
            names (for example <em>INDRASISTEMASSA</em> instead of
            <em> INDRA SISTEMAS SA</em>). A dedicated post-processor splits
            the most common patterns conservatively. A small number of
            long, unambiguous all-caps strings remain unsplit where a safe
            split could not be inferred without a manual dictionary.</li>
            <li><strong>Per-member funding.</strong> The Commission does not
            publish the split of the EU contribution between consortium
            members. Any company-level funding figure shown on this site
            is an estimate obtained by attributing the full project
            contribution equally across its listed members.</li>
            <li><strong>Occasional small consortia.</strong> A few EDF
            projects list only a handful of members; some of these are
            legitimate SME-only open calls, others may be artefacts of
            imperfect PDF extraction. These carry a <em>Partial data</em>
            badge when the consortium contains fewer than three entities.</li>
          </ul>
        </Section>

        <Section title="Aggregated funding figures">
          <p>
            The Commission publishes a single EU contribution per project, not
            per consortium member. To give an indicative view of how funding
            flows through entities, EDF Explorer attributes the EU contribution
            equally across all listed members of each consortium. These
            company-level figures are estimates, not contractual amounts.
          </p>
        </Section>

        <Section title="License & contributing">
          <p>
            The site, the dataset and the scraping pipeline are released under
            the <strong>MIT License</strong>. The underlying data is derived
            from documents published by the European Commission and reused
            under CC BY 4.0. Pull requests, corrections, and additional
            sources are very welcome on{" "}
            <a className="underline underline-offset-4"
               href="https://github.com/CiubotaruBogdan/edf-explorer" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>.
          </p>
        </Section>

        <Section title="Privacy">
          <p>
            EDF Explorer is a static website. There is no backend, no user
            accounts, and no third-party tracking beyond a minimal
            self-hosted analytics ping (page views only). All data lives in
            the browser; nothing about your search activity leaves your
            device.
          </p>
        </Section>
      </article>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-semibold mb-2">
        {title}
      </h2>
      <div className="text-base leading-relaxed text-foreground/85 space-y-3">
        {children}
      </div>
    </section>
  );
}
