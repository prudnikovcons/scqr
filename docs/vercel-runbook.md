# SCQR Vercel Runbook

## Goal

Deploy the Astro-based SCQR frontend from GitHub to Vercel with a clean static build and a repeatable release flow.

## Current deployment model

- framework: Astro static site
- content source: Markdown collection in `src/content/posts`
- expected hosting mode: Git-connected Vercel project
- release path: local changes -> Git commit -> GitHub push -> Vercel build

## Local commands

```bash
npm install
npm run import:scqr
npm run build
npm run vercel:pull
npx vercel
npx vercel --prod
```

## First-time Vercel setup

1. Install or use `npx vercel`.
2. Authenticate in the CLI if needed.
3. Link the repo root `D:\CODEX\gitscqr\scqr` to the correct Vercel project.
4. Pull remote settings and env values if the project uses them later.
5. Confirm the production domain and DNS state in Vercel.

## Expected project settings

- root directory: repository root
- build command: `npm run build`
- output directory: `dist`
- install command: `npm install`

## Release checklist

1. `npm run import:scqr`
2. `npm run build`
3. inspect changed routes and homepage composition
4. push to GitHub
5. confirm Vercel build result
6. verify homepage, archive, and at least one article page in production

## Known blockers for fully automated deploy from this environment

- no Vercel CLI is currently installed in PATH
- no `.vercel/` local project link exists yet
- deployment may still require one-time authentication or dashboard confirmation

## Practical division of labor

- Codex prepares code, routes, scripts, and deployment-ready structure
- user may need to complete one-time authentication if Vercel access is not already available to the session
- once linked, Codex can continue operating the release loop with far less friction
