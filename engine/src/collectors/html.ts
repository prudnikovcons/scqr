import * as cheerio from 'cheerio';
import { logger } from '../lib/logger.ts';
import type { RawItem } from './rss.ts';

const FETCH_TIMEOUT_MS = 12_000;

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SCQR-signal-collector/0.1 (editorial bot)' },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return res.text();
  } catch (err: any) {
    logger.debug({ url, err: err?.message }, 'html collector: fetch failed');
    return null;
  }
}

export async function collectHtml(opts: {
  url: string;
  selector?: string;
}): Promise<RawItem[]> {
  const html = await fetchHtml(opts.url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const items: RawItem[] = [];

  if (opts.selector) {
    $(opts.selector).each((_, el) => {
      const $el = $(el);
      const link = $el.find('a').first();
      const href = link.attr('href') ?? $el.attr('href');
      const title = link.text().trim() || $el.find('h2,h3,h4').first().text().trim();
      const snippet = $el.find('p').first().text().trim();
      if (href && title) {
        const url = href.startsWith('http') ? href : new URL(href, opts.url).href;
        items.push({ url, title, snippet, isoDate: null });
      }
    });
    return items;
  }

  $('article, .post, .entry, .item, li.article').each((_, el) => {
    const $el = $(el);
    const link = $el.find('a[href]').first();
    const href = link.attr('href');
    const title =
      $el.find('h1,h2,h3').first().text().trim() || link.text().trim();
    const snippet = $el.find('p').first().text().trim().slice(0, 400);

    if (href && title && title.length > 5) {
      const url = href.startsWith('http') ? href : new URL(href, opts.url).href;
      items.push({ url, title, snippet, isoDate: null });
    }
  });

  return items;
}
