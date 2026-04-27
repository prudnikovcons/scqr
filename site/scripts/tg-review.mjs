#!/usr/bin/env node
// Send a SCQR article draft to the owner's private chat with the bot,
// with Принять / Отклонить inline buttons. Polls Telegram getUpdates for
// the callback, and on Принять, publishes to the @scqr_ai channel.
//
// Only the user_id stored in SCQR_OWNER_TG_ID can approve or reject.
// Anyone else who interacts with the bot gets a polite "не уполномочен"
// message and the buttons stay live for the owner.
//
// Usage:
//   node site/scripts/tg-review.mjs <slug>
//   node site/scripts/tg-review.mjs --watch              # listen for clicks on already-sent reviews
//   node site/scripts/tg-review.mjs --status             # show pending reviews
//
// Env (loaded from .env.local):
//   SCQR_AI_BOT_TOKEN   bot token
//   SCQR_OWNER_TG_ID    only this user can approve
//   SCQR_TG_CHANNEL     default @scqr_ai
//   SITE_URL            default https://ai.scqr.ru

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');
const POSTS_DIR = path.join(WORKSPACE_ROOT, 'site', 'src', 'content', 'posts');
const STATE_FILE = path.join(WORKSPACE_ROOT, '.scqr', 'logs', 'tg-review-state.json');
const POSTS_LOG = path.join(WORKSPACE_ROOT, '.scqr', 'logs', 'tg-posts.jsonl');

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
	for (const line of m[1].replace(/\r\n?/g, '\n').split('\n')) {
		const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
		if (!kv) continue;
		let val = kv[2].trim();
		if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
		else if (val.startsWith('[') && val.endsWith(']')) {
			val = val.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
		}
		fm[kv[1]] = val;
	}
	return { frontmatter: fm, body: m[2] };
}

const TYPE_LABELS = { news: 'Новость', analysis: 'Аналитика', column: 'Колонка', illustration: 'Иллюстрация' };
const RUBRIC_LABEL_TO_RUS = {
	trajectories: 'Траектории', generations: 'Генерации', automations: 'Автоматизации',
	innovations: 'Новации', illusions: 'Иллюзии', russia: 'В России',
	regulations: 'Регуляции', theories: 'Теории', tendencies: 'Тенденции',
};

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const tagFromString = (s) =>
	s ? `#${s.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '')}` : '';

function buildChannelText(fm, slug) {
	const siteUrl = process.env.SITE_URL || 'https://ai.scqr.ru';
	const cacheBust = Date.now();
	const path = fm.publicUrl || `/${slug}/`;
	const sep = path.includes('?') ? '&' : '?';
	const url = `${siteUrl}${path}${sep}utm_source=tg&v=${cacheBust}`;
	const title = fm.title || slug;
	const deck = fm.deck || fm.description || '';
	const teaser = (fm.tgTeaser || '').trim();
	const typeLabel = TYPE_LABELS[fm.articleType] || fm.articleType || '';
	const rubricLabels = Array.isArray(fm.rubricLabels) && fm.rubricLabels.length
		? fm.rubricLabels
		: (Array.isArray(fm.rubrics) ? fm.rubrics.map((r) => RUBRIC_LABEL_TO_RUS[r] || r) : []);
	const rubricLabel = rubricLabels[0] || '';
	const reading = fm.readingTime ? `${fm.readingTime} мин` : '';
	const metaLine = [rubricLabel, typeLabel, reading].filter(Boolean).join(' · ');

	const tagSet = new Set();
	if (rubricLabel) {
		const t = tagFromString(rubricLabel);
		if (t) tagSet.add(t);
	}
	if (Array.isArray(fm.topics)) {
		for (const topic of fm.topics) {
			const tag = tagFromString(topic);
			if (tag) tagSet.add(tag);
			if (tagSet.size >= 4) break;
		}
	}
	const hashtags = [...tagSet].slice(0, 4).join(' ');

	const lines = [`<b>${escapeHtml(title)}</b>`];
	if (metaLine) lines.push(escapeHtml(metaLine));
	lines.push('');
	lines.push(escapeHtml(deck));
	if (teaser) {
		lines.push('');
		lines.push(escapeHtml(teaser));
	}
	lines.push('');
	lines.push(`Разбираемся: <a href="${url}">читать на SCQR</a>`);
	if (hashtags) {
		lines.push('');
		lines.push(hashtags);
	}
	return lines.filter((l) => l !== null).join('\n');
}

async function tg(method, body, isMultipart = false) {
	const token = process.env.SCQR_AI_BOT_TOKEN;
	if (!token) throw new Error('SCQR_AI_BOT_TOKEN missing');
	const init = isMultipart
		? { method: 'POST', body }
		: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
	const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, init);
	const json = await r.json();
	if (!json.ok) throw new Error(`${method} failed: ${JSON.stringify(json)}`);
	return json.result;
}

function loadState() {
	if (!fs.existsSync(STATE_FILE)) return { pending: {}, lastUpdate: 0 };
	return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}
function saveState(state) {
	fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
	fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function appendPostsLog(entry) {
	fs.mkdirSync(path.dirname(POSTS_LOG), { recursive: true });
	fs.appendFileSync(POSTS_LOG, JSON.stringify(entry) + '\n', 'utf8');
}

function buildChannelTextFromTgPost(tgPost, fm, slug) {
	// Готовый tgPost из sidecar — берём как есть, только конвертируем в HTML-минимум
	// (HTML-сущности экранируем, ничего не оборачиваем). Telegram parse_mode HTML
	// требует экранирования &<> и допускает <b>, <i>, <a>.
	// Мы экранируем всё, потом раскрываем ссылку (если в tgPost есть «https://…») —
	// уже без обёртки, Telegram сам сделает превью если disable_web_page_preview=false.
	return tgPost.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function readSidecarTgPost(slug) {
	const sidecarPath = path.join(WORKSPACE_ROOT, '.scqr', 'articles', slug, 'sidecar.json');
	if (!fs.existsSync(sidecarPath)) return null;
	try {
		const data = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
		return (data.tgPost || '').trim() || null;
	} catch {
		return null;
	}
}

async function sendReview(slug) {
	const ownerId = process.env.SCQR_OWNER_TG_ID;
	if (!ownerId) throw new Error('SCQR_OWNER_TG_ID missing — owner has not started the bot yet.');
	const file = path.join(POSTS_DIR, `${slug}.md`);
	if (!fs.existsSync(file)) throw new Error(`Article not found: ${file}`);
	const { frontmatter } = parseFrontmatter(fs.readFileSync(file, 'utf8'));

	// Приоритет: sidecar.tgPost (свежий, уже отредактированный владельцем в /editor)
	// Фолбэк: автосборка из frontmatter
	const sidecarText = readSidecarTgPost(slug);
	const channelText = sidecarText
		? buildChannelTextFromTgPost(sidecarText, frontmatter, slug)
		: buildChannelText(frontmatter, slug);

	const review = `<b>На рецензию</b>\n\nНиже — драфт поста для @scqr_ai. Решения принимает только владелец.\n\n— — —\n\n${channelText}`;

	const result = await tg('sendMessage', {
		chat_id: ownerId,
		text: review,
		parse_mode: 'HTML',
		disable_web_page_preview: true,
		reply_markup: {
			inline_keyboard: [[
				{ text: '✓ Принять', callback_data: `approve:${slug.slice(0, 56)}` },
				{ text: '✕ Отклонить', callback_data: `reject:${slug.slice(0, 56)}` },
			]],
		},
	});
	const state = loadState();
	state.pending[slug] = {
		slug,
		dm_message_id: result.message_id,
		owner_id: Number(ownerId),
		channel_text: channelText,
		sent_at: new Date().toISOString(),
	};
	saveState(state);
	console.log(`review sent slug=${slug} dm_message_id=${result.message_id}`);
}

async function publishToChannel(slug, channelText) {
	const channel = process.env.SCQR_TG_CHANNEL || '@scqr_ai';
	const r = await tg('sendMessage', {
		chat_id: channel,
		text: channelText,
		parse_mode: 'HTML',
		disable_web_page_preview: false,
	});
	appendPostsLog({
		ts: new Date().toISOString(),
		slug,
		message_id: r.message_id,
		chat_id: r.chat.id,
		channel,
		via: 'review-approve',
	});
	const channelUsername = (channel.startsWith('@') ? channel.slice(1) : channel);
	return `https://t.me/${channelUsername}/${r.message_id}`;
}

async function processCallback(cb, state) {
	const ownerId = Number(process.env.SCQR_OWNER_TG_ID);
	const fromId = cb.from?.id;
	const data = cb.data || '';
	const [action, slugFragment] = data.split(':');

	if (fromId !== ownerId) {
		await tg('answerCallbackQuery', {
			callback_query_id: cb.id,
			text: 'Решения по публикациям принимает только редактор SCQR.',
			show_alert: true,
		});
		console.log(`unauthorized callback from id=${fromId} (${cb.from?.username})`);
		return;
	}

	// Find pending review whose slug matches the fragment.
	const pending = Object.values(state.pending).find((p) => p.slug.startsWith(slugFragment));
	if (!pending) {
		await tg('answerCallbackQuery', {
			callback_query_id: cb.id,
			text: 'Драфт уже не в работе.',
			show_alert: false,
		});
		return;
	}

	// Acknowledge the callback first so Telegram doesn't expire the query
	// while we publish (callback_query has a 5-minute window). If the ack
	// itself fails because the query was already old, we still proceed.
	const safeAnswer = async (text, alert = false) => {
		try {
			await tg('answerCallbackQuery', { callback_query_id: cb.id, text, show_alert: alert });
		} catch (err) {
			console.warn(`answerCallbackQuery soft-fail: ${err.message}`);
		}
	};

	if (action === 'approve') {
		await safeAnswer('Публикую в канал…');
		try {
			const link = await publishToChannel(pending.slug, pending.channel_text);
			delete state.pending[pending.slug];
			saveState(state);
			try {
				await tg('editMessageText', {
					chat_id: pending.owner_id,
					message_id: pending.dm_message_id,
					text: `<b>Опубликовано</b>\n\n${pending.slug}\n${link}`,
					parse_mode: 'HTML',
					disable_web_page_preview: true,
				});
			} catch (err) {
				console.warn(`edit DM soft-fail: ${err.message}`);
			}
			console.log(`approved + posted slug=${pending.slug} link=${link}`);
		} catch (err) {
			console.error('publish error:', err.message);
			try {
				await tg('editMessageText', {
					chat_id: pending.owner_id,
					message_id: pending.dm_message_id,
					text: `<b>Ошибка публикации</b>\n\n${pending.slug}\n${err.message.slice(0, 300)}`,
					parse_mode: 'HTML',
				});
			} catch (_) {}
		}
	} else if (action === 'reject') {
		await safeAnswer('Отклонено');
		delete state.pending[pending.slug];
		saveState(state);
		try {
			await tg('editMessageText', {
				chat_id: pending.owner_id,
				message_id: pending.dm_message_id,
				text: `<b>Отклонено</b>\n\n${pending.slug}\n\nЖду комментариев — что переделать.`,
				parse_mode: 'HTML',
			});
		} catch (err) {
			console.warn(`edit DM soft-fail: ${err.message}`);
		}
		console.log(`rejected slug=${pending.slug}`);
	}
}

async function watch(timeoutSeconds = 600) {
	const state = loadState();
	const deadline = Date.now() + timeoutSeconds * 1000;
	console.log(`watching for callbacks (timeout ${timeoutSeconds}s, pending=${Object.keys(state.pending).length})`);
	let offset = state.lastUpdate + 1;
	while (Date.now() < deadline && Object.keys(state.pending).length > 0) {
		const updates = await tg('getUpdates', { offset, timeout: 25, allowed_updates: ['callback_query'] });
		if (updates.length === 0) continue;
		for (const u of updates) {
			offset = u.update_id + 1;
			state.lastUpdate = u.update_id;
			if (u.callback_query) {
				await processCallback(u.callback_query, state);
			}
		}
		saveState(state);
	}
	console.log('watch done.');
}

function status() {
	const state = loadState();
	const pending = Object.values(state.pending);
	console.log(`pending: ${pending.length}`);
	for (const p of pending) {
		console.log(`  ${p.slug} (sent ${p.sent_at})`);
	}
}

async function main() {
	loadEnvLocal();
	const args = process.argv.slice(2);
	if (args[0] === '--status') {
		status();
		return;
	}
	if (args[0] === '--watch') {
		const timeoutArg = args[1] ? parseInt(args[1], 10) : 600;
		await watch(timeoutArg);
		return;
	}
	if (args.length === 0) {
		console.error('usage: tg-review.mjs <slug> | --watch [seconds] | --status');
		process.exit(2);
	}
	for (const slug of args) {
		await sendReview(slug.replace(/\.md$/, ''));
	}
}

main().catch((err) => {
	console.error('error:', err.message);
	process.exit(1);
});
