#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
	EDITORIAL_IMAGE_STYLES,
	EDITORIAL_IMAGE_STYLE_ORDER,
} from '../src/data/editorial-image-styles.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const postsDir = join(__dir, '../src/content/posts');
const outputPath = join(__dir, '../docs/editorial-image-briefs.md');

function parseFrontmatter(content) {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
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
			try { obj[key] = JSON.parse(val.replace(/'/g, '"')); } catch { obj[key] = []; }
		} else if (!Number.isNaN(Number(val)) && val !== '') {
			obj[key] = Number(val);
		} else {
			obj[key] = val;
		}
	}

	return obj;
}

function chooseMetaphor(post) {
	const haystack = `${post.title} ${post.deck} ${(post.topics || []).join(' ')}`.toLowerCase();

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
	if (/(язык|миф|иллюз|теор|безопасност|институт|shutdown|control)/.test(haystack)) {
		return 'бумажный коллаж из фрагментов, где смысл собирается из слоёв, пустоты и мягких разрывов';
	}

	return 'один ясный абстрактный объект, который передаёт тезис статьи без буквальной иллюстрации';
}

function chooseAccent(styleId) {
	switch (styleId) {
		case 'signal_network':
			return 'один активный зелёный канал связи или узел';
		case 'industrial_plate':
			return 'одна зелёная силовая линия, индикатор нагрузки или активный контур';
		case 'threshold_space':
			return 'зелёный проход, свечение рамки или допуск через один контролируемый проём';
		case 'quiet_monument':
			return 'одна зелёная грань, световой разрез или весовой маркер';
		default:
			return 'один зелёный фрагмент, вырез или визуальный акцент в глубине композиции';
	}
}

function buildPrompt(post) {
	const style = EDITORIAL_IMAGE_STYLES[post.heroStyle];
	const metaphor = chooseMetaphor(post);
	const accent = chooseAccent(post.heroStyle);
	const rubric = Array.isArray(post.rubricLabels) && post.rubricLabels.length > 0
		? post.rubricLabels[0]
		: Array.isArray(post.rubrics) && post.rubrics.length > 0
			? post.rubrics[0]
			: 'SCQR';
	const topics = Array.isArray(post.topics) ? post.topics.join(', ') : '';

	return `Use case: stylized-concept
Asset type: editorial cover image for SCQR article
Primary request: create a premium editorial illustration for a Russian-language AI industry magazine
Scene/backdrop: calm paper-toned background with subtle print grain and soft studio depth
Style system: ${style.label}
Style family: ${style.promptStyle}
Article title: ${post.title}
Deck: ${post.deck}
SCQR verdict: ${post.scqrVerdict}
Rubric: ${rubric}
Topics: ${topics}
Central metaphor: ${metaphor}
Accent instruction: ${accent}
Composition/framing: horizontal composition, strong focal point, generous negative space, one main object and one secondary signal, clean silhouette, built for website card and article hero
Lighting/mood: soft directional light, controlled contrast, serious, intelligent, mature editorial mood
Color palette: warm paper, charcoal, graphite, muted olive, SCQR acid green as the only bright accent
Materials/textures: paper, brushed metal, smoked glass, matte plastic, faint ink and offset texture
Constraints: no text, no logos, no watermark, no readable interface, no literal chat bubbles, no robots, no blue neon cyberpunk, no visual clutter`;
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
- Короткое описание: ${EDITORIAL_IMAGE_STYLES[frontmatter.heroStyle].description}
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

Автоматически собранные prompt-brief для генерации обложек по текущему архиву SCQR.

## Распределение стилей
${summary}

${sections.join('\n')}
`;

writeFileSync(outputPath, output, 'utf8');
console.log(`Generated ${sections.length} image briefs → docs/editorial-image-briefs.md`);
