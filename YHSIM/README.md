# Yhteiskuntasimulaattori — Vite prototype

A transparent, source-aware prototype for exploring a Finnish basic-income scenario.

## What this version does

- Shows the verified 2025 public-finance baseline used in the project.
- Lets the user change a basic-income monthly amount and eligible-population assumption.
- Lets the user choose whether selected benefits are kept, fully replaced, or recalculated.
- Calculates gross annual UBI expenditure.
- Calculates only **mechanical** offsets for benefits explicitly selected for full replacement.
- Keeps taxes, recalculated benefits and behavioural effects visibly unresolved instead of inventing numbers.
- Exposes formulas, inputs and official source links in an audit trail.

## Important data caveat

The `18–64` population preset is intentionally marked **provisional**: it uses Statistics Finland's 2024 reference value of 3,293,886 people. The app includes the official 2025 total population (5,652,881). The next data-ingestion task is to snapshot the 2025 one-year age table (`11rd`) and derive exact 2025 age-range populations.

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

## Current dependency versions

- Vite 8.3.1
- React / React DOM 19.3.0
- `@vitejs/plugin-react` 6.1.1
- TypeScript 7.0.2

## Architecture

```text
src/data/baseline.ts   Versioned source snapshot used by the UI
src/engine/simulate.ts Deterministic calculation engine
src/App.tsx            Scenario editor + results + audit trail
```

The calculation engine is intentionally separate from UI rendering. A production version should move versioned source data into an ingestion pipeline/database and add a household-level static microsimulation layer before claiming a net fiscal effect.
