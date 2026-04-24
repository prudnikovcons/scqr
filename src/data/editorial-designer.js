import {
	EDITORIAL_IMAGE_STYLES,
	HERO_SOURCE_OPTIONS,
	isLegacyEditorialImageStyle,
} from './editorial-image-styles.js';

const KEYWORD_GROUPS = {
	scientific_lucid: [
		'alphafold',
		'protein',
		'белок',
		'биолог',
		'молекул',
		'pharma',
		'drug',
		'науч',
		'исследован',
	],
	human_collage: [
		'critic',
		'критик',
		'язык',
		'культура',
		'память пользователя',
		'общество',
		'труд',
		'ошибк',
		'интерпретац',
	],
	civic_blueprint: [
		'государ',
		'gov',
		'регулир',
		'кодекс',
		'министер',
		'агентств',
		'архив',
		'compliance',
		'допуск',
	],
	editorial_still_life: [
		'память',
		'логика',
		'чип',
		'ускорител',
		'compute',
		'вычисл',
		'quality',
		'quality-control',
		'criticgpt',
		'релиз',
		'launch',
	],
	documentary_frame: [
		'команд',
		'рабоч',
		'рынок',
		'производств',
		'строительств',
		'дата-центр',
		'инфраструктур',
		'город',
		'поле',
	],
};

const DEFAULT_STYLE_MATRIX = {
	trajectories: {
		news: 'editorial_still_life',
		analysis: 'editorial_still_life',
		column: 'documentary_frame',
	},
	generations: {
		news: 'scientific_lucid',
		analysis: 'human_collage',
		column: 'human_collage',
	},
	automations: {
		news: 'documentary_frame',
		analysis: 'documentary_frame',
		column: 'civic_blueprint',
	},
	innovations: {
		news: 'scientific_lucid',
		analysis: 'editorial_still_life',
		column: 'documentary_frame',
	},
	illusions: {
		news: 'human_collage',
		analysis: 'human_collage',
		column: 'human_collage',
	},
	russia: {
		news: 'civic_blueprint',
		analysis: 'documentary_frame',
		column: 'documentary_frame',
	},
	regulations: {
		news: 'civic_blueprint',
		analysis: 'civic_blueprint',
		column: 'civic_blueprint',
	},
	theories: {
		news: 'scientific_lucid',
		analysis: 'human_collage',
		column: 'human_collage',
	},
	tendencies: {
		news: 'documentary_frame',
		analysis: 'documentary_frame',
		column: 'editorial_still_life',
	},
};

const LEGACY_FALLBACKS = {
	editorial_collage: 'human_collage',
	signal_network: 'documentary_frame',
	industrial_plate: 'editorial_still_life',
	threshold_space: 'civic_blueprint',
	quiet_monument: 'editorial_still_life',
};

const DEFAULT_HERO_SOURCE_BY_STYLE = {
	documentary_frame: 'user-supplied',
	scientific_lucid: 'generated',
	human_collage: 'generated',
	civic_blueprint: 'generated',
	editorial_still_life: 'generated',
	editorial_collage: 'generated',
	signal_network: 'generated',
	industrial_plate: 'generated',
	threshold_space: 'generated',
	quiet_monument: 'generated',
};

const VISUAL_SIMILARITY_GROUPS = {
	documentary_frame: 'human-scale',
	scientific_lucid: 'scientific',
	human_collage: 'human-scale',
	civic_blueprint: 'institutional',
	editorial_still_life: 'object',
	editorial_collage: 'paper',
	signal_network: 'diagram',
	industrial_plate: 'object',
	threshold_space: 'institutional',
	quiet_monument: 'object',
};

export const getVisualMode = (styleId) =>
	EDITORIAL_IMAGE_STYLES[styleId]?.visualMode ?? 'unknown';

export const getVisualSimilarityGroup = (styleId) =>
	VISUAL_SIMILARITY_GROUPS[styleId] ?? getVisualMode(styleId);

export const inferHeroSource = (heroImagePath = '') => {
	if (typeof heroImagePath !== 'string' || heroImagePath.trim() === '') {
		return 'generated';
	}

	const normalized = heroImagePath.toLowerCase();
	if (normalized.includes('/contributed/') || normalized.includes('\\contributed\\')) {
		return 'user-supplied';
	}
	if (normalized.includes('/incoming/') || normalized.includes('\\incoming\\')) {
		return 'user-supplied';
	}
	if (normalized.includes('/graphics/') || normalized.includes('\\graphics\\')) {
		return 'diagram';
	}
	return 'generated';
};

export const isMeaningfulHeroAlt = (heroAlt = '', title = '') => {
	const trimmed = String(heroAlt).trim();
	if (!trimmed) return false;
	const genericAlt = `Редакционная обложка SCQR к материалу «${title}».`;
	return trimmed !== genericAlt;
};

const normalizeTopics = (topics = []) =>
	(Array.isArray(topics) ? topics : [])
		.map((topic) => String(topic).toLowerCase())
		.join(' ');

const scoreKeywordStyle = (styleId, haystack) =>
	(KEYWORD_GROUPS[styleId] ?? []).reduce(
		(score, keyword) => score + (haystack.includes(keyword) ? 2 : 0),
		0,
	);

const buildCandidateStyles = ({ rubricSlug, articleType = 'news', title = '', deck = '', topics = [] }) => {
	const rubricDefaults = DEFAULT_STYLE_MATRIX[rubricSlug] ?? DEFAULT_STYLE_MATRIX.tendencies;
	const base = rubricDefaults[articleType] ?? rubricDefaults.news ?? 'editorial_still_life';
	const haystack = `${String(title).toLowerCase()} ${String(deck).toLowerCase()} ${normalizeTopics(topics)}`;

	const scored = Object.keys(EDITORIAL_IMAGE_STYLES)
		.filter((styleId) => !isLegacyEditorialImageStyle(styleId))
		.map((styleId) => ({
			styleId,
			score: scoreKeywordStyle(styleId, haystack) + (styleId === base ? 3 : 0),
		}))
		.sort((a, b) => b.score - a.score)
		.map(({ styleId }) => styleId);

	return [base, ...scored].filter((styleId, index, array) => array.indexOf(styleId) === index);
};

const avoidFrontlineRepetition = (styleIds = [], candidateStyleId) => {
	const currentGroups = styleIds.map(getVisualSimilarityGroup);
	const candidateGroup = getVisualSimilarityGroup(candidateStyleId);
	const run = [...currentGroups, candidateGroup]
		.slice(-3)
		.filter((group) => group === candidateGroup).length;
	return run < 3;
};

export const countDistinctVisualModes = (styleIds = []) =>
	new Set(styleIds.map(getVisualMode).filter(Boolean)).size;

export const hasRepeatingVisualRun = (styleIds = [], runLength = 3) => {
	let current = 0;
	let previous = null;

	for (const styleId of styleIds) {
		const group = getVisualSimilarityGroup(styleId);
		if (group === previous) {
			current += 1;
		} else {
			current = 1;
			previous = group;
		}

		if (current >= runLength) {
			return true;
		}
	}

	return false;
};

export const recommendHeroStrategy = ({
	rubricSlug,
	articleType = 'news',
	title = '',
	deck = '',
	topics = [],
	hasUserImage = false,
	currentSurfaceStyles = [],
}) => {
	const candidates = buildCandidateStyles({ rubricSlug, articleType, title, deck, topics });
	const styleId =
		candidates.find((candidate) => avoidFrontlineRepetition(currentSurfaceStyles, candidate)) ??
		candidates[0] ??
		'editorial_still_life';
	const style = EDITORIAL_IMAGE_STYLES[styleId];
	const heroSource = hasUserImage
		? 'user-supplied'
		: DEFAULT_HERO_SOURCE_BY_STYLE[styleId] ?? 'generated';

	return {
		styleId,
		heroSource,
		palette: style?.palette ?? [],
		visualMode: getVisualMode(styleId),
		rationale: `${style?.label ?? styleId}: ${style?.description ?? ''}`.trim(),
	};
};

export const migrateLegacyStyle = (styleId) =>
	LEGACY_FALLBACKS[styleId] ?? styleId;

export const isValidHeroSource = (heroSource) =>
	HERO_SOURCE_OPTIONS.includes(heroSource);

