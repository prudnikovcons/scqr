import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, closeDb } from './client.ts';
import { logger } from '../lib/logger.ts';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = resolve(here, 'migrations');

try {
  const db = getDb();
  logger.info({ migrationsFolder }, 'Applying migrations');
  migrate(db, { migrationsFolder });
  logger.info('Migrations applied.');
} catch (err) {
  logger.error({ err }, 'Migration failed.');
  process.exit(1);
} finally {
  closeDb();
}
