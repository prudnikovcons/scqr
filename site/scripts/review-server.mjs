#!/usr/bin/env node
// SCQR Review UI server — локальная веб-морда для письменной разметки сигналов.
//
// Запуск: pnpm review (из workspace root)
// Доступ: http://localhost:4321/
//
// Зависимостей нет — только node stdlib.

import { createServer } from 'node:http';
import { readFile, readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const PACKS_DIR = join(ROOT, '.scqr', 'packs');
const REVIEWS_DIR = join(ROOT, '.scqr', 'reviews');
const UI_HTML = join(__dirname, 'review-ui.html');

const PORT = Number(process.env.SCQR_REVIEW_PORT || 4321);

// ─────────────────────────────────────────────────────────────────────────
// Парсер md-пакетов
// ─────────────────────────────────────────────────────────────────────────

function parsePack(md) {
	const lines = md.split('\n');
	const meta = { title: '', generatedAt: '', signalsCount: 0, weeklyDigest: false };
	const signals = [];

	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		if (line.startsWith('# ')) {
			meta.title = line.slice(2).trim();
		} else if (line.startsWith('Generated:')) {
			meta.generatedAt = line.replace('Generated:', '').trim();
		} else if (line.startsWith('Signals:')) {
			meta.signalsCount = Number(line.replace('Signals:', '').trim()) || 0;
		} else if (line.includes('Weekend Digest')) {
			meta.weeklyDigest = /true/i.test(line);
		} else if (line.startsWith('## SIG-')) {
			break;
		}
		i += 1;
	}

	let current = null;
	let bodyLines = [];

	const flush = () => {
		if (current) {
			current.body = bodyLines.join('\n').trim();
			signals.push(current);
		}
		current = null;
		bodyLines = [];
	};

	for (; i < lines.length; i += 1) {
		const line = lines[i];
		const sigMatch = line.match(/^## SIG-(\d+)\s+—\s+(.+)$/);
		if (sigMatch) {
			flush();
			current = {
				id: `SIG-${sigMatch[1]}`,
				index: Number(sigMatch[1]),
				title: sigMatch[2].trim(),
				source: '',
				authority: null,
				published: '',
				whyNow: '',
				url: '',
				body: '',
			};
			continue;
		}

		if (!current) continue;

		const sourceMatch = line.match(/^\*\*Source\*\*:\s+(.+?)\s*\(authority:\s*(\d+)\/10\)/);
		if (sourceMatch) {
			current.source = sourceMatch[1].trim();
			current.authority = Number(sourceMatch[2]);
			continue;
		}

		const publishedMatch = line.match(/^\*\*Published\*\*:\s+(.+)$/);
		if (publishedMatch) {
			current.published = publishedMatch[1].trim();
			continue;
		}

		const whyNowMatch = line.match(/^\*\*Why now\*\*:\s+(.+)$/);
		if (whyNowMatch) {
			current.whyNow = whyNowMatch[1].trim();
			continue;
		}

		const urlMatch = line.match(/^\*\*URL\*\*:\s+(.+)$/);
		if (urlMatch) {
			current.url = urlMatch[1].trim();
			continue;
		}

		if (line.trim() === '---') {
			flush();
			continue;
		}

		bodyLines.push(line);
	}
	flush();

	return { meta, signals };
}

// ─────────────────────────────────────────────────────────────────────────
// API handlers
// ─────────────────────────────────────────────────────────────────────────

async function listPacks() {
	let entries = [];
	try {
		entries = await readdir(PACKS_DIR);
	} catch {
		return [];
	}
	const md = entries.filter((f) => f.endsWith('.md'));
	const items = await Promise.all(
		md.map(async (file) => {
			const path = join(PACKS_DIR, file);
			const st = await stat(path);
			return {
				name: file.replace(/\.md$/, ''),
				file,
				mtime: st.mtimeMs,
				size: st.size,
			};
		}),
	);
	items.sort((a, b) => b.mtime - a.mtime);
	return items;
}

async function getPack(name) {
	const file = name.endsWith('.md') ? name : `${name}.md`;
	const safe = file.replace(/[^a-z0-9._-]/gi, '');
	if (safe !== file) throw new Error('invalid name');
	const path = join(PACKS_DIR, safe);
	const md = await readFile(path, 'utf8');
	return parsePack(md);
}

async function readSuggestions(name) {
	const safe = name.replace(/[^a-z0-9._-]/gi, '');
	if (safe !== name) return null;
	const path = join(REVIEWS_DIR, `${safe}.suggestions.json`);
	try {
		const buf = await readFile(path, 'utf8');
		const parsed = JSON.parse(buf);
		// файл хранит { pack, author, suggestions: { SIG-N: {...} } }
		// возвращаем плоскую мапу для UI
		return parsed.suggestions || parsed;
	} catch {
		return null;
	}
}

async function readReview(name, kind) {
	const safe = name.replace(/[^a-z0-9._-]/gi, '');
	if (safe !== name) throw new Error('invalid name');
	const path = join(REVIEWS_DIR, `${safe}.${kind}.json`);
	try {
		const buf = await readFile(path, 'utf8');
		return JSON.parse(buf);
	} catch {
		return null;
	}
}

async function writeReview(name, kind, payload) {
	const safe = name.replace(/[^a-z0-9._-]/gi, '');
	if (safe !== name) throw new Error('invalid name');
	await mkdir(REVIEWS_DIR, { recursive: true });
	const path = join(REVIEWS_DIR, `${safe}.${kind}.json`);
	const body = {
		pack: safe,
		kind,
		savedAt: new Date().toISOString(),
		actions: payload.actions || {},
	};
	await writeFile(path, JSON.stringify(body, null, 2), 'utf8');
	return { path, savedAt: body.savedAt };
}

// ─────────────────────────────────────────────────────────────────────────
// HTTP server
// ─────────────────────────────────────────────────────────────────────────

const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
};

function send(res, status, body, contentType = 'application/json; charset=utf-8') {
	res.writeHead(status, { 'content-type': contentType, 'cache-control': 'no-store' });
	if (typeof body === 'string' || Buffer.isBuffer(body)) res.end(body);
	else res.end(JSON.stringify(body));
}

async function readBody(req) {
	return new Promise((resolveBody, rejectBody) => {
		const chunks = [];
		req.on('data', (c) => chunks.push(c));
		req.on('end', () => {
			try {
				const buf = Buffer.concat(chunks).toString('utf8');
				resolveBody(buf ? JSON.parse(buf) : {});
			} catch (e) {
				rejectBody(e);
			}
		});
		req.on('error', rejectBody);
	});
}

const server = createServer(async (req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);
	const { pathname } = url;
	const method = req.method || 'GET';

	try {
		// Index — UI HTML
		if (method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
			const html = await readFile(UI_HTML);
			return send(res, 200, html, MIME['.html']);
		}

		// API: список пакетов
		if (method === 'GET' && pathname === '/api/packs') {
			const items = await listPacks();
			return send(res, 200, { packs: items });
		}

		// API: один пакет
		if (method === 'GET' && pathname.startsWith('/api/pack/')) {
			const name = decodeURIComponent(pathname.slice('/api/pack/'.length));
			const pack = await getPack(name);
			const draft = await readReview(name, 'draft');
			const final = await readReview(name, 'review');
			const suggestions = await readSuggestions(name);
			return send(res, 200, { pack, draft, final, suggestions });
		}

		// API: автосейв черновика
		if (method === 'POST' && pathname.startsWith('/api/draft/')) {
			const name = decodeURIComponent(pathname.slice('/api/draft/'.length));
			const body = await readBody(req);
			const result = await writeReview(name, 'draft', body);
			return send(res, 200, result);
		}

		// API: финальная фиксация
		if (method === 'POST' && pathname.startsWith('/api/finalize/')) {
			const name = decodeURIComponent(pathname.slice('/api/finalize/'.length));
			const body = await readBody(req);
			const result = await writeReview(name, 'review', body);
			return send(res, 200, result);
		}

		// 404
		return send(res, 404, { error: 'not found', pathname });
	} catch (err) {
		console.error('[review-server]', err);
		return send(res, 500, { error: String(err && err.message ? err.message : err) });
	}
});

server.listen(PORT, () => {
	console.log(`SCQR Review UI: http://localhost:${PORT}/`);
	console.log(`  packs:   ${PACKS_DIR}`);
	console.log(`  reviews: ${REVIEWS_DIR}`);
});
