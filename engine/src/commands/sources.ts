import { logger } from '../lib/logger.ts';

export async function listSources(): Promise<void> {
  logger.warn('sources list: stub (Phase 2). Lands in Phase 3.');
}

export async function addSource(opts: any): Promise<void> {
  logger.warn({ opts }, 'sources add: stub (Phase 2). Lands in Phase 3.');
}

export async function deactivateSource(opts: { id: number }): Promise<void> {
  logger.warn({ opts }, 'sources deactivate: stub (Phase 2). Lands in Phase 3.');
}
