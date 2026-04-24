import { logger } from '../lib/logger.ts';

interface SaveReviewOptions {
  packId: number;
  actionsFile: string;
}

export async function saveReviewActions(opts: SaveReviewOptions): Promise<void> {
  logger.warn({ opts }, 'review:save: stub (Phase 2). Lands in Phase 3.');
}
