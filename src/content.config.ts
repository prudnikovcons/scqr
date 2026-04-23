import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			articleType: z.string(),
			stage: z.string().optional(),
			status: z.string().optional(),
			rubrics: z.array(z.string()).default([]),
			rubricLabels: z.array(z.string()).default([]),
			topics: z.array(z.string()).default([]),
			storyCluster: z.string().optional(),
			sourceNote: z.string().optional(),
			readingTime: z.number().optional(),
			publicUrl: z.string().optional(),
			heroImage: z.optional(image()),
		}),
});

export const collections = { posts };
