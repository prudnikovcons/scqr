import { defineConfig } from 'drizzle-kit';
import { resolve } from 'node:path';

const dbPath =
  process.env.SCQR_DB_PATH ?? resolve(process.cwd(), '..', '.scqr', 'data.db');

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: { url: dbPath },
  verbose: true,
  strict: true,
});
