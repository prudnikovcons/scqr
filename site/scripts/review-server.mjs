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
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const PACKS_DIR = join(ROOT, '.scqr', 'packs');
const REVIEWS_DIR = join(ROOT, '.scqr', 'reviews');
const ARTICLES_DIR = join(ROOT, '.scqr', 'articles');
const POSTS_DIR = join(ROOT, 'site', 'src', 'content', 'posts');
const ASSETS_DIR = join(ROOT, 'site', 'src', 'assets', 'editorial', 'contributed');
const UI_HTML = join(__dirname, 'review-ui.html');
const EDITOR_HTML = join(__dirname, 'editor-ui.html');
const QUEUE_HTML = join(__dirname, 'queue-ui.html');

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

// ─────────────────────────────────────────────────────────────────────────
// Frontmatter helpers (минимальный YAML без зависимостей)
// ─────────────────────────────────────────────────────────────────────────

function splitFrontmatter(md) {
	const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!m) return { fm: '', body: md };
	return { fm: m[1], body: m[2] };
}

function joinFrontmatter(fm, body) {
	return `---\n${fm}\n---\n\n${body.replace(/^\n+/, '')}`;
}

function getFmField(fm, name) {
	// Простой матч: name: "value" или name: value (одно-строчный)
	const re = new RegExp(`^${name}:\\s*"([^"\\n]*)"\\s*$`, 'm');
	const m = fm.match(re);
	if (m) return m[1];
	const re2 = new RegExp(`^${name}:\\s*([^\\n]*)$`, 'm');
	const m2 = fm.match(re2);
	if (m2) return m2[1].trim().replace(/^"|"$/g, '');
	return null;
}

function setFmField(fm, name, value) {
	const safe = String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
	const line = `${name}: "${safe}"`;
	const re = new RegExp(`^${name}:.*$`, 'm');
	if (re.test(fm)) {
		return fm.replace(re, line);
	}
	return fm + `\n${line}`;
}

function setFmRaw(fm, name, rawValue) {
	// rawValue вставляется как есть (для путей, чисел, массивов)
	const line = `${name}: ${rawValue}`;
	const re = new RegExp(`^${name}:.*$`, 'm');
	if (re.test(fm)) return fm.replace(re, line);
	return fm + `\n${line}`;
}

// ─────────────────────────────────────────────────────────────────────────
// Articles: список, чтение, сохранение, sidecar, обложка, accept, publish
// ─────────────────────────────────────────────────────────────────────────

async function listArticles(filterStatus) {
	let files = [];
	try {
		files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.md'));
	} catch {
		return [];
	}
	const items = [];
	for (const file of files) {
		const slug = file.replace(/\.md$/, '');
		try {
			const md = await readFile(join(POSTS_DIR, file), 'utf8');
			const { fm } = splitFrontmatter(md);
			const status = getFmField(fm, 'status') || '';
			if (filterStatus && status !== filterStatus) continue;
			const title = getFmField(fm, 'title') || slug;
			const deck = getFmField(fm, 'deck') || '';
			const pubDate = getFmField(fm, 'pubDate') || '';
			const heroImage = getFmField(fm, 'heroImage') || '';
			const sidecarPath = join(ARTICLES_DIR, slug, 'sidecar.json');
			let hasCoverPrompt = false;
			let hasTgPost = false;
			try {
				const sc = JSON.parse(await readFile(sidecarPath, 'utf8'));
				hasCoverPrompt = !!(sc.coverPrompt && sc.coverPrompt.trim());
				hasTgPost = !!(sc.tgPost && sc.tgPost.trim());
			} catch {}
			items.push({ slug, title, deck, pubDate, status, heroImage, hasCoverPrompt, hasTgPost });
		} catch {
			// пропускаем сломанный файл
		}
	}
	items.sort((a, b) => (b.pubDate || '').localeCompare(a.pubDate || ''));
	return items;
}

function safeSlug(slug) {
	const safe = String(slug || '').replace(/[^a-z0-9._-]/gi, '');
	if (safe !== slug) throw new Error('invalid slug');
	return safe;
}

async function getArticle(slug) {
	const safe = safeSlug(slug);
	const md = await readFile(join(POSTS_DIR, `${safe}.md`), 'utf8');
	const { fm, body } = splitFrontmatter(md);
	let sidecar = null;
	try {
		const buf = await readFile(join(ARTICLES_DIR, safe, 'sidecar.json'), 'utf8');
		sidecar = JSON.parse(buf);
	} catch {}
	const articleType = getFmField(fm, 'articleType') || 'analysis';
	const fields = {
		title: getFmField(fm, 'title') || '',
		description: getFmField(fm, 'description') || '',
		deck: getFmField(fm, 'deck') || '',
		scqrVerdict: getFmField(fm, 'scqrVerdict') || '',
		tgTeaser: getFmField(fm, 'tgTeaser') || '',
		heroAlt: getFmField(fm, 'heroAlt') || '',
		status: getFmField(fm, 'status') || 'draft',
		pubDate: getFmField(fm, 'pubDate') || '',
		heroImage: getFmField(fm, 'heroImage') || '',
		articleType,
	};
	// форматы: либо явно из sidecar.formats, либо «фолбэк» — текущий тип = единственный формат
	const formats = (sidecar && sidecar.formats) || {
		[articleType]: {
			label: FORMAT_LABELS[articleType] || articleType,
			readingTime: Number(getFmField(fm, 'readingTime')) || null,
			body,
			tgPost: (sidecar && sidecar.tgPost) || '',
		},
	};
	const activeFormat = (sidecar && sidecar.activeFormat) || articleType;
	return { slug: safe, fields, body, fm, sidecar, formats, activeFormat };
}

const FORMAT_LABELS = {
	news: 'Заметка',
	column: 'Колонка',
	analysis: 'Аналитика',
	illustration: 'Иллюстрация',
};

const FORMAT_ORDER = ['news', 'column', 'analysis', 'illustration'];

async function saveArticle(slug, payload) {
	const safe = safeSlug(slug);
	const path = join(POSTS_DIR, `${safe}.md`);
	const md = await readFile(path, 'utf8');
	let { fm, body } = splitFrontmatter(md);

	const f = payload.fields || {};
	for (const key of ['title', 'description', 'deck', 'scqrVerdict', 'tgTeaser', 'heroAlt']) {
		if (typeof f[key] === 'string') {
			fm = setFmField(fm, key, f[key]);
		}
	}
	if (typeof f.status === 'string' && ['draft', 'ready', 'approved'].includes(f.status)) {
		fm = setFmField(fm, 'status', f.status);
	}
	if (typeof payload.body === 'string') {
		body = payload.body;
	}

	const out = joinFrontmatter(fm, body);
	await writeFile(path, out, 'utf8');

	// сайдкар
	if (payload.sidecar || typeof payload.body === 'string') {
		const sidecarDir = join(ARTICLES_DIR, safe);
		await mkdir(sidecarDir, { recursive: true });
		const existing = (await readJsonSafe(join(sidecarDir, 'sidecar.json'))) || {};
		const merged = {
			...existing,
			...(payload.sidecar || {}),
			slug: safe,
			updatedAt: new Date().toISOString(),
		};
		if (!merged.createdAt) merged.createdAt = merged.updatedAt;

		// синхронизируем активный формат: при автосейве правок в редакторе
		// тело статьи + tgPost попадают в formats[activeFormat]
		const articleType = getFmField(fm, 'articleType') || 'analysis';
		const activeFormat = merged.activeFormat || articleType;
		merged.activeFormat = activeFormat;
		merged.formats = merged.formats || {};
		const slot = merged.formats[activeFormat] || {
			label: FORMAT_LABELS[activeFormat] || activeFormat,
			readingTime: Number(getFmField(fm, 'readingTime')) || null,
			body: '',
			tgPost: '',
		};
		if (typeof payload.body === 'string') slot.body = payload.body;
		if (payload.sidecar && typeof payload.sidecar.tgPost === 'string') {
			slot.tgPost = payload.sidecar.tgPost;
		}
		slot.readingTime = Number(getFmField(fm, 'readingTime')) || slot.readingTime || null;
		merged.formats[activeFormat] = slot;

		// синхронизируем верхнеуровневый tgPost = active format
		if (payload.sidecar && typeof payload.sidecar.tgPost === 'string') {
			merged.tgPost = payload.sidecar.tgPost;
		}

		await writeFile(join(sidecarDir, 'sidecar.json'), JSON.stringify(merged, null, 2), 'utf8');
	}

	return { ok: true, slug: safe, savedAt: new Date().toISOString() };
}

async function switchFormat(slug, newFormat) {
	const safe = safeSlug(slug);
	const sidecarPath = join(ARTICLES_DIR, safe, 'sidecar.json');
	const sidecar = (await readJsonSafe(sidecarPath)) || { formats: {} };
	if (!sidecar.formats || !sidecar.formats[newFormat]) {
		throw new Error(`format '${newFormat}' not defined for ${safe}`);
	}
	const postPath = join(POSTS_DIR, `${safe}.md`);
	const md = await readFile(postPath, 'utf8');
	let { fm, body } = splitFrontmatter(md);

	// 1) сохраняем текущее в активный слот (на случай несохранённых правок)
	const oldActive = sidecar.activeFormat || getFmField(fm, 'articleType') || 'analysis';
	if (sidecar.formats[oldActive]) {
		sidecar.formats[oldActive].body = body;
		sidecar.formats[oldActive].tgPost = sidecar.tgPost || sidecar.formats[oldActive].tgPost || '';
		sidecar.formats[oldActive].readingTime = Number(getFmField(fm, 'readingTime')) || sidecar.formats[oldActive].readingTime || null;
	}

	// 2) загружаем новый формат
	const slot = sidecar.formats[newFormat];
	const newBody = slot.body || '';
	const newTg = slot.tgPost || '';
	const newReadingTime = slot.readingTime || null;

	// 3) обновляем frontmatter (articleType + readingTime)
	fm = setFmField(fm, 'articleType', newFormat);
	if (newReadingTime != null) {
		fm = setFmRaw(fm, 'readingTime', String(newReadingTime));
	}
	await writeFile(postPath, joinFrontmatter(fm, newBody), 'utf8');

	// 4) обновляем sidecar
	sidecar.activeFormat = newFormat;
	sidecar.tgPost = newTg;
	sidecar.updatedAt = new Date().toISOString();
	if (!sidecar.createdAt) sidecar.createdAt = sidecar.updatedAt;
	sidecar.slug = safe;
	await writeFile(sidecarPath, JSON.stringify(sidecar, null, 2), 'utf8');

	return { ok: true, slug: safe, activeFormat: newFormat };
}

async function readJsonSafe(path) {
	try {
		return JSON.parse(await readFile(path, 'utf8'));
	} catch {
		return null;
	}
}

async function uploadCover(slug, payload) {
	const safe = safeSlug(slug);
	const dataUrl = payload.dataUrl || '';
	const m = dataUrl.match(/^data:(image\/(png|jpeg|webp));base64,(.+)$/);
	if (!m) throw new Error('expected dataUrl image/png|jpeg|webp');
	const ext = m[2] === 'jpeg' ? 'jpg' : m[2];
	const buf = Buffer.from(m[3], 'base64');

	// 1) site/src/assets/editorial/contributed/<YYYY-MM-DD>/<slug>.<ext> — для Astro hero
	const dateMatch = safe.match(/^(\d{4}-\d{2}-\d{2})/);
	const dateDir = dateMatch ? dateMatch[1] : 'misc';
	const assetDir = join(ASSETS_DIR, dateDir);
	await mkdir(assetDir, { recursive: true });
	const assetPath = join(assetDir, `${safe}.${ext}`);
	await writeFile(assetPath, buf);

	// 2) site/public/editorial/og/<YYYY-MM-DD>/<slug>.<ext> — для Telegram sendPhoto
	//    (Astro обрабатывает только src/assets, /public идёт без изменений)
	const ogDir = join(ROOT, 'site', 'public', 'editorial', 'og', dateDir);
	await mkdir(ogDir, { recursive: true });
	const ogPath = join(ogDir, `${safe}.${ext}`);
	await writeFile(ogPath, buf);
	const ogUrl = `/editorial/og/${dateDir}/${safe}.${ext}`;

	// относительный путь heroImage от поста (Astro)
	const relPath = `../../assets/editorial/contributed/${dateDir}/${safe}.${ext}`;

	// обновить frontmatter
	const postPath = join(POSTS_DIR, `${safe}.md`);
	const md = await readFile(postPath, 'utf8');
	let { fm, body } = splitFrontmatter(md);
	fm = setFmRaw(fm, 'heroImage', relPath);
	if (!getFmField(fm, 'heroSource')) {
		fm = setFmField(fm, 'heroSource', 'user-supplied');
	}
	await writeFile(postPath, joinFrontmatter(fm, body), 'utf8');

	// записать ogUrl в sidecar
	const sidecarDir = join(ARTICLES_DIR, safe);
	await mkdir(sidecarDir, { recursive: true });
	const sidecarPath = join(sidecarDir, 'sidecar.json');
	const existing = (await readJsonSafe(sidecarPath)) || {};
	existing.slug = safe;
	existing.ogUrl = ogUrl;
	existing.updatedAt = new Date().toISOString();
	if (!existing.createdAt) existing.createdAt = existing.updatedAt;
	await writeFile(sidecarPath, JSON.stringify(existing, null, 2), 'utf8');

	return { ok: true, heroImage: relPath, ogUrl, savedBytes: buf.length };
}

async function publishArticle(slug) {
	const safe = safeSlug(slug);
	// 1) status: ready → approved
	await saveArticle(safe, { fields: { status: 'approved' } });

	// 2) git add + commit + push
	const filesToAdd = [
		`site/src/content/posts/${safe}.md`,
	];
	// если есть обложка — добавим директорию ассетов
	const dateMatch = safe.match(/^(\d{4}-\d{2}-\d{2})/);
	if (dateMatch) {
		filesToAdd.push(`site/src/assets/editorial/contributed/${dateMatch[1]}`);
	}
	const title = (await getArticle(safe)).fields.title;
	const message = `post: ${title}`;

	await gitRun(['add', ...filesToAdd]);
	await gitRun(['commit', '-m', message]);
	await gitRun(['push']);

	return { ok: true, slug: safe, message };
}

async function sendTgReview(slug) {
	const safe = safeSlug(slug);
	return new Promise((resolveCmd, rejectCmd) => {
		const scriptPath = join(__dirname, 'tg-review.mjs');
		const p = spawn(process.execPath, [scriptPath, safe], { cwd: ROOT });
		let out = '', err = '';
		p.stdout.on('data', (d) => (out += d));
		p.stderr.on('data', (d) => (err += d));
		p.on('close', (code) => {
			if (code === 0) resolveCmd({ ok: true, slug: safe, log: out.trim() });
			else rejectCmd(new Error(`tg-review.mjs ${safe} → ${code}: ${err.trim() || out.trim()}`));
		});
		p.on('error', rejectCmd);
	});
}

function gitRun(args) {
	return new Promise((resolveCmd, rejectCmd) => {
		const p = spawn('git', args, { cwd: ROOT });
		let out = '', err = '';
		p.stdout.on('data', (d) => (out += d));
		p.stderr.on('data', (d) => (err += d));
		p.on('close', (code) => {
			if (code === 0) resolveCmd({ out, err });
			else rejectCmd(new Error(`git ${args.join(' ')} → ${code}: ${err || out}`));
		});
		p.on('error', rejectCmd);
	});
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

async function readBody(req, opts = {}) {
	const maxBytes = opts.maxBytes || 2 * 1024 * 1024;
	return new Promise((resolveBody, rejectBody) => {
		const chunks = [];
		let total = 0;
		req.on('data', (c) => {
			total += c.length;
			if (total > maxBytes) {
				rejectBody(new Error(`body too large (>${maxBytes} bytes)`));
				req.destroy();
				return;
			}
			chunks.push(c);
		});
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

		// ────────────── Editor / Queue ──────────────
		if (method === 'GET' && (pathname === '/editor' || pathname === '/editor/' || pathname.startsWith('/editor/'))) {
			const html = await readFile(EDITOR_HTML);
			return send(res, 200, html, MIME['.html']);
		}
		if (method === 'GET' && (pathname === '/queue' || pathname === '/queue/')) {
			const html = await readFile(QUEUE_HTML);
			return send(res, 200, html, MIME['.html']);
		}

		// API: список статей по статусу
		if (method === 'GET' && pathname === '/api/articles') {
			const status = url.searchParams.get('status') || '';
			const items = await listArticles(status || null);
			return send(res, 200, { articles: items });
		}

		// API: одна статья
		if (method === 'GET' && pathname.startsWith('/api/article/')) {
			const slug = decodeURIComponent(pathname.slice('/api/article/'.length));
			const data = await getArticle(slug);
			return send(res, 200, data);
		}

		// API: сохранить статью
		if (method === 'POST' && pathname.startsWith('/api/article-save/')) {
			const slug = decodeURIComponent(pathname.slice('/api/article-save/'.length));
			const body = await readBody(req);
			const result = await saveArticle(slug, body);
			return send(res, 200, result);
		}

		// API: загрузить обложку
		if (method === 'POST' && pathname.startsWith('/api/article-cover/')) {
			const slug = decodeURIComponent(pathname.slice('/api/article-cover/'.length));
			const body = await readBody(req, { maxBytes: 10 * 1024 * 1024 });
			const result = await uploadCover(slug, body);
			return send(res, 200, result);
		}

		// API: принять в очередь (status → ready)
		if (method === 'POST' && pathname.startsWith('/api/article-accept/')) {
			const slug = decodeURIComponent(pathname.slice('/api/article-accept/'.length));
			const result = await saveArticle(slug, { fields: { status: 'ready' } });
			return send(res, 200, result);
		}

		// API: вернуть в редактор (status → draft)
		if (method === 'POST' && pathname.startsWith('/api/article-unaccept/')) {
			const slug = decodeURIComponent(pathname.slice('/api/article-unaccept/'.length));
			const result = await saveArticle(slug, { fields: { status: 'draft' } });
			return send(res, 200, result);
		}

		// API: опубликовать (git commit + push)
		if (method === 'POST' && pathname.startsWith('/api/article-publish/')) {
			const slug = decodeURIComponent(pathname.slice('/api/article-publish/'.length));
			const result = await publishArticle(slug);
			return send(res, 200, result);
		}

		// API: переключить формат публикации (news/column/analysis)
		if (method === 'POST' && pathname.startsWith('/api/article-switch-format/')) {
			const slug = decodeURIComponent(pathname.slice('/api/article-switch-format/'.length));
			const body = await readBody(req);
			const result = await switchFormat(slug, body.format);
			return send(res, 200, result);
		}

		// API: отправить TG-пост в бот на ревью владельцу
		if (method === 'POST' && pathname.startsWith('/api/article-tg-send/')) {
			const slug = decodeURIComponent(pathname.slice('/api/article-tg-send/'.length));
			// сохранить текущий TG-пост из тела запроса в sidecar (на случай, если
			// владелец отредактировал и не успел дождаться автосейва)
			const body = await readBody(req);
			if (body && typeof body.tgPost === 'string') {
				await saveArticle(slug, { fields: {}, sidecar: { tgPost: body.tgPost } });
			}
			const result = await sendTgReview(slug);
			return send(res, 200, result);
		}

		// 404
		return send(res, 404, { error: 'not found', pathname });
	} catch (err) {
		console.error('[review-server]', err);
		return send(res, 500, { error: String(err && err.message ? err.message : err) });
	}
});

// ─────────────────────────────────────────────────────────────────────────
// TG watcher — авто-поднимаемый дочерний процесс
// ─────────────────────────────────────────────────────────────────────────

function loadEnvLocalIntoServer() {
	// чтобы знать, есть ли SCQR_AI_BOT_TOKEN — он лежит в .env.local
	const file = join(ROOT, '.env.local');
	try {
		const buf = require('node:fs').readFileSync(file, 'utf8');
		for (const line of buf.split(/\r?\n/)) {
			const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
			if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
		}
	} catch {}
}

let watcherChild = null;
let watcherShouldRun = true;

function startTgWatcher() {
	if (!watcherShouldRun) return;
	if (!process.env.SCQR_AI_BOT_TOKEN) {
		console.log('  [tg-watcher] disabled — SCQR_AI_BOT_TOKEN missing in .env.local');
		return;
	}
	const scriptPath = join(__dirname, 'tg-review.mjs');
	// 86400 секунд = 24 часа; getUpdates long-poll 25 сек
	const child = spawn(process.execPath, [scriptPath, '--watch', '86400'], {
		cwd: ROOT,
		stdio: ['ignore', 'pipe', 'pipe'],
		env: process.env,
	});
	watcherChild = child;
	child.stdout.on('data', (d) => {
		const s = d.toString().trim();
		if (s) console.log('[tg-watcher]', s);
	});
	child.stderr.on('data', (d) => {
		const s = d.toString().trim();
		if (s) console.error('[tg-watcher]', s);
	});
	child.on('exit', (code, signal) => {
		watcherChild = null;
		if (!watcherShouldRun) return;
		console.log(`[tg-watcher] exited code=${code} signal=${signal}, respawning in 5s`);
		setTimeout(startTgWatcher, 5000);
	});
	console.log('  [tg-watcher] started, listening for callbacks');
}

function stopTgWatcher() {
	watcherShouldRun = false;
	if (watcherChild) {
		try { watcherChild.kill(); } catch {}
		watcherChild = null;
	}
}

process.on('SIGINT', () => { stopTgWatcher(); process.exit(0); });
process.on('SIGTERM', () => { stopTgWatcher(); process.exit(0); });

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
loadEnvLocalIntoServer();

server.listen(PORT, () => {
	console.log(`SCQR Review UI: http://localhost:${PORT}/`);
	console.log(`  packs:   ${PACKS_DIR}`);
	console.log(`  reviews: ${REVIEWS_DIR}`);
	startTgWatcher();
});
