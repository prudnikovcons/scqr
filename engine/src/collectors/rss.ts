import Parser from 'rss-parser';
import { logger } from '../lib/logger.ts';

export interface RawItem {
  url: string;
  title: string;
  snippet: string;
  isoDate: string | null;
}

const parser = new Parser({ timeout: 10_000 });

export async function collectRss(opts: { url: string; rssUrl?: string }): Promise<RawItem[]> {
  const feedUrl = opts.rssUrl ?? opts.url;
  try {
    const feed = await parser.parseURL(feedUrl);
    return (feed.items ?? [])
      .filter((item) => item.link && item.title)
      .map((item) => ({
        url: item.link!.trim(),
        title: item.title!.trim(),
        snippet: item.contentSnippet?.trim() ?? item.summary?.trim() ?? '',
        isoDate: item.isoDate ?? item.pubDate ?? null,
      }));
  } catch (err: any) {
    logger.debug({ feedUrl, err: err?.message }, 'rss collector: fetch failed');
    return [];
  }
}
