import { logger } from '../lib/logger.ts';

export async function createJob(opts: { signalId: number; actionFile: string }): Promise<void> {
  logger.warn({ opts }, 'job:new: stub (Phase 2). Lands in Phase 3.');
}

export async function printJobContext(opts: { jobId: string }): Promise<void> {
  logger.warn({ opts }, 'job:context: stub (Phase 2). Lands in Phase 3.');
}

export async function updateJobStatus(opts: { jobId: string; status: string }): Promise<void> {
  logger.warn({ opts }, 'job:status: stub (Phase 2). Lands in Phase 3.');
}
