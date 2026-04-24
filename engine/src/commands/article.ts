import { logger } from '../lib/logger.ts';

interface SaveArticleOptions {
  jobId: string;
  frontmatterFile: string;
  bodyFile: string;
}

export async function saveArticle(opts: SaveArticleOptions): Promise<void> {
  logger.warn(
    { opts },
    'article:save: stub (Phase 2). Lands in Phase 3 — validates frontmatter via shared zod schema, writes to site/src/content/posts/<slug>.md, updates article_jobs.',
  );
}
