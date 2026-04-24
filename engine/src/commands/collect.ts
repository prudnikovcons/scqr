import { logger } from '../lib/logger.ts';

interface CollectOptions {
  slot: string;
  dryRun?: boolean;
  source?: string;
}

export async function runCollect(opts: CollectOptions): Promise<void> {
  logger.warn(
    { opts },
    'collect: stub (Phase 2). Implementation lands in Phase 3 — collectors/{rss,html,github}.ts + pipeline/{normalize,dedupe,cluster}.ts.',
  );
}
