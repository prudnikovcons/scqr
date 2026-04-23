import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getVisiblePosts } from '../lib/site';

export async function GET(context) {
	const posts = getVisiblePosts(await getCollection('posts'));
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/${post.id}/`,
		})),
	});
}
