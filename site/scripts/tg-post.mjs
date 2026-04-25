#!/usr/bin/env node
// Post a published SCQR article to Telegram channel @scqr_ai.
//
// Usage:
//   node site/scripts/tg-post.mjs <slug>
//   node site/scripts/tg-post.mjs --preview <slug>   # build text, do not send
//
// Env: SCQR_AI_BOT_TOKEN (required), SCQR_TG_CHANNEL (default @scqr_ai),
//      SITE_URL (default https://ai.scqr.ru)
//
// Loads .env.local from the workspace root automatically.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');
const POSTS_DIR = path.join(WORKSPACE_ROOT, 'site', 'src', 'content', 'posts');
const LOG_DIR = path.join(WORKSPACE_ROOT, '.scqr', 'logs');

function loadEnvLocal() {
	const file = path.join(WORKSPACE_ROOT, '.env.local');
	if (!fs.existsSync(file)) return;
	for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
		const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
		if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
	}
}

function parseFrontmatter(raw) {
	const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!m) throw new Error('No frontmatter block');
	const fm = {};
	let key = null;
	for (const line of m[1].replace(/\r\n?/g, '\n').split('\n')) {
		const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
		if (kv) {
			key = kv[1];
			let val = kv[2].trim();
			if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
			else if (val.startsWith('[') && val.endsWith(']')) {
				val = val
					.slice(1, -1)
					.split(',')
					.map((s) => s.trim().replace(/^["']|["']$/g, ''))
					.filter(Boolean);
			}
			fm[key] = val;
		}
	}
	return { frontmatter: fm, body: m[2] };
}

const TYPE_LABELS = { news: 'Новость', analysis: 'Аналитика', column: 'Колонка', illustration: 'Иллюстрация' };
const RUBRIC_LABEL_TO_RUS = {
	trajectories: 'Траектории', generations: 'Генерации', automations: 'Автоматизации',
	innovations: 'Новации', illusions: 'Иллюзии', russia: 'В России',
	regulations: 'Регуляции', theories: 'Теории', tendencies: 'Тенденции',
};

const cyrToLat = (s) => {
	const map = {
		а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y',
		к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
		х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
	};
	return s
		.toLowerCase()
		.split('')
		.map((c) => (map[c] !== undefined ? map[c] : c))
		.join('');
};

const escapeHtml = (s) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const cleanTopicForTag = (topic) => {
	const lat = cyrToLat(topic);
	const slug = lat.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
	return slug ? `#${slug}` : '';
};

function buildPostText(fm, body, slug) {
	const siteUrl = process.env.SITE_URL || 'https://ai.scqr.ru';
	const url = `${siteUrl}${fm.publicUrl || `/${slug}/`}`;
	const title = fm.title || slug;
	const deck = fm.deck || fm.description || '';
	const typeLabel = TYPE_LABELS[fm.articleType] || fm.articleType || '';

	const rubricLabels = Array.isArray(fm.rubricLabels) && fm.rubricLabels.length > 0
		? fm.rubricLabels
		: (Array.isArray(fm.rubrics) ? fm.rubrics.map((r) => RUBRIC_LABEL_TO_RUS[r] || r) : []);
	const rubricLabel = rubricLabels[0] || '';

	const reading = fm.readingTime ? `${fm.readingTime} мин` : '';

	const metaParts = [rubricLabel, typeLabel, reading].filter(Boolean);
	const metaLine = metaParts.join(' · ');

	// Hashtags: rubric (russian-letterless), type, up to 2 topics
	const tagSet = new Set();
	if (rubricLabel) tagSet.add(`#${cyrToLat(rubricLabel).replace(/[^a-z]/g, '')}`);
	if (typeLabel) tagSet.add(`#${cyrToLat(typeLabel).replace(/[^a-z]/g, '')}`);
	if (Array.isArray(fm.topics)) {
		for (const topic of fm.topics.slice(0, 2)) {
			const tag = cleanTopicForTag(topic);
			if (tag) tagSet.add(tag);
			if (tagSet.size >= 4) break;
		}
	}
	const hashtags = [...tagSet].slice(0, 4).join(' ');

	const lines = [
		`<b>${escapeHtml(title)}</b>`,
		metaLine ? escapeHtml(metaLine) : null,
		'',
		escapeHtml(deck),
		'',
		`<a href="${url}">Читать на SCQR →</a>`,
	];
	if (hashtags) {
		lines.push('');
		lines.push(hashtags);
	}
	return lines.filter((l) => l !== null).join('\n');
}

async function tgRequest(method, body) {
	const token = process.env.SCQR_AI_BOT_TOKEN;
	if (!token) throw new Error('SCQR_AI_BOT_TOKEN is not set');
	const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	const json = await res.json();
	if (!json.ok) throw new Error(`${method} failed: ${JSON.stringify(json)}`);
	return json.result;
}

function logEntry(entry) {
	fs.mkdirSync(LOG_DIR, { recursive: true });
	const file = path.join(LOG_DIR, `tg-posts.jsonl`);
	fs.appendFileSync(file, JSON.stringify(entry) + '\n', 'utf8');
}

async function main() {
	loadEnvLocal();
	const args = process.argv.slice(2);
	let preview = false;
	const positional = [];
	for (const a of args) {
		if (a === '--preview') preview = true;
		else positional.push(a);
	}
	if (positional.length !== 1) {
		console.error('Usage: node site/scripts/tg-post.mjs [--preview] <slug>');
		process.exit(2);
	}
	const slug = positional[0].replace(/\.md$/, '');
	const file = path.join(POSTS_DIR, `${slug}.md`);
	if (!fs.existsSync(file)) {
		console.error(`Article not found: ${file}`);
		process.exit(1);
	}
	const raw = fs.readFileSync(file, 'utf8');
	const { frontmatter, body } = parseFrontmatter(raw);
	const text = buildPostText(frontmatter, body, slug);

	if (preview) {
		console.log('--- TG-PREVIEW ---');
		console.log(text);
		console.log('--- length:', text.length, 'chars ---');
		return;
	}

	const channel = process.env.SCQR_TG_CHANNEL || '@scqr_ai';
	const result = await tgRequest('sendMessage', {
		chat_id: channel,
		text,
		parse_mode: 'HTML',
		disable_web_page_preview: false,
	});
	console.log(`posted slug=${slug} message_id=${result.message_id} chat=${channel}`);
	logEntry({
		ts: new Date().toISOString(),
		slug,
		message_id: result.message_id,
		chat_id: result.chat.id,
		channel,
	});
}

main().catch((err) => {
	console.error('error:', err.message);
	process.exit(1);
});
