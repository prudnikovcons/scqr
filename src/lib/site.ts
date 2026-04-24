import type { CollectionEntry } from 'astro:content';

export type PostEntry = CollectionEntry<'posts'>;

const politicalNewsKeywords = [
	'white house',
	'pentagon',
	'ukraine',
	'zelenskyy',
	'putin',
	'negotiations',
	'european union',
	'viktor orban',
	'sanctions',
	'russian oil',
	'loan',
	'druzhba pipeline',
];

const politicalNewsTitleKeywords = [
	'белый дом',
	'пентагон',
	'украине',
	'киев',
	'война',
	'дипломатию',
	'санкцион',
	'нефти',
];

export const isPoliticalNews = (post: PostEntry) => {
	if (post.data.articleType !== 'news') {
		return false;
	}

	const title = post.data.title.toLowerCase();
	const topics = post.data.topics.map((topic) => topic.toLowerCase());

	return (
		politicalNewsTitleKeywords.some((keyword) => title.includes(keyword)) ||
		topics.some((topic) => politicalNewsKeywords.some((keyword) => topic.includes(keyword)))
	);
};

export const getVisiblePosts = (posts: PostEntry[]) => posts.filter((post) => !isPoliticalNews(post));

export const sortPosts = (posts: PostEntry[]) =>
	[...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

export const getDisplayRubrics = (post: PostEntry) =>
	post.data.rubricLabels.length > 0 ? post.data.rubricLabels : post.data.rubrics;

export const getPrimaryRubric = (post: PostEntry) => getDisplayRubrics(post)[0] ?? 'SCQR';

export const getPostHref = (post: PostEntry) => `/${post.id}/`;

export const getReadingTimeLabel = (post: PostEntry) => `${post.data.readingTime ?? 1} мин`;

export const getArticleTypeLabelFromValue = (articleType: string) => {
	const labels: Record<string, string> = {
		news: 'новость',
		analysis: 'аналитика',
		column: 'колонка',
		illustration: 'иллюстрация',
	};

	return labels[articleType] ?? articleType;
};

export const getArticleTypeLabel = (post: PostEntry) => getArticleTypeLabelFromValue(post.data.articleType);

export const getToneClass = (index: number) => {
	const tones = ['warm', 'graph', 'paper', 'dark'];
	return tones[index % tones.length];
};

export const getRubricSlugFromLabel = (label: string) =>
	RUBRIC_CONFIG.find((r) => r.label === label)?.slug ?? null;

export const buildRubricSummary = (posts: PostEntry[]) => {
	const map = new Map<string, number>();

	for (const post of posts) {
		for (const rubric of getDisplayRubrics(post)) {
			map.set(rubric, (map.get(rubric) ?? 0) + 1);
		}
	}

	return [...map.entries()]
		.map(([name, count]) => ({
			name,
			count,
			slug: getRubricSlugFromLabel(name),
		}))
		.sort((a, b) => b.count - a.count);
};

export interface RubricConfig {
	slug: string;
	label: string;
	description: string;
	tone: 'warm' | 'graph' | 'paper' | 'dark';
}

export const RUBRIC_CONFIG: RubricConfig[] = [
	{ slug: 'trajectories', label: 'Траектории', description: 'Долгосрочные тренды, стратегические сдвиги и сценарии развития рынка ИИ.', tone: 'dark' },
	{ slug: 'generations', label: 'Генерации', description: 'Фронтирные модели, их возможности, ограничения и гонка лабораторий.', tone: 'graph' },
	{ slug: 'automations', label: 'Автоматизации', description: 'Агенты, инструменты и последствия автоматизации для рынка труда.', tone: 'warm' },
	{ slug: 'innovations', label: 'Новации', description: 'Технологические прорывы, инфраструктура и цепочки поставок вычислений.', tone: 'paper' },
	{ slug: 'illusions', label: 'Иллюзии', description: 'Хайп, завышенные ожидания, риски и провалы в мире ИИ.', tone: 'dark' },
	{ slug: 'russia', label: 'В России', description: 'Отечественный рынок ИИ, регулирование и корпоративные стратегии.', tone: 'warm' },
	{ slug: 'regulations', label: 'Регуляции', description: 'Законодательство, политика и регуляторные инициативы в области ИИ.', tone: 'paper' },
	{ slug: 'theories', label: 'Теории', description: 'Исследования, концепции и аргументы о природе и будущем ИИ.', tone: 'graph' },
	{ slug: 'tendencies', label: 'Тенденции', description: 'Рыночная динамика, инвестиции и структурные сдвиги в отрасли.', tone: 'warm' },
];

export const getRubricConfig = (slug: string) => RUBRIC_CONFIG.find((r) => r.slug === slug);

export const getRubricHref = (slug: string) => `/rubric/${slug}/`;

export const buildTimeline = (posts: PostEntry[], maxDays = 7) => {
	const grouped = new Map<string, PostEntry[]>();

	for (const post of posts) {
		const dayKey = post.data.pubDate.toISOString().slice(0, 10);
		if (!grouped.has(dayKey)) {
			grouped.set(dayKey, []);
		}
		grouped.get(dayKey)?.push(post);
	}

	return [...grouped.entries()]
		.slice(0, maxDays)
		.map(([dayKey, dayPosts]) => ({
			dayKey,
			date: dayPosts[0].data.pubDate,
			entries: dayPosts.slice(0, 2),
		}));
};
