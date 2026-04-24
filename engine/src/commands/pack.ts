import { logger } from '../lib/logger.ts';

interface PackOptions {
  slot: string;
  limit: number;
}

export async function runPack(opts: PackOptions): Promise<void> {
  logger.warn(
    { opts },
    'pack: stub (Phase 2). Implementation lands in Phase 3 — pipeline/pack-builder.ts.',
  );
}
