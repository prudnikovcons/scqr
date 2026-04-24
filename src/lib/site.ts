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

export const isArchiveNoise = (post: PostEntry) =>
	post.data.editorialFlags?.includes('archive-noise') ?? false;

export const getVisiblePosts = (posts: PostEntry[]) =>
	posts.filter((post) => !isPoliticalNews(post) && !isArchiveNoise(post));

export const sortPosts = (posts: PostEntry[]) =>
	[...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

export const hasHeroImage = (post: PostEntry) => Boolean(post.data.heroImage?.src);

export const getHeroSrc = (post: PostEntry) => post.data.heroImage?.src ?? '';

export const hasSecondaryHero = (post: PostEntry) => getHeroSrc(post).includes('secondary-');

export const hasPremiumHero = (post: PostEntry) => {
	const src = getHeroSrc(post);
	return Boolean(src) && !src.includes('secondary-') && !src.includes('blog-placeholder');
};

export const getPresentationScore = (post: PostEntry) => {
	const statusScore = post.data.status === 'ready' ? 100 : post.data.status === 'approved' ? 70 : 0;
	const premiumScore = hasPremiumHero(post) ? 40 : 0;
	const secondaryScore = hasSecondaryHero(post) ? 20 : 0;
	const heroScore = hasHeroImage(post) ? 10 : 0;
	return statusScore + premiumScore + secondaryScore + heroScore;
};

export const sortPostsForPresentation = (posts: PostEntry[]) =>
	[...posts].sort((a, b) => {
		const scoreDiff = getPresentationScore(b) - getPresentationScore(a);
		if (scoreDiff !== 0) return scoreDiff;
		return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
	});

export const getFeaturePosts = (posts: PostEntry[], count: number) =>
	sortPostsForPresentation(posts.filter((post) => !isArchiveNoise(post))).slice(0, count);

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
	{ slug: 'innovations', label: 'Новации', description: 'Новые компании, запуски, продуктовые анонсы, свежие модели и заметные технологические релизы.', tone: 'paper' },
	{ slug: 'illusions', label: 'Иллюзии', description: 'Хайп, завышенные ожидания, риски и провалы в мире ИИ.', tone: 'dark' },
	{ slug: 'russia', label: 'В России', description: 'Отечественный рынок ИИ, регулирование и корпоративные стратегии.', tone: 'warm' },
	{ slug: 'regulations', label: 'Регуляции', description: 'Законодательство, политика и регуляторные инициативы в области ИИ.', tone: 'paper' },
	{ slug: 'theories', label: 'Теории', description: 'Исследования, концепции и аргументы о природе и будущем ИИ.', tone: 'graph' },
	{ slug: 'tendencies', label: 'Тенденции', description: 'Рыночная динамика, инвестиции и структурные сдвиги в отрасли.', tone: 'warm' },
];

export const getRubricConfig = (slug: string) => RUBRIC_CONFIG.find((r) => r.slug === slug);

export const getRubricHref = (slug: string) => `/rubric/${slug}/`;

export interface ClusterConfig {
	slug: string;
	title: string;
	description?: string;
}

export const CLUSTER_CONFIG: ClusterConfig[] = [
	{ slug: 'frontier-compute-lock-in', title: 'Фронтирные вычисления и lock-in', description: 'Как крупнейшие лаборатории привязываются к конкретным облакам и какие следствия это несёт для рынка.' },
	{ slug: 'anthropic-gosudarstvo-mythos', title: 'Anthropic, государство и Mythos', description: 'Путь Anthropic к статусу системного поставщика для правительства США.' },
	{ slug: 'anthropic-control-boundaries', title: 'Anthropic: границы контроля', description: 'Где проходит черта между обязательствами лаборатории и требованиями заказчика.' },
	{ slug: 'evropa-ai-capex-rally', title: 'Европа и AI-capex ралли', description: 'Почему европейский рынок начал закладывать инфраструктуру ИИ в цену раньше, чем она построена.' },
	{ slug: 'evropa-ai-infra-gap', title: 'Европа: инфраструктурный разрыв', description: 'Инфраструктурная слабость Европы в AI-гонке на примере ключевых игроков.' },
	{ slug: 'ormuz-makroshok', title: 'Ормузский макрошок', description: 'Как Ормузский пролив снова стал осью мировой экономики.' },
	{ slug: 'poluprovodniki-ai-bottleneck', title: 'Полупроводники как узкое место AI', description: 'Кто реально зарабатывает на AI-буме в цепочке поставок.' },
	{ slug: 'tesla-ai-capex', title: 'Tesla: ставка на AI', description: 'Как рынок оценивает AI-стратегию Tesla — не как машины, а как риск.' },
	{ slug: 'protokoly-agentnoy-infrastruktury', title: 'Протоколы агентной инфраструктуры', description: 'Стандартизация взаимодействия агентов и её риски.' },
	{ slug: 'globalnaya-fragmentatsiya-regulation', title: 'Фрагментация регулирования ИИ', description: 'Три мира регулирования ИИ и что это означает для компаний.' },
	{ slug: 'backfill-energy-basement', title: 'Нижние этажи ИИ', description: 'Энергия, стройка, облака и вычисления как новый базовый слой рынка.' },
	{ slug: 'backfill-corporate-agents', title: 'Корпоративные агенты', description: 'Как агенты переходят из пилота в рабочий контур компаний.' },
	{ slug: 'backfill-frontier-access', title: 'Фронтир и режим доступа', description: 'Капитал, облака и договоры как новая цена доступа к сильнейшим моделям.' },
	{ slug: 'backfill-governance-layers', title: 'Слои управления фронтиром', description: 'Как рынок строит вокруг сильных моделей язык институтов, комплаенса и допуска.' },
	{ slug: 'backfill-protocol-security', title: 'Безопасность агентного протокола', description: 'Где стандарт связи агентов сталкивается с реальностью доверия и защиты.' },
];

export const getClusterConfig = (slug: string) => CLUSTER_CONFIG.find((c) => c.slug === slug);

export const getClusterTitle = (slug: string) => getClusterConfig(slug)?.title ?? slug;

export const getClusterHref = (slug: string) => `/cluster/${slug}/`;

export const getClusterPosts = (posts: PostEntry[], slug: string) =>
	sortPosts(posts.filter((p) => p.data.storyCluster === slug)).reverse();

export const buildClusterSummary = (posts: PostEntry[]) => {
	const map = new Map<string, PostEntry[]>();
	for (const post of posts) {
		const slug = post.data.storyCluster;
		if (!slug) continue;
		if (!map.has(slug)) map.set(slug, []);
		map.get(slug)!.push(post);
	}
	return [...map.entries()]
		.filter(([, list]) => list.length >= 2)
		.map(([slug, list]) => ({
			slug,
			title: getClusterTitle(slug),
			count: list.length,
			latest: sortPosts(list)[0],
		}))
		.sort((a, b) => b.latest.data.pubDate.valueOf() - a.latest.data.pubDate.valueOf());
};

export const slugifyTopic = (topic: string) =>
	topic
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9а-яё\s-]/gi, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');

export const getTopicHref = (topic: string) => `/topic/${slugifyTopic(topic)}/`;

export const getTopicPosts = (posts: PostEntry[], slug: string) =>
	posts.filter((p) => p.data.topics.some((t) => slugifyTopic(t) === slug));

export const buildTopicIndex = (posts: PostEntry[]) => {
	const map = new Map<string, { label: string; posts: PostEntry[] }>();
	for (const post of posts) {
		for (const topic of post.data.topics) {
			const slug = slugifyTopic(topic);
			if (!slug) continue;
			if (!map.has(slug)) map.set(slug, { label: topic, posts: [] });
			map.get(slug)!.posts.push(post);
		}
	}
	return map;
};

export const getRelatedPosts = (posts: PostEntry[], post: PostEntry, limit = 4) => {
	const others = posts.filter((p) => p.id !== post.id);
	const sameCluster = post.data.storyCluster
		? others.filter((p) => p.data.storyCluster === post.data.storyCluster)
		: [];
	const sameRubric = others.filter(
		(p) =>
			!sameCluster.includes(p) &&
			p.data.rubrics.some((r) => post.data.rubrics.includes(r)),
	);
	return sortPostsForPresentation([...sameCluster, ...sameRubric]).slice(0, limit);
};

export const getAdjacentPosts = (posts: PostEntry[], post: PostEntry) => {
	const cluster = post.data.storyCluster;
	const pool = sortPosts(
		cluster && posts.some((p) => p.id !== post.id && p.data.storyCluster === cluster)
			? posts.filter((p) => p.data.storyCluster === cluster)
			: posts.filter((p) => p.data.rubrics.some((r) => post.data.rubrics.includes(r))),
	);
	const idx = pool.findIndex((p) => p.id === post.id);
	if (idx === -1) return { prev: null, next: null, scope: null };
	return {
		prev: idx < pool.length - 1 ? pool[idx + 1] : null,
		next: idx > 0 ? pool[idx - 1] : null,
		scope: cluster && pool.length > 1 && pool[0].data.storyCluster === cluster ? 'cluster' : 'rubric',
	} as { prev: PostEntry | null; next: PostEntry | null; scope: 'cluster' | 'rubric' | null };
};

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
