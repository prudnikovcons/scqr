#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
	EDITORIAL_IMAGE_STYLES,
	EDITORIAL_IMAGE_STYLE_ORDER,
} from '../src/data/editorial-image-styles.js';
import {
	getVisualMode,
	inferHeroSource,
	recommendHeroStrategy,
} from '../src/data/editorial-designer.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const postsDir = join(__dir, '../src/content/posts');
const outputPath = join(__dir, '../docs/editorial-image-briefs.md');

function parseFrontmatter(content) {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return null;
	const raw = match[1];
	const obj = {};

	for (const line of raw.split('\n')) {
		const m = line.match(/^(\w+):\s*(.*)$/);
		if (!m) continue;
		let [, key, val] = m;
		val = val.trim();
		if (val.startsWith('"') || val.startsWith("'")) {
			obj[key] = val.slice(1, -1);
		} else if (val.startsWith('[')) {
			try {
				obj[key] = JSON.parse(val.replace(/'/g, '"'));
			} catch {
				obj[key] = [];
			}
		} else if (!Number.isNaN(Number(val)) && val !== '') {
			obj[key] = Number(val);
		} else {
			obj[key] = val;
		}
	}

	return obj;
}

function chooseScene(post, style) {
	const haystack = `${post.title} ${post.deck} ${(post.topics || []).join(' ')}`.toLowerCase();

	if (style.id === 'scientific_lucid') {
		if (/(alphafold|белок|protein|молекул|биолог|drug)/.test(haystack)) {
			return 'светлая лабораторная сцена с одной сложной биологической формой, орбитами взаимодействий и тихим ощущением вычислительной точности';
		}
		return 'чистая исследовательская среда с одной центральной формой и спокойной аналитической глубиной';
	}

	if (style.id === 'human_collage') {
		return 'журнальный коллаж из фотофрагментов, рук, документов, лицевых деталей и культурных следов вокруг одной главной идеи';
	}

	if (style.id === 'civic_blueprint') {
		return 'институциональная схема: архив, государственное здание, карта или процедурный контур, собранный как ясный гражданский чертёж';
	}

	if (style.id === 'documentary_frame') {
		return 'живой редакционный кадр из рабочей среды, городской инфраструктуры или человеческого процесса без рекламной постановки';
	}

	if (style.id === 'editorial_still_life') {
		return 'один предметный объект или устройство в мягком студийном свете, где метафора читается через форму и материал';
	}

	if (/(энер|compute|чип|cloud|дата-центр|центры обработки|инфраструктур|энергосист|гигават)/.test(haystack)) {
		return 'крупный индустриальный узел: силовая шина, энергопластина или вычислительный щит';
	}
	if (/(агент|mcp|протокол|workflow|доступ|порт|интеграц|связ)/.test(haystack)) {
		return 'аккуратная сеть портов, каналов и узлов с одним напряжённым активным контуром';
	}
	if (/(регулир|допуск|governance|кодекс|compliance|акт|правил|контрол)/.test(haystack)) {
		return 'архитектурный порог: шлюз, рамка, коридор допуска или система секций';
	}
	if (/(рынок|капитал|выручк|ipo|инвест|монетизац|маржа|стоимост|экономик)/.test(haystack)) {
		return 'один тяжёлый символический объект рынка: монументальная масса, весы, блок или ядро власти';
	}
	return 'один ясный редакционный образ, который передаёт тезис статьи без буквальной иллюстрации';
}

function chooseAccent(style, post) {
	const heroSource = post.heroSource ?? inferHeroSource(post.heroImage);
	if (heroSource === 'user-supplied') {
		return 'сохранить характер пользовательского изображения, а фирменный акцент сделать вторичным и очень дозированным';
	}

	switch (style.id) {
		case 'scientific_lucid':
			return 'допускается мягкий минеральный зелёный или бордовый акцент, но без неона и без доминирования SCQR-green';
		case 'human_collage':
			return 'акцентом может быть терракота, сливовый или моховой тон; зелёный не обязан появляться вовсе';
		case 'civic_blueprint':
			return 'использовать гражданский зелёный, пыльно-синий или каменный графит, а не кислотный сигнал в центре';
		case 'documentary_frame':
			return 'акцент должен быть естественным для реальной среды: ткань, свет, знак, бумага, архитектурная деталь';
		case 'editorial_still_life':
			return 'один умеренный цветовой акцент в материале объекта или подсветке, без тотальной болотной гаммы';
		default:
			return 'один зелёный или графитовый акцент, если он действительно нужен для тезиса статьи';
	}
}

function buildPrompt(post) {
	const style = EDITORIAL_IMAGE_STYLES[post.heroStyle];
	const recommendation = recommendHeroStrategy({
		rubricSlug: Array.isArray(post.rubrics) ? post.rubrics[0] : '',
		articleType: post.articleType,
		title: post.title,
		deck: post.deck,
		topics: post.topics,
		hasUserImage: (post.heroSource ?? inferHeroSource(post.heroImage)) === 'user-supplied',
	});
	const rubric = Array.isArray(post.rubricLabels) && post.rubricLabels.length > 0
		? post.rubricLabels[0]
		: Array.isArray(post.rubrics) && post.rubrics.length > 0
			? post.rubrics[0]
			: 'SCQR';
	const topics = Array.isArray(post.topics) ? post.topics.join(', ') : '';
	const heroSource = post.heroSource ?? inferHeroSource(post.heroImage);

	return `Use case: editorial cover image for SCQR
Mode: ${heroSource}
Style family: ${style.label}
Visual mode: ${getVisualMode(style.id)}
Article title: ${post.title}
Deck: ${post.deck}
SCQR verdict: ${post.scqrVerdict}
Rubric: ${rubric}
Topics: ${topics}
Recommended style from designer: ${recommendation.styleId}
Palette: ${style.palette.join(', ')}
Medium: ${style.medium}
Subject bias: ${style.subjectBias.join(', ')}
Scene: ${chooseScene(post, style)}
Prompt spine: ${style.promptStyle}
Accent instruction: ${chooseAccent(style, post)}
Composition: horizontal editorial cover, decisive focal point, negative space, crisp silhouette, built for homepage card and article hero
Constraints: no text, no watermark, no UI screenshots, no chat bubbles, no logo lockups, no blue cyberpunk glow, avoid ${style.avoid.join(', ')}`;
}

const files = readdirSync(postsDir).filter((file) => file.endsWith('.md')).sort();
const sections = [];
const styleCounts = new Map(EDITORIAL_IMAGE_STYLE_ORDER.map((styleId) => [styleId, 0]));

for (const file of files) {
	const raw = readFileSync(join(postsDir, file), 'utf8');
	const frontmatter = parseFrontmatter(raw);
	if (!frontmatter) continue;
	if (!frontmatter.heroStyle || !EDITORIAL_IMAGE_STYLES[frontmatter.heroStyle]) continue;

	styleCounts.set(frontmatter.heroStyle, (styleCounts.get(frontmatter.heroStyle) ?? 0) + 1);

	sections.push(`## ${frontmatter.title}
- Слаг: \`${file.replace(/\.md$/, '')}\`
- Стиль: **${EDITORIAL_IMAGE_STYLES[frontmatter.heroStyle].label}**
- Визуальный режим: ${getVisualMode(frontmatter.heroStyle)}
- Источник: ${frontmatter.heroSource ?? inferHeroSource(frontmatter.heroImage)}
- Alt: ${frontmatter.heroAlt}

\`\`\`text
${buildPrompt(frontmatter)}
\`\`\`
`);
}

const summary = EDITORIAL_IMAGE_STYLE_ORDER.map((styleId) => {
	const style = EDITORIAL_IMAGE_STYLES[styleId];
	return `- **${style.label}**: ${styleCounts.get(styleId) ?? 0}`;
}).join('\n');

const output = `# SCQR Editorial Image Briefs

Автоматически собранные prompt-brief для генерации и отбора обложек по текущему архиву SCQR.

## Распределение стилей
${summary}

${sections.join('\n')}
`;

writeFileSync(outputPath, output, 'utf8');
console.log(`Generated ${sections.length} image briefs → docs/editorial-image-briefs.md`);
