import { and, lte, inArray } from 'drizzle-orm';
import { getDb, closeDb, schema } from '../db/client.ts';
import { logger } from '../lib/logger.ts';

const RETENTION_DAYS = 90;

export async function runSignalsArchive(): Promise<void> {
  const db = getDb();
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000);

  try {
    const stale = await db
      .select({ id: schema.signals.id })
      .from(schema.signals)
      .where(
        and(
          lte(schema.signals.fetchedAt, cutoff),
          inArray(schema.signals.status, ['new', 'in_pack']),
        ),
      );

    if (stale.length === 0) {
      logger.info({ retentionDays: RETENTION_DAYS }, 'signals archive: nothing to archive');
      return;
    }

    const ids = stale.map((s) => s.id);
    await db
      .update(schema.signals)
      .set({ status: 'archived' })
      .where(inArray(schema.signals.id, ids));

    for (const { id } of stale) {
      await db.insert(schema.decisionLog).values({
        entityType: 'signal',
        entityId: String(id),
        decision: 'archived_by_retention',
        reason: `Older than ${RETENTION_DAYS} days with status new/in_pack`,
        decidedBy: 'auto',
      });
    }

    logger.info({ archived: ids.length, retentionDays: RETENTION_DAYS }, 'signals archive: done');
  } finally {
    closeDb();
  }
}
