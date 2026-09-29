# Yhteiskuntasimulaattori — Vite prototype v0.2

A transparent, source-aware prototype for exploring a Finnish basic-income scenario.

## What changed in v0.2

- The provisional 2024 working-age proxy is gone.
- The default `18–64` preset is now **3,301,351 people at 31 Dec 2025**.
- The app no longer hardcodes baseline arrays in `src/data/baseline.ts`.
- A versioned data pipeline now builds `src/data/generated/baseline-2025.json`.
- Statistics Finland population data can be refreshed directly from the PxWeb API.
- Data validation and a small PxWeb parser test suite run before production builds.

## Exact 2025 population preset

Statistics Finland table `11rd` is the official one-year-age population table. It is updated through 2025 and defines age as age in whole years at 31 December.

The app's 18–64 population is:

```text
3,301,351 people
```

The ingestion script derives this by selecting total sex and summing the 47 one-year age cells 18, 19, …, 64 from `11rd`.

For a second independent official cross-check, Statistics Finland's 2025 age-group data give:

```text
5,652,881 total
- 1,004,036 age 0–17
- 1,347,494 age 65+
= 3,301,351 age 18–64
```

Sources:
- https://pxdata.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__vaerak/11rd.px/
- https://stat.fi/tietotrendit/artikkelit/2026/Vanhusvaeestoen-maeaeraessae-hurja-kasvu-vuoteen-2045-mennessae-kuka-Suomen-vanhukset-hoitaa

## Data architecture

```text
data/curated/baseline-2025.curated.json
                 │
                 │                    Statistics Finland PxWeb API
                 │                            │
                 │                            ▼
                 │          scripts/ingest-statfin-population.mjs
                 │                            │
                 │                            ▼
                 │        data/snapshots/statfin/11rd-2025.*.json
                 │                            │
                 └──────────────┬─────────────┘
                                ▼
                    scripts/build-baseline.mjs
                                │
                                ▼
                 src/data/generated/baseline-2025.json
                                │
                                ▼
                      src/data/baseline.ts
                                │
                      ┌─────────┴─────────┐
                      ▼                   ▼
               calculation engine        React UI
```

`src/data/baseline.ts` is now only a typed adapter around the generated JSON. The browser does not query StatFin directly.

## Refresh the Statistics Finland population snapshot

Requires network access:

```bash
npm run data:update
```

This does three things:

1. GETs metadata for Statistics Finland `11rd`.
2. Resolves the current PxWeb variable codes from metadata and POSTs only the needed 2025 cells.
3. Validates the results, writes raw/normalized snapshots, and rebuilds the app baseline.

Statistics Finland changed PxWeb table and variable identifiers on 8 June 2026. The ingest script deliberately does **not** hardcode the post-change classification variable codes; it discovers them from table metadata.

API documentation:
- https://pxdata.stat.fi/api1.html
- https://stat.fi/en/services/statistical-data-services/open-data-and-interfaces/interface-use-of-databases/instructions-for-updating-interface-queries

## Offline rebuild

If you already have a normalized snapshot checked into the repository, no network is required:

```bash
npm run data:build
npm run data:validate
npm run test:data
```

The repository ships with a cross-checked 2025 normalized population snapshot, so normal app builds remain reproducible even if StatFin is unavailable.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

The `prebuild` hook validates the generated data and runs ingestion-library tests before TypeScript/Vite compilation.

## What the app currently does

- Shows the verified 2025 public-finance baseline.
- Uses the exact 2025 `18–64` population preset.
- Lets the user change a basic-income monthly amount and eligible-population assumption.
- Lets the user choose whether selected benefits are kept, fully replaced, or recalculated.
- Calculates gross annual UBI expenditure.
- Calculates only **mechanical** offsets for benefits explicitly selected for full replacement.
- Keeps taxes, recalculated benefits and behavioural effects visibly unresolved instead of inventing numbers.
- Exposes formulas, inputs and official source links in an audit trail.

At the default 800 €/month for all 18–64-year-olds, the gross annual expenditure is approximately **€31.693bn/year** before taxes, benefit interactions, and behavioural effects.

## Current boundary

The population ingest is live and reproducible. The national-accounts and Kela values are currently stored in the curated source file with their verified source metadata. The next ingestion work should give those sources their own fetch/parse adapters rather than pretending that every source has the same API shape.

## GitHub Pages deployment (YHSIM)

This repository is configured for the project-site URL:

`https://buca.github.io/YHSIM/`

`vite.config.ts` therefore uses:

```ts
base: '/YHSIM/'
```

Do **not** publish the repository source folder directly with GitHub Pages. Vite source files such as `src/main.tsx` are development inputs and are not browser-deployable as-is.

The included `.github/workflows/deploy.yml` runs the Vite production build and publishes only `dist/`.

In GitHub, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. Then push to `main`, or run the workflow manually from the **Actions** tab.

After a successful deployment, `view-source:https://buca.github.io/YHSIM/` should reference paths under `/YHSIM/assets/...`, not `/src/main.tsx`.
