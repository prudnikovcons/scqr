import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const engineRoot = resolve(here, '..', '..');
const workspaceRoot = resolve(engineRoot, '..');

export const paths = {
  workspace: workspaceRoot,
  engine: engineRoot,
  site: resolve(workspaceRoot, 'site'),
  posts: process.env.SCQR_POSTS_PATH ?? resolve(workspaceRoot, 'site', 'src', 'content', 'posts'),
  assets: resolve(workspaceRoot, 'site', 'src', 'assets', 'editorial'),
  graphics: resolve(workspaceRoot, 'site', 'public', 'editorial', 'graphics'),
  runtime: resolve(workspaceRoot, '.scqr'),
  db: process.env.SCQR_DB_PATH ?? resolve(workspaceRoot, '.scqr', 'data.db'),
  packs: resolve(workspaceRoot, '.scqr', 'packs'),
  jobs: resolve(workspaceRoot, '.scqr', 'jobs'),
  visualQueue: resolve(workspaceRoot, '.scqr', 'visual-queue'),
  styleCorpus: resolve(workspaceRoot, '.scqr', 'style-corpus'),
  logs: resolve(workspaceRoot, '.scqr', 'logs'),
  reviews: resolve(workspaceRoot, '.scqr', 'reviews'),
} as const;

export type Paths = typeof paths;
