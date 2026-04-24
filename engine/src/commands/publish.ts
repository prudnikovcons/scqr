import { logger } from '../lib/logger.ts';

interface PublishOptions {
  slug: string;
}

export async function preparePublish(opts: PublishOptions): Promise<void> {
  logger.warn(
    { opts },
    'publish:prepare: stub (Phase 2). Lands in Phase 3 — validates, creates article/<slug> branch, commits.',
  );
}
