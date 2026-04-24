import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
	EDITORIAL_IMAGE_STYLE_ORDER,
	HERO_SOURCE_OPTIONS,
} from './data/editorial-image-styles.js';

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			deck: z.string(),
			scqrVerdict: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			articleType: z.enum(['news', 'analysis', 'column', 'illustration']),
			stage: z.string().optional(),
			status: z.enum(['draft', 'ready', 'approved']).optional(),
			rubrics: z.array(z.string()).default([]),
			rubricLabels: z.array(z.string()).default([]),
			topics: z.array(z.string()).default([]),
			editorialFlags: z.array(z.string()).default([]),
			storyCluster: z.string().optional(),
			sourceNote: z.string().optional(),
			readingTime: z.number().optional(),
			publicUrl: z.string().optional(),
			heroAlt: z.string(),
			heroStyle: z.enum(EDITORIAL_IMAGE_STYLE_ORDER as [string, ...string[]]),
			heroSource: z.enum(HERO_SOURCE_OPTIONS as [string, ...string[]]).optional(),
			heroImage: z.optional(image()),
		}),
});

export const collections = { posts };
