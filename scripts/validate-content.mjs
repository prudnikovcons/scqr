#!/usr/bin/env node
/**
 * Content validation: npm run validate
 * Checks all posts in src/content/posts against editorial rules.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import {
	clusterSpotlightBySlug,
	homepageEssays,
	homepageLead,
	homepageVisualGrid,
	premiumTrackPostIds,
	rubricLeadBySlug,
} from '../src/data/curation.shared.js';
import { EDITORIAL_IMAGE_STYLE_ORDER } from '../src/data/editorial-image-styles.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const postsDir = join(__dir, '../src/content/posts');

const VALID_RUBRIC_SLUGS = [
	'trajectories', 'generations', 'automations', 'innovations',
	'illusions', 'russia', 'regulations', 'theories', 'tendencies',
];

const VALID_ARTICLE_TYPES = ['news', 'analysis', 'column', 'illustration'];
const VALID_HERO_STYLES = new Set(EDITORIAL_IMAGE_STYLE_ORDER);
const RUBRIC_LABELS = {
	trajectories: 'Траектории',
	generations: 'Генерации',
	automations: 'Автоматизации',
	innovations: 'Новации',
	illusions: 'Иллюзии',
	russia: 'В России',
	regulations: 'Регуляции',
	theories: 'Теории',
	tendencies: 'Тенденции',
};

const POLITICAL_TITLE_KEYWORDS = [
	'белый дом',
	'пентагон',
	'украине',
	'киев',
	'война',
	'дипломатию',
	'санкцион',
	'нефти',
];

const POLITICAL_TOPIC_KEYWORDS = [
	'white house',
	'pentagon',
	'ukraine',
	'zelenskyy',
	'putin',
	'negotiations',
	'sanctions',
	'russian oil',
];

const CLUSTER_SLUGS = new Set([
	'frontier-compute-lock-in', 'anthropic-gosudarstvo-mythos', 'anthropic-control-boundaries',
	'evropa-ai-capex-rally', 'evropa-ai-infra-gap', 'ormuz-makroshok',
	'poluprovodniki-ai-bottleneck', 'tesla-ai-capex', 'protokoly-agentnoy-infrastruktury',
	'globalnaya-fragmentatsiya-regulation', 'backfill-energy-basement', 'backfill-corporate-agents',
	'backfill-frontier-access', 'backfill-governance-layers', 'backfill-protocol-security',
	'prikladnoy-sloy-ii', 'wave-1-adult-language', 'wave-1-compute-shortage',
	'wave-1-infrastructure-race', 'wave-1-russia-market', 'wave-1-regulation-regime',
	'wave-1-agent-protocol-risk', 'vyklyuchenie-sverhsistem', 'rynok-truda-i-ii',
	'wave-1-agent-myth', 'rynok-genai-rossii', 'suverennyi-ii-v-rf', 'wave-1-value-pools',
	'next-openai-flagship', 'wave-1-enterprise-revenue', 'operatsionnaya-bezopasnost-laboratoriy',
	'samoizmenyayushchiesya-agenty', 'wave-1-corporate-agents', 'krizis-ai-safety',
	'cyber-trusted-access', 'ormuz-sanktsionnyy-predel', 'agentnye-platformy-kitaya',
	'aziatskiy-tsentr-ii', 'ekonomika-frontier-laboratorii', 'avstraliya-ai-infrastruktura',
	'finansirovanie-ukrainy-2026', 'diplomatiya-ukrainy-2026',
	'wave-1-boring-companies', 'wave-1-access-regime',
]);

const PREMIUM_SLOT_IDS = new Set([
	homepageLead,
	...homepageVisualGrid,
	...homepageEssays,
	...Object.values(rubricLeadBySlug),
	...Object.values(clusterSpotlightBySlug),
	...premiumTrackPostIds,
].filter(Boolean));

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
		} else if (val === 'true') {
			obj[key] = true;
		} else if (val === 'false') {
			obj[key] = false;
		} else if (!isNaN(Number(val)) && val !== '') {
			obj[key] = Number(val);
		} else {
			obj[key] = val;
		}
	}
	return obj;
}

function countWords(content) {
	const body = content.replace(/^---[\s\S]*?---\n/, '');
	return body.trim().split(/\s+/).filter(Boolean).length;
}

function getBody(content) {
	return content.replace(/^---[\s\S]*?---\n/, '').trim();
}

function resolveHeroPath(file, heroImage) {
	if (!heroImage || typeof heroImage !== 'string') return null;
	if (/^https?:\/\//.test(heroImage)) return heroImage;
	return resolve(dirname(join(postsDir, file)), heroImage);
}

function isPremiumHero(heroImage) {
	return typeof heroImage === 'string' && heroImage !== '' && !heroImage.includes('secondary-') && !heroImage.includes('blog-placeholder');
}

const files = readdirSync(postsDir).filter((f) => f.endsWith('.md'));
const errors = [];
const warnings = [];

for (const file of files) {
	const content = readFileSync(join(postsDir, file), 'utf8');
	const fm = parseFrontmatter(content);
	if (!fm) {
		errors.push(`${file}: Cannot parse frontmatter`);
		continue;
	}

	const ctx = `${file}`;
	const postId = file.replace(/\.md$/, '');
	const editorialFlags = Array.isArray(fm.editorialFlags) ? fm.editorialFlags : [];
	const publishReady = fm.status === 'ready';
	const legacyPublished = fm.status === 'approved';
	const premiumSlotCandidate = PREMIUM_SLOT_IDS.has(postId);

	if (!fm.title || !fm.title.trim()) {
		errors.push(`${ctx}: title is empty`);
	}

	if (!fm.description || !fm.description.trim()) {
		errors.push(`${ctx}: description is empty`);
	} else if (fm.description === fm.title) {
		errors.push(`${ctx}: description duplicates title`);
	}

	if (!fm.deck || !String(fm.deck).trim()) {
		errors.push(`${ctx}: deck is empty`);
	} else if (String(fm.deck).trim() === String(fm.title).trim()) {
		errors.push(`${ctx}: deck duplicates title`);
	}

	if (!fm.heroStyle || !VALID_HERO_STYLES.has(String(fm.heroStyle))) {
		errors.push(`${ctx}: heroStyle "${fm.heroStyle}" is not valid`);
	}

	if (!fm.pubDate) {
		errors.push(`${ctx}: pubDate is missing`);
	}

	if (!VALID_ARTICLE_TYPES.includes(fm.articleType)) {
		errors.push(`${ctx}: articleType "${fm.articleType}" is not valid (${VALID_ARTICLE_TYPES.join('|')})`);
	}

	if (Array.isArray(fm.rubrics) && fm.rubrics.length > 0) {
		for (const rubric of fm.rubrics) {
			if (!VALID_RUBRIC_SLUGS.includes(rubric)) {
				errors.push(`${ctx}: rubric slug "${rubric}" not in RUBRIC_CONFIG`);
			}
		}
	} else if (!Array.isArray(fm.rubricLabels) || fm.rubricLabels.length === 0) {
		warnings.push(`${ctx}: no rubrics or rubricLabels set`);
	}

	if (Array.isArray(fm.rubrics) && Array.isArray(fm.rubricLabels) && fm.rubrics.length > 0 && fm.rubricLabels.length > 0) {
		for (let i = 0; i < Math.min(fm.rubrics.length, fm.rubricLabels.length); i += 1) {
			const slug = fm.rubrics[i];
			const expectedLabel = RUBRIC_LABELS[slug];
			const actualLabel = fm.rubricLabels[i];
			if (expectedLabel && actualLabel && expectedLabel !== actualLabel) {
				errors.push(`${ctx}: rubric label "${actualLabel}" does not match slug "${slug}" (expected "${expectedLabel}")`);
			}
		}
	}

	if (fm.storyCluster && !CLUSTER_SLUGS.has(fm.storyCluster)) {
		warnings.push(`${ctx}: storyCluster "${fm.storyCluster}" not in CLUSTER_CONFIG (add it to site.ts)`);
	}

	if (publishReady || legacyPublished) {
		if (!fm.sourceNote || !String(fm.sourceNote).trim()) {
			errors.push(`${ctx}: published material requires a non-empty sourceNote`);
		}
		if (!Array.isArray(fm.topics) || fm.topics.length === 0) {
			errors.push(`${ctx}: published material requires at least one topic`);
		}
		if (typeof fm.readingTime !== 'number' || fm.readingTime < 1) {
			errors.push(`${ctx}: published material requires a valid readingTime`);
		}
		if (!fm.heroImage || !String(fm.heroImage).trim()) {
			errors.push(`${ctx}: published material requires heroImage`);
		}
		if (!fm.heroAlt || !String(fm.heroAlt).trim()) {
			errors.push(`${ctx}: published material requires heroAlt`);
		}
		if (!fm.heroStyle || !VALID_HERO_STYLES.has(String(fm.heroStyle))) {
			errors.push(`${ctx}: published material requires valid heroStyle`);
		}
		if (!fm.deck || !String(fm.deck).trim()) {
			errors.push(`${ctx}: published material requires deck`);
		}
	}

	if (fm.heroImage) {
		const resolvedHero = resolveHeroPath(file, fm.heroImage);
		if (resolvedHero && !/^https?:\/\//.test(resolvedHero) && !existsSync(resolvedHero)) {
			errors.push(`${ctx}: heroImage path does not exist (${fm.heroImage})`);
		}
	}

	if (premiumSlotCandidate) {
		if (!publishReady) {
			errors.push(`${ctx}: premium-slot candidate must have status "ready"`);
		}
		if (!fm.scqrVerdict || !String(fm.scqrVerdict).trim()) {
			errors.push(`${ctx}: premium-slot candidate requires scqrVerdict`);
		}
		if (!isPremiumHero(String(fm.heroImage ?? ''))) {
			errors.push(`${ctx}: premium-slot candidate must use a premium heroImage, not a secondary or placeholder cover`);
		}
	}

	if (legacyPublished) {
		warnings.push(`${ctx}: legacy status "approved" detected; migrate to "ready" when the file is next updated`);
	}

	if (fm.articleType === 'news') {
		const title = String(fm.title || '').toLowerCase();
		const topics = Array.isArray(fm.topics) ? fm.topics.map((topic) => String(topic).toLowerCase()) : [];
		const looksPolitical = (
			POLITICAL_TITLE_KEYWORDS.some((keyword) => title.includes(keyword)) ||
			topics.some((topic) => POLITICAL_TOPIC_KEYWORDS.some((keyword) => topic.includes(keyword)))
		);
		if (!editorialFlags.includes('archive-noise') && looksPolitical) {
			warnings.push(`${ctx}: looks like a political news item and may be filtered from the public site`);
		}
	}

	if (Array.isArray(fm.topics)) {
		const normalizedTopics = fm.topics.map((topic) => String(topic).trim()).filter(Boolean);
		const uniqueTopics = new Set(normalizedTopics.map((topic) => topic.toLowerCase()));
		if (uniqueTopics.size !== normalizedTopics.length) {
			warnings.push(`${ctx}: topics contain duplicates`);
		}
		if ((publishReady || legacyPublished) && normalizedTopics.some((topic) => topic.length < 2)) {
			warnings.push(`${ctx}: topics contain very short labels`);
		}
	}

	if (fm.sourceNote) {
		const sourceNote = String(fm.sourceNote).trim();
		if ((publishReady || legacyPublished) && sourceNote.length < 20) {
			warnings.push(`${ctx}: sourceNote is too short for a published material`);
		}
		if (sourceNote === String(fm.title).trim() || sourceNote === String(fm.description).trim()) {
			warnings.push(`${ctx}: sourceNote duplicates headline or description`);
		}
	}

	if (fm.articleType === 'analysis') {
		if (!fm.description || String(fm.description).length < 140) {
			warnings.push(`${ctx}: analysis description is shorter than 140 chars (${fm.description?.length ?? 0})`);
		}
		const words = countWords(content);
		if (words < 200) {
			warnings.push(`${ctx}: analysis has only ${words} words (expected ≥ 200)`);
		}
	}

	if (fm.readingTime !== undefined) {
		const words = countWords(content);
		const expected = Math.max(1, Math.round(words / 200));
		if (Math.abs(expected - fm.readingTime) > 2) {
			warnings.push(`${ctx}: readingTime=${fm.readingTime} but word count suggests ~${expected} min`);
		}
	}

	const body = getBody(content);
	if (!body) {
		warnings.push(`${ctx}: body is empty`);
	}
}

if (errors.length === 0 && warnings.length === 0) {
	console.log(`✓ All ${files.length} posts valid.`);
	process.exit(0);
}

if (warnings.length > 0) {
	console.log(`\nWarnings (${warnings.length}):`);
	for (const warning of warnings) console.log(`  ⚠  ${warning}`);
}

if (errors.length > 0) {
	console.log(`\nErrors (${errors.length}):`);
	for (const error of errors) console.log(`  ✗  ${error}`);
	process.exit(1);
}

process.exit(0);
