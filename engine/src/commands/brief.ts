import { logger } from '../lib/logger.ts';

interface BriefOptions {
  slug: string;
  file: string;
}

export async function saveBrief(opts: BriefOptions): Promise<void> {
  logger.warn(
    { opts },
    'brief:save: stub (Phase 2). Lands in Phase 3 — copies brief into .scqr/visual-queue/<slug>.md.',
  );
}
