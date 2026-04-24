import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_TITLE } from '../../../consts';
import { RUBRIC_CONFIG, getVisiblePosts, sortPosts } from '../../../lib/site';

export function getStaticPaths() {
	return RUBRIC_CONFIG.map((rubric) => ({
		params: { slug: rubric.slug },
		props: { rubric },
	}));
}

export async function GET(context) {
	const { rubric } = context.props;
	const allPosts = sortPosts(getVisiblePosts(await getCollection('posts')));
	const posts = allPosts.filter(
		(p) => p.data.rubrics.includes(rubric.slug) || p.data.rubricLabels.includes(rubric.label),
	);

	return rss({
		title: `${rubric.label} — ${SITE_TITLE}`,
		description: rubric.description,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/${post.id}/`,
		})),
	});
}
