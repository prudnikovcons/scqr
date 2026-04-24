import { existsSync, statSync, mkdirSync } from 'node:fs';
import { paths } from '../lib/paths.ts';
import { logger } from '../lib/logger.ts';
import { getDb, closeDb } from '../db/client.ts';
import { sources } from '../db/schema.ts';
import { count } from 'drizzle-orm';

interface CheckResult {
  name: string;
  ok: boolean;
  detail?: string;
}

export async function runDoctor(): Promise<void> {
  const checks: CheckResult[] = [];

  for (const [key, dir] of Object.entries({
    runtime: paths.runtime,
    packs: paths.packs,
    jobs: paths.jobs,
    visualQueue: paths.visualQueue,
    logs: paths.logs,
    reviews: paths.reviews,
  })) {
    try {
      mkdirSync(dir, { recursive: true });
      checks.push({ name: `dir:${key}`, ok: true, detail: dir });
    } catch (err: any) {
      checks.push({ name: `dir:${key}`, ok: false, detail: `${dir} — ${err?.message}` });
    }
  }

  checks.push({
    name: 'site:posts',
    ok: existsSync(paths.posts),
    detail: paths.posts,
  });
  checks.push({
    name: 'site:assets',
    ok: existsSync(paths.assets),
    detail: paths.assets,
  });

  try {
    const db = getDb();
    const dbStat = existsSync(paths.db) ? statSync(paths.db) : null;
    checks.push({
      name: 'db:open',
      ok: true,
      detail: dbStat ? `${paths.db} (${dbStat.size} bytes)` : `${paths.db} (newly created)`,
    });

    try {
      const [{ value }] = await db.select({ value: count() }).from(sources);
      checks.push({ name: 'db:sources', ok: true, detail: `${value} sources` });
    } catch (err: any) {
      checks.push({
        name: 'db:sources',
        ok: false,
        detail: `Schema not migrated yet: ${err?.message}. Run: pnpm --filter @scqr/engine db:generate && db:migrate`,
      });
    }
  } catch (err: any) {
    checks.push({ name: 'db:open', ok: false, detail: err?.message });
  } finally {
    closeDb();
  }

  checks.push({
    name: 'env:OPENAI_API_KEY',
    ok: true,
    detail: process.env.OPENAI_API_KEY ? 'set' : 'unset (ok for Claude Code harness; needed only for Codex visual generation)',
  });

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    const tag = c.ok ? 'OK ' : 'XX ';
    logger.info(`${tag} ${c.name.padEnd(22)} ${c.detail ?? ''}`);
  }

  if (failed.length > 0) {
    logger.warn({ failed: failed.length }, 'doctor: some checks failed');
    process.exitCode = 1;
  } else {
    logger.info({ checked: checks.length }, 'doctor: all green');
  }
}
