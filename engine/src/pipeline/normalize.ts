import { createHash } from 'node:crypto';
import { parseISO, isValid } from 'date-fns';
import type { RawItem } from '../collectors/rss.ts';
import type { Source } from '../db/schema.ts';

export interface NormalizedSignal {
  sourceId: number;
  url: string;
  title: string;
  summary: string | null;
  publishedAt: Date | null;
  contentHash: string;
}

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

function canonicalUrl(raw: string): string {
  try {
    const u = new URL(raw.trim());
    for (const p of UTM_PARAMS) u.searchParams.delete(p);
    u.hash = '';
    return u.toString();
  } catch {
    return raw.trim();
  }
}

function parseSummary(snippet: string): string | null {
  const s = snippet.trim();
  if (!s) return null;
  if (s.length >= 200) return s.slice(0, 400);
  return s.length >= 20 ? s : null;
}

function parseDate(raw: string | null): Date | null {
  if (!raw) return null;
  try {
    const d = parseISO(raw);
    return isValid(d) ? d : new Date(raw);
  } catch {
    return null;
  }
}

export function normalizeSignal(item: RawItem, source: Source): NormalizedSignal | null {
  const url = canonicalUrl(item.url);
  if (!url) return null;

  const title = item.title.trim().slice(0, 200);
  if (!title) return null;

  const summary = parseSummary(item.snippet);

  const hashInput = `${url}|${title.slice(0, 50)}`;
  const contentHash = createHash('sha256').update(hashInput).digest('hex').slice(0, 32);

  return {
    sourceId: source.id,
    url,
    title,
    summary,
    publishedAt: parseDate(item.isoDate),
    contentHash,
  };
}
