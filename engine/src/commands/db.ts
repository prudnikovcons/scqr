import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { format } from 'date-fns';
import { paths } from '../lib/paths.ts';
import { logger } from '../lib/logger.ts';

export async function runDbBackup(): Promise<void> {
  if (!existsSync(paths.db)) {
    logger.error({ path: paths.db }, 'db backup: data.db not found — nothing to backup');
    process.exitCode = 1;
    return;
  }

  mkdirSync(paths.backups, { recursive: true });

  const ts = format(new Date(), 'yyyyMMdd-HHmm');
  const dest = `${paths.backups}/data-${ts}.db`;

  copyFileSync(paths.db, dest);
  logger.info({ src: paths.db, dest }, 'db backup: done');
}
