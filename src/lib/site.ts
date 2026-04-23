import type { CollectionEntry } from 'astro:content';

export type PostEntry = CollectionEntry<'posts'>;

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

export const buildRubricSummary = (posts: PostEntry[]) => {
	const map = new Map<string, number>();

	for (const post of posts) {
		for (const rubric of getDisplayRubrics(post)) {
			map.set(rubric, (map.get(rubric) ?? 0) + 1);
		}
	}

	return [...map.entries()]
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count);
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
