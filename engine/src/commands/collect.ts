import { eq, inArray, desc } from 'drizzle-orm';
import { appendFileSync, mkdirSync } from 'node:fs';
import { format } from 'date-fns';
import { getDb, closeDb, schema } from '../db/client.ts';
import { paths } from '../lib/paths.ts';
import { logger } from '../lib/logger.ts';
import { collectRss } from '../collectors/rss.ts';
import { collectHtml } from '../collectors/html.ts';
import { collectGithub } from '../collectors/github.ts';
import { normalizeSignal } from '../pipeline/normalize.ts';
import { dedupeSignals } from '../pipeline/dedupe.ts';
import { assignCluster } from '../pipeline/cluster.ts';
import type { Source } from '../db/schema.ts';

interface CollectOptions {
  slot: string;
  dryRun?: boolean;
  source?: string;
}

interface SourceLog {
  source_id: number;
  source_name: string;
  started_at: string;
  finished_at: string;
  fetched_count: number;
  deduplicated_count: number;
  error: string | null;
}

const CONCURRENCY = 5;

async function processSource(
  source: Source,
  recentSignals: Awaited<ReturnType<typeof getDb>>[any],
  db: ReturnType<typeof getDb>,
  dryRun: boolean,
): Promise<{ fetched: number; saved: number; duplicates: number; error: string | null }> {
  const startedAt = new Date().toISOString();
  let rawItems: Awaited<ReturnType<typeof collectRss>> = [];

  try {
    if (source.type === 'rss') {
      rawItems = await collectRss({ url: source.url, rssUrl: source.rssUrl ?? undefined });

      if (rawItems.length === 0 && source.lastFetchedAt) {
        const staleMsec = Date.now() - source.lastFetchedAt.getTime();
        if (staleMsec > 24 * 3600 * 1000) {
          rawItems = await collectHtml({ url: source.url });
        }
      }
    } else if (source.type === 'html' || source.type === 'blog' || source.type === 'regulator') {
      const selector = source.notes?.includes('selector:')
        ? source.notes.match(/selector:([^\n]+)/)?.[1]?.trim()
        : undefined;
      rawItems = await collectHtml({ url: source.url, selector });
    } else if (source.type === 'github') {
      rawItems = await collectGithub({ url: source.url });
    } else if (source.type === 'arxiv') {
      const rssUrl = source.rssUrl ?? `https://rss.arxiv.org/rss/${new URL(source.url).pathname.split('/').pop() ?? 'cs.AI'}`;
      rawItems = await collectRss({ url: source.url, rssUrl });
    } else {
      rawItems = await collectRss({ url: source.url, rssUrl: source.rssUrl ?? undefined });
    }
  } catch (err: any) {
    return { fetched: 0, saved: 0, duplicates: 0, error: err?.message ?? String(err) };
  }

  const normalized = rawItems
    .map((item) => normalizeSignal(item, source))
    .filter(Boolean) as Awaited<ReturnType<typeof normalizeSignal>>[];

  const { unique, duplicateCount } = dedupeSignals(normalized as any[], recentSignals as any[]);

  if (!dryRun && unique.length > 0) {
    for (const sig of unique) {
      const { clusterId } = await assignCluster(db, sig);
      await db.insert(schema.signals).values({
        sourceId: sig.sourceId,
        url: sig.url,
        title: sig.title,
        summary: sig.summary,
        publishedAt: sig.publishedAt,
        contentHash: sig.contentHash,
        clusterId,
        status: 'new',
      });
    }
  }

  return { fetched: rawItems.length, saved: unique.length, duplicates: duplicateCount, error: null };
}

export async function runCollect(opts: CollectOptions): Promise<void> {
  const db = getDb();
  mkdirSync(paths.logs, { recursive: true });

  const dateStr = format(new Date(), 'yyyyMMdd');
  const logFile = `${paths.logs}/collect-${opts.slot}-${dateStr}.jsonl`;

  let activeSources: Source[];
  try {
    if (opts.source) {
      activeSources = await db
        .select()
        .from(schema.sources)
        .where(eq(schema.sources.id, Number(opts.source)));
    } else {
      activeSources = await db
        .select()
        .from(schema.sources)
        .where(eq(schema.sources.active, true));
    }
  } catch (err: any) {
    logger.error({ err: err?.message }, 'collect: failed to load sources');
    closeDb();
    process.exitCode = 1;
    return;
  }

  if (activeSources.length === 0) {
    logger.warn({ slot: opts.slot }, 'collect: no active sources found');
    closeDb();
    return;
  }

  const recentSignals = await db
    .select()
    .from(schema.signals)
    .orderBy(desc(schema.signals.fetchedAt))
    .limit(500);

  let totalFetched = 0;
  let totalSaved = 0;
  let totalDuplicates = 0;
  let totalErrors = 0;
  let sourcesDeactivated = 0;

  for (let i = 0; i < activeSources.length; i += CONCURRENCY) {
    const batch = activeSources.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((src) => processSource(src, recentSignals as any[], db, opts.dryRun ?? false)),
    );

    for (let j = 0; j < batch.length; j++) {
      const src = batch[j];
      const result = results[j];
      const startedAt = new Date().toISOString();

      let log: SourceLog;
      if (result.status === 'fulfilled') {
        const r = result.value;
        totalFetched += r.fetched;
        totalSaved += r.saved;
        totalDuplicates += r.duplicates;

        log = {
          source_id: src.id,
          source_name: src.name,
          started_at: startedAt,
          finished_at: new Date().toISOString(),
          fetched_count: r.fetched,
          deduplicated_count: r.duplicates,
          error: r.error,
        };

        if (r.error) {
          totalErrors++;
          const newConsecutive = src.consecutiveErrors + 1;
          if (!opts.dryRun) {
            await db
              .update(schema.sources)
              .set({ lastError: r.error, consecutiveErrors: newConsecutive })
              .where(eq(schema.sources.id, src.id));

            if (newConsecutive >= 3) {
              await db
                .update(schema.sources)
                .set({ active: false })
                .where(eq(schema.sources.id, src.id));
              await db.insert(schema.decisionLog).values({
                entityType: 'source',
                entityId: String(src.id),
                decision: 'auto_deactivated',
                reason: `3 consecutive errors. Last: ${r.error}`,
                decidedBy: 'auto',
              });
              sourcesDeactivated++;
              logger.warn({ id: src.id, name: src.name }, 'source auto-deactivated after 3 errors');
            }
          }
        } else if (!opts.dryRun) {
          await db
            .update(schema.sources)
            .set({ lastFetchedAt: new Date(), lastError: null, consecutiveErrors: 0 })
            .where(eq(schema.sources.id, src.id));
        }
      } else {
        totalErrors++;
        log = {
          source_id: src.id,
          source_name: src.name,
          started_at: startedAt,
          finished_at: new Date().toISOString(),
          fetched_count: 0,
          deduplicated_count: 0,
          error: result.reason?.message ?? String(result.reason),
        };
      }

      appendFileSync(logFile, JSON.stringify(log) + '\n', 'utf-8');
    }
  }

  closeDb();

  const summary = {
    slot: opts.slot,
    dryRun: opts.dryRun ?? false,
    sources: activeSources.length,
    fetched: totalFetched,
    new: totalSaved,
    duplicates: totalDuplicates,
    errors: totalErrors,
    sources_deactivated: sourcesDeactivated,
    log: logFile,
  };

  logger.info(summary, 'collect: done');

  if (totalErrors > 0 && totalErrors / activeSources.length > 0.3) {
    logger.warn(
      { errorRate: `${Math.round((totalErrors / activeSources.length) * 100)}%` },
      'ALERT: >30% of sources failed — check network or sources registry',
    );
  }
}
