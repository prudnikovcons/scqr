import { logger } from '../lib/logger.ts';
import type { RawItem } from './rss.ts';

const FETCH_TIMEOUT_MS = 10_000;

function parseOwnerRepo(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.replace(/^\//, '').split('/');
    if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
  } catch {}
  return null;
}

export async function collectGithub(opts: { url: string }): Promise<RawItem[]> {
  const parsed = parseOwnerRepo(opts.url);
  if (!parsed) {
    logger.warn({ url: opts.url }, 'github collector: cannot parse owner/repo from URL');
    return [];
  }

  const apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/releases?per_page=20`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'SCQR-signal-collector/0.1',
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      logger.debug({ apiUrl, status: res.status }, 'github collector: API error');
      return [];
    }

    const releases: any[] = await res.json();
    return releases
      .filter((r) => r.body && !r.draft && !r.prerelease)
      .map((r) => ({
        url: r.html_url,
        title: `${parsed.repo} ${r.tag_name}: ${r.name || r.tag_name}`,
        snippet: r.body.slice(0, 400),
        isoDate: r.published_at ?? null,
      }));
  } catch (err: any) {
    logger.debug({ apiUrl, err: err?.message }, 'github collector: fetch failed');
    return [];
  }
}
