import type { Signal } from '../db/schema.ts';
import type { NormalizedSignal } from './normalize.ts';

interface DedupeResult {
  unique: NormalizedSignal[];
  duplicateCount: number;
}

function tokenize(title: string): Set<string> {
  const STOP = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'by','from','as','is','was','are','were','be','been','has','have','had',
    'it','its','this','that','these','those','not','no','can','will','may',
    'should','about','how','what','when','where','who','which','all','new',
    'и','в','на','с','по','к','от','для','не','что','как','так','уже','еще','но',
  ]);
  return new Set(
    title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP.has(t)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

export function dedupeSignals(
  incoming: NormalizedSignal[],
  recent: Signal[],
): DedupeResult {
  const existingHashes = new Set(recent.map((s) => s.contentHash));
  const existingUrlsBySource = new Map<number, Set<string>>();
  for (const s of recent) {
    if (!existingUrlsBySource.has(s.sourceId)) {
      existingUrlsBySource.set(s.sourceId, new Set());
    }
    existingUrlsBySource.get(s.sourceId)!.add(s.url);
  }

  const recentTitles = recent
    .filter((s) => Date.now() - (s.fetchedAt?.getTime() ?? 0) < 7 * 86_400_000)
    .map((s) => ({ sourceId: s.sourceId, tokens: tokenize(s.title) }));

  const unique: NormalizedSignal[] = [];
  const seenHashes = new Set<string>();
  const seenUrlsBySource = new Map<number, Set<string>>();
  let duplicateCount = 0;

  for (const sig of incoming) {
    if (existingHashes.has(sig.contentHash) || seenHashes.has(sig.contentHash)) {
      duplicateCount++;
      continue;
    }

    const srcUrls = existingUrlsBySource.get(sig.sourceId);
    const newSrcUrls = seenUrlsBySource.get(sig.sourceId);
    if (srcUrls?.has(sig.url) || newSrcUrls?.has(sig.url)) {
      duplicateCount++;
      continue;
    }

    const tokens = tokenize(sig.title);
    const isTitleDupe = recentTitles.some(
      (r) => r.sourceId === sig.sourceId && jaccard(tokens, r.tokens) >= 0.6,
    );
    if (isTitleDupe) {
      duplicateCount++;
      continue;
    }

    seenHashes.add(sig.contentHash);
    if (!seenUrlsBySource.has(sig.sourceId)) seenUrlsBySource.set(sig.sourceId, new Set());
    seenUrlsBySource.get(sig.sourceId)!.add(sig.url);
    unique.push(sig);
  }

  return { unique, duplicateCount };
}
