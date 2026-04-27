# EDF Explorer

**Open browser for European Defence Fund project data.**

A fully static single-page application for exploring EDF, EDIDP and PADR grant agreements published by the European Commission since 2017. No backend, no tracking, runs entirely in the browser.

🔗 **Live:** [ciubotarubogdan.ro/edf-explorer](https://ciubotarubogdan.ro/edf-explorer/)
🔗 **API scraper:** [github.com/CiubotaruBogdan/ec-edf-api](https://github.com/CiubotaruBogdan/ec-edf-api)

---

## Background

The European Defence Fund is the EU's primary instrument for supporting collaborative defence research and development. Since 2017, across EDF, EDIDP and PADR, the European Commission has committed billions of euros to hundreds of projects involving thousands of organisations across Europe.

While the data is publicly available through the EC Funding & Tenders Portal, the official interface is not built for exploration or statistical analysis. There is no easy way to compare countries, identify dominant coordinators, track consortium patterns across years, or export charts for presentations.

A LinkedIn post with manual analysis data reached over 15,000 impressions and generated significant interest, confirming the need for a proper exploration tool.

EDF Explorer was built to fill that gap.

---

## Features

- **Projects** — browse and filter 275+ projects by year, status, and country; full-text search across titles, objectives, topics, call identifiers and consortium members
- **Companies** — explore all participating organisations, filter by country, view full participation history and coordinator roles
- **Statistics** — pre-computed views: EU funding by year, top coordinators by number of led projects, top countries by participation count, consortium size distribution
- **Chart Builder** — build custom charts by choosing axes, grouping and chart type; export as PNG images for reports and presentations
- URL-based filter state — all active filters are reflected in the URL and are fully shareable
- Responsive design — works on desktop and mobile

---

## Data

### Source

Data is fetched from the **EC Funding & Tenders Portal Search API**:

```
https://api.tech.ec.europa.eu/search-api/prod/rest/search
```

Organisation profiles are enriched via the EC Organisation Profile API:

```
https://api.tech.ec.europa.eu/org-profile-api/prod/rest/organisation/{pic}
```

The full scraping pipeline, including API exploration, data cleaning and JSON export, is available at:
[github.com/CiubotaruBogdan/ec-edf-api](https://github.com/CiubotaruBogdan/ec-edf-api)

### Coverage

| Programme | Full name | Period |
|---|---|---|
| EDF | European Defence Fund | 2021 onwards |
| EDIDP | European Defence Industrial Development Programme | 2019–2020 |
| PADR | Preparatory Action on Defence Research | 2017–2019 |

Only projects with call identifiers matching the standard EDF pattern (`EDF-20XX-...`) are included. Administrative and framework calls are excluded.

### Dataset files

| File | Contents |
|---|---|
| `data/projects.json` | All projects with participants, budgets, topics and metadata |
| `data/companies.json` | All unique organisations with participation history |
| `data/meta.json` | Dataset generation timestamp and summary statistics |

### Limitations

- Per-participant funding breakdowns are not published by the EC. Only consortium-level EU contribution totals are available and shown.
- Project data reflects the state at the time of the last scrape. The EC portal is updated periodically.
- Some organisation profiles may be incomplete if the EC API returned partial data.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | Wouter |
| Styling | Tailwind CSS v4 |
| Charts | Apache ECharts via echarts-for-react |
| Search | MiniSearch (client-side full-text) |
| Build | Vite 7 |
| Hosting | Static files on cPanel |

No server, no database, no authentication. The entire application is a set of static files that can be hosted anywhere.

---

## Local development

**Prerequisites:** Node.js 18+ and pnpm (or npm)

```bash
# Clone the repo
git clone https://github.com/CiubotaruBogdan/edf-explorer.git
cd edf-explorer

# Install dependencies
cd app
pnpm install

# Start dev server
pnpm dev
# App available at http://localhost:3000/
```

The dev server proxies data files from the project root. No additional configuration needed.

---

## Build and deploy

From the project root, run:

```powershell
.\deploy.ps1
```

This single command:
1. Builds the React app with production settings (`app/` -> `app/dist/`)
2. Syncs built assets to `assets/`
3. Automatically patches the asset hashes in `index.html`
4. Packages everything into `web/edf-explorer.zip` ready for cPanel upload

**To deploy on a different base path** (e.g. root of a domain):

```powershell
.\deploy.ps1 -Base "/"
```

**To upload to cPanel:**
1. Open File Manager and navigate to `public_html/edf-explorer/`
2. Upload `web/edf-explorer.zip`
3. Extract in place
4. Done

---

## Project structure

```
edf-explorer/
├── app/                        # React SPA source
│   ├── src/
│   │   ├── pages/              # Route-level components
│   │   │   ├── Home.tsx
│   │   │   ├── ProjectsList.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── CompaniesList.tsx
│   │   │   ├── CompanyDetail.tsx
│   │   │   ├── Statistics.tsx
│   │   │   ├── ChartBuilder.tsx
│   │   │   └── About.tsx
│   │   ├── components/
│   │   │   ├── Layout.tsx      # Header, nav, footer
│   │   │   └── FilterPanel.tsx # Sidebar filters with facets and search
│   │   └── lib/
│   │       ├── data.ts         # Data loading, filtering, formatting helpers
│   │       ├── types.ts        # TypeScript interfaces (Project, Company...)
│   │       ├── useDataset.ts   # React hook for data loading
│   │       └── search.ts       # MiniSearch integration
│   ├── index.html              # Vite dev entry
│   ├── vite.config.ts          # Dev config
│   ├── vite.config.prod.ts     # Production config
│   └── package.json
├── assets/                     # Built JS/CSS (output of deploy.ps1)
├── data/                       # JSON dataset
│   ├── projects.json
│   ├── companies.json
│   └── meta.json
├── index.html                  # Production HTML entry point
├── deploy.ps1                  # One-command build + deploy script
├── .gitignore
└── web/                        # cPanel-ready ZIP (generated, not tracked)
```

---

## Contributing

Issues and pull requests are welcome. If you spot incorrect data, a bug, or want to suggest a feature, open an issue or reach out directly.

---

## Credits

Built by [Ciubotaru Bogdan-Iulian, PhD](https://ciubotarubogdan.ro/) using:

- [Claude Cowork](https://claude.ai) — planning and architecture
- [Claude Code](https://claude.ai/code) — code writing and iteration
- [ChatGPT Codex](https://openai.com) — data processing logic
- [Manus](https://manus.im) — sandboxed development and testing

This project started from the realisation that no public tool existed for exploring EDF statistics in a meaningful way.

---

## License

MIT — see [LICENSE](app/LICENSE).

> Independent visualisation of public data published by the European Commission, Directorate-General for Defence Industry and Space (DG DEFIS). Not affiliated with or endorsed by the European Union.
