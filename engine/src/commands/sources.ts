import { eq } from 'drizzle-orm';
import { getDb, closeDb, schema } from '../db/client.ts';
import { logger } from '../lib/logger.ts';

const SOURCE_TYPES = ['rss', 'html', 'github', 'arxiv', 'regulator', 'blog'] as const;
const LANGUAGES = ['ru', 'en', 'zh', 'other'] as const;

export async function listSources(opts: { inactive?: boolean } = {}): Promise<void> {
  const db = getDb();
  try {
    const rows = opts.inactive
      ? await db.select().from(schema.sources).orderBy(schema.sources.id)
      : await db
          .select()
          .from(schema.sources)
          .where(eq(schema.sources.active, true))
          .orderBy(schema.sources.id);

    if (rows.length === 0) {
      logger.info('No sources found. Add with: pnpm scqr sources add <name> <url> <type>');
      return;
    }

    const header = [
      'ID'.padEnd(4),
      'Name'.padEnd(30),
      'Type'.padEnd(10),
      'Lang'.padEnd(5),
      'Score'.padEnd(6),
      'Active'.padEnd(7),
      'Last fetch'.padEnd(20),
      'Last error',
    ].join(' ');
    console.log(header);
    console.log('-'.repeat(header.length));

    for (const s of rows) {
      const lastFetch = s.lastFetchedAt
        ? s.lastFetchedAt.toISOString().replace('T', ' ').slice(0, 19)
        : 'never';
      const lastErr = s.lastError ? s.lastError.slice(0, 40) : '';
      console.log(
        [
          String(s.id).padEnd(4),
          s.name.slice(0, 29).padEnd(30),
          s.type.padEnd(10),
          s.language.padEnd(5),
          String(s.authorityScore).padEnd(6),
          (s.active ? 'yes' : 'no').padEnd(7),
          lastFetch.padEnd(20),
          lastErr,
        ].join(' '),
      );
    }
    console.log(`\nTotal: ${rows.length} source(s)`);
  } finally {
    closeDb();
  }
}

export async function addSource(opts: {
  name: string;
  url: string;
  type: string;
  rss?: string;
  lang?: string;
  category?: string;
  score?: string;
  notes?: string;
  inactive?: boolean;
}): Promise<void> {
  if (!SOURCE_TYPES.includes(opts.type as any)) {
    logger.error({ type: opts.type }, `Invalid type. Must be one of: ${SOURCE_TYPES.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const lang = (opts.lang ?? 'en') as (typeof LANGUAGES)[number];
  if (!LANGUAGES.includes(lang)) {
    logger.error({ lang }, `Invalid lang. Must be one of: ${LANGUAGES.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const score = Number(opts.score ?? 5);
  if (isNaN(score) || score < 1 || score > 10) {
    logger.error({ score: opts.score }, 'Invalid score. Must be 1–10.');
    process.exitCode = 1;
    return;
  }

  const db = getDb();
  try {
    const [inserted] = await db
      .insert(schema.sources)
      .values({
        name: opts.name,
        url: opts.url,
        rssUrl: opts.rss,
        type: opts.type as (typeof SOURCE_TYPES)[number],
        language: lang,
        category: opts.category ?? 'misc',
        authorityScore: score,
        active: !opts.inactive,
        notes: opts.notes,
      })
      .returning({ id: schema.sources.id });

    logger.info(
      { id: inserted.id, name: opts.name, type: opts.type, active: !opts.inactive },
      'source added',
    );

    await db.insert(schema.decisionLog).values({
      entityType: 'source',
      entityId: String(inserted.id),
      decision: 'added',
      reason: opts.notes ?? 'manual add via CLI',
      decidedBy: 'cli',
    });
  } finally {
    closeDb();
  }
}

export async function deactivateSource(opts: { id: number }): Promise<void> {
  const db = getDb();
  try {
    const [existing] = await db
      .select({ id: schema.sources.id, name: schema.sources.name })
      .from(schema.sources)
      .where(eq(schema.sources.id, opts.id));

    if (!existing) {
      logger.error({ id: opts.id }, 'source not found');
      process.exitCode = 1;
      return;
    }

    await db
      .update(schema.sources)
      .set({ active: false })
      .where(eq(schema.sources.id, opts.id));

    await db.insert(schema.decisionLog).values({
      entityType: 'source',
      entityId: String(opts.id),
      decision: 'deactivated',
      reason: 'manual deactivation via CLI',
      decidedBy: 'cli',
    });

    logger.info({ id: opts.id, name: existing.name }, 'source deactivated');
  } finally {
    closeDb();
  }
}
