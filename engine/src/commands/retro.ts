import { logger } from '../lib/logger.ts';

interface RetroOptions {
  week: string;
}

export async function runRetro(opts: RetroOptions): Promise<void> {
  logger.warn(
    { opts },
    'retro: stub (Phase 2). Lands in Phase 3 — exports decision_log + signal dynamics for retro-reviewer.',
  );
}
