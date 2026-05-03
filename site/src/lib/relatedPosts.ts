import type { CollectionEntry } from 'astro:content';

type PostEntry = CollectionEntry<'posts'>;

/**
 * Подбор похожих материалов по пересечению rubrics и topics.
 *
 * Веса:
 * - совпадение по storyCluster — самый сильный сигнал (×4)
 * - совпадение рубрики — ×2
 * - совпадение топика — ×1
 *
 * При равном score предпочитаем более свежий материал. Если ни один пост
 * из всего корпуса не пересекается с текущим (score 0 у всех) — отдаём
 * пустой массив; вызывающий код решит, скрывать блок или показывать
 * fallback. Сам пост в выдачу не попадает.
 */
export function getRelatedPosts(
	current: PostEntry,
	allPosts: PostEntry[],
	limit = 3,
): PostEntry[] {
	const currentRubrics = new Set(current.data.rubrics ?? []);
	const currentTopics = new Set(
		(current.data.topics ?? []).map((t) => t.toLowerCase()),
	);
	const currentCluster = current.data.storyCluster;

	const scored: { post: PostEntry; score: number }[] = [];
	for (const post of allPosts) {
		if (post.id === current.id) continue;
		let score = 0;
		if (currentCluster && post.data.storyCluster === currentCluster) {
			score += 4;
		}
		for (const rubric of post.data.rubrics ?? []) {
			if (currentRubrics.has(rubric)) score += 2;
		}
		for (const topic of post.data.topics ?? []) {
			if (currentTopics.has(topic.toLowerCase())) score += 1;
		}
		if (score > 0) {
			scored.push({ post, score });
		}
	}

	scored.sort((a, b) => {
		if (b.score !== a.score) return b.score - a.score;
		return b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf();
	});

	return scored.slice(0, limit).map((entry) => entry.post);
}
