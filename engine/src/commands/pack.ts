import { eq, and, gte, lte, inArray, desc, sql } from 'drizzle-orm';
import { mkdirSync, writeFileSync } from 'node:fs';
import { format } from 'date-fns';
import { getDb, closeDb, schema } from '../db/client.ts';
import { paths } from '../lib/paths.ts';
import { logger } from '../lib/logger.ts';

interface PackOptions {
  slot: string;
  limit: number;
}

const MAX_PER_CLUSTER = 5;

function recencyFactor(publishedAt: Date | null): number {
  if (!publishedAt) return 0.5;
  const ageHours = (Date.now() - publishedAt.getTime()) / 3_600_000;
  if (ageHours < 6) return 1.0;
  if (ageHours < 24) return 0.85;
  if (ageHours < 48) return 0.7;
  return 0.5;
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function formatPackMd(
  signals: Array<{
    signal: any;
    source: any;
    displayId: string;
    whyNow: string;
  }>,
  slot: string,
  dateStr: string,
  weeklyDigest: boolean,
  weekendSummary?: string,
): string {
  const lines: string[] = [];
  const generated = new Date().toISOString();

  lines.push(`# SCQR Pack — ${dateStr} ${slot}`);
  lines.push('');
  lines.push(`Generated: ${generated}`);
  lines.push(`Signals: ${signals.length}`);
  if (weeklyDigest) lines.push('**Weekend Digest: true**');
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const { signal, source, displayId, whyNow } of signals) {
    const pubDate = signal.publishedAt
      ? format(signal.publishedAt, 'yyyy-MM-dd HH:mm')
      : 'unknown';
    lines.push(`## ${displayId} — ${signal.title}`);
    lines.push(`**Source**: ${source.name} (authority: ${source.authorityScore}/10)`);
    lines.push(`**Published**: ${pubDate}`);
    lines.push(`**Why now**: ${whyNow}`);
    lines.push(`**URL**: ${signal.url}`);
    lines.push('');
    if (signal.summary) lines.push(signal.summary);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  if (weeklyDigest && weekendSummary) {
    lines.push('## Weekend Digest');
    lines.push('');
    lines.push(weekendSummary);
    lines.push('');
  }

  return lines.join('\n');
}

export async function runPack(opts: PackOptions): Promise<void> {
  const db = getDb();
  mkdirSync(paths.packs, { recursive: true });

  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 3_600_000);
  const dateStr = format(now, 'yyyy-MM-dd');

  const isWeeklyDigest = opts.slot === 'evening' && now.getDay() === 0;

  try {
    const newSignals = await db
      .select({
        signal: schema.signals,
        source: schema.sources,
      })
      .from(schema.signals)
      .innerJoin(schema.sources, eq(schema.signals.sourceId, schema.sources.id))
      .where(
        and(
          eq(schema.signals.status, 'new'),
          gte(schema.signals.fetchedAt, cutoff),
        ),
      )
      .orderBy(desc(schema.signals.fetchedAt));

    if (newSignals.length === 0) {
      logger.info({ slot: opts.slot, date: dateStr }, 'pack: no new signals in last 24h — skipping');
      closeDb();
      return;
    }

    const scored = newSignals.map(({ signal, source }) => {
      const clusterSizeFactor =
        signal.clusterId != null
          ? Math.min(1.5, 1 + (signal.clusterId > 0 ? 0.1 : 0))
          : 1.0;
      const score =
        source.authorityScore * recencyFactor(signal.publishedAt) * clusterSizeFactor;
      return { signal, source, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const selected: typeof scored = [];
    const clusterCounts = new Map<number, number>();

    for (const item of scored) {
      if (selected.length >= opts.limit) break;
      const cid = item.signal.clusterId ?? -item.signal.id;
      const count = clusterCounts.get(cid) ?? 0;
      if (count >= MAX_PER_CLUSTER) continue;
      selected.push(item);
      clusterCounts.set(cid, count + 1);
    }

    const packItems = selected.map(({ signal, source, score }, i) => ({
      signal,
      source,
      displayId: `SIG-${i + 1}`,
      whyNow: signal.clusterId != null
        ? `кластер сигналов по теме; authority ${source.authorityScore}/10`
        : `новый сигнал; authority ${source.authorityScore}/10`,
    }));

    let weekendSummary: string | undefined;
    if (isWeeklyDigest) {
      const satStart = new Date(now);
      satStart.setDate(satStart.getDate() - 1);
      satStart.setHours(0, 0, 0, 0);
      const weekendSignals = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.signals)
        .where(
          and(
            gte(schema.signals.fetchedAt, satStart),
            lte(schema.signals.fetchedAt, now),
          ),
        );
      const wCount = weekendSignals[0]?.count ?? 0;
      weekendSummary = `За выходные собрано ${wCount} сигналов. Пакет включает лучшие ${packItems.length} по рейтингу.`;
    }

    const md = formatPackMd(packItems, opts.slot, dateStr, isWeeklyDigest, weekendSummary);
    const mdPath = `${paths.packs}/${dateStr}-${opts.slot}.md`;
    writeFileSync(mdPath, md, 'utf-8');

    if (selected.length > 0) {
      const signalIds = selected.map((s) => s.signal.id);
      await db
        .update(schema.signals)
        .set({ status: 'in_pack' })
        .where(inArray(schema.signals.id, signalIds));
    }

    const [pack] = await db
      .insert(schema.packs)
      .values({
        slot: (opts.slot === 'morning' || opts.slot === 'evening' ? opts.slot : 'ad-hoc') as any,
        date: dateStr,
        pathToMd: mdPath,
        signalCount: selected.length,
        weeklyDigest: isWeeklyDigest,
      })
      .returning({ id: schema.packs.id });

    await db.insert(schema.packItems).values(
      packItems.map((item, i) => ({
        packId: pack.id,
        signalId: item.signal.id,
        ordering: i + 1,
        summaryLine: item.signal.summary?.slice(0, 200) ?? null,
        importanceNote: item.whyNow,
        displayId: item.displayId,
      })),
    );

    logger.info(
      {
        packId: pack.id,
        slot: opts.slot,
        date: dateStr,
        signals: selected.length,
        weeklyDigest: isWeeklyDigest,
        path: mdPath,
      },
      'pack: done',
    );
    console.log(
      `\nПакет ${dateStr}-${opts.slot} готов: ${selected.length} сигналов.` +
      `\nФайл: ${mdPath}` +
      `\nЖду рецензию в .scqr/reviews/${dateStr}-${opts.slot}.md`,
    );
  } finally {
    closeDb();
  }
}
