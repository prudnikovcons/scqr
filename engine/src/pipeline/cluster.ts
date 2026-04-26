import { eq, gt, desc } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { schema } from '../db/client.ts';
import type { NormalizedSignal } from './normalize.ts';

const STOP_WORDS = new Set([
  'the','a','an','and','or','in','on','at','to','for','of','with','by',
  'from','is','was','are','were','be','has','have','it','this','that','not',
  'new','ai','about','how','what','when','into',
  'его','на','в','с','по','к','от','для','не','что','как','так','уже','но',
  'они','их','это',
]);

function extractTerms(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 3 && !STOP_WORDS.has(t))
    .slice(0, 8);
}

function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export interface ClusterResult {
  clusterId: number | null;
}

export async function assignCluster(
  db: BetterSQLite3Database<typeof schema>,
  signal: NormalizedSignal,
): Promise<ClusterResult> {
  const cutoff = new Date(Date.now() - 30 * 86_400_000);
  const terms = extractTerms(signal.title);

  if (terms.length === 0) return { clusterId: null };

  const recentClusters = await db
    .select()
    .from(schema.signalClusters)
    .where(gt(schema.signalClusters.lastSeenAt, cutoff))
    .orderBy(desc(schema.signalClusters.lastSeenAt))
    .limit(100);

  let bestCluster: (typeof recentClusters)[0] | null = null;
  let bestScore = 0;

  for (const c of recentClusters) {
    const clusterTerms = c.theme.split(',').map((t) => t.trim());
    const score = jaccard(terms, clusterTerms);
    if (score >= 0.3 && score > bestScore) {
      bestScore = score;
      bestCluster = c;
    }
  }

  if (bestCluster) {
    await db
      .update(schema.signalClusters)
      .set({ lastSeenAt: new Date(), signalCount: bestCluster.signalCount + 1 })
      .where(eq(schema.signalClusters.id, bestCluster.id));
    return { clusterId: bestCluster.id };
  }

  const theme = terms.slice(0, 5).join(',');
  const [inserted] = await db
    .insert(schema.signalClusters)
    .values({ theme, signalCount: 1 })
    .returning({ id: schema.signalClusters.id });

  return { clusterId: inserted.id };
}
