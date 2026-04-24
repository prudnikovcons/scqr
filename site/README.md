# SCQR Frontend

SCQR is an Astro-based editorial frontend for a premium AI market publication. This repository now carries the static site layer intended for Git-based deployment on Vercel.

## What is in scope

- homepage as the main editorial surface
- archive for imported SCQR materials
- article template for reading and metadata support
- content import flow from the legacy SCQR workspace
- docs for operating model and Vercel deployment

## Core commands

```bash
npm install
npm run import:scqr
npm run build
npm run preview
```

## Vercel commands

```bash
npm run vercel:pull
npm run vercel:preview
npm run vercel:prod
```

## Project structure

```text
src/
  components/      Shared shell components
  content/posts/   Imported SCQR materials
  layouts/         Reading surfaces
  lib/             Content and routing helpers
  pages/           Homepage, archive, article routes
docs/
  agent-operating-model.md
  vercel-runbook.md
scripts/
  import-scqr-content.mjs
```

## Operational notes

- Source content currently originates from `D:\CODEX\SCQR`.
- Imported articles are written into `src/content/posts/`.
- The design direction is based on the approved SCQR reference mockup supplied in `SCQR.zip`.
- The site is designed to remain static-first unless new requirements justify dynamic behavior.

## Key docs

- [Operating Model](docs/agent-operating-model.md)
- [Vercel Runbook](docs/vercel-runbook.md)
