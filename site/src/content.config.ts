import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
	EDITORIAL_IMAGE_STYLE_ORDER,
	HERO_SOURCE_OPTIONS,
} from './data/editorial-image-styles.js';

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
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
			tgTeaser: z.string().optional(),
			readingTime: z.number().optional(),
			publicUrl: z.string().optional(),
			heroAlt: z.string(),
			heroStyle: z.enum(EDITORIAL_IMAGE_STYLE_ORDER as [string, ...string[]]),
			heroSource: z.enum(HERO_SOURCE_OPTIONS as [string, ...string[]]).optional(),
			heroImage: z.optional(image()),
		}),
});

const digests = defineCollection({
	loader: glob({ base: './src/content/digests', pattern: '**/*.md' }),
	schema: z.object({
		weekISO: z.string(),
		weekStart: z.coerce.date(),
		weekEnd: z.coerce.date(),
		title: z.string(),
		deck: z.string(),
		pubDate: z.coerce.date(),
		storylines: z
			.array(
				z.object({
					headline: z.string(),
					narrative: z.string(),
					clusterSlug: z.string().optional(),
					posts: z.array(z.string()).default([]),
				}),
			)
			.default([]),
		newsPicks: z
			.array(
				z.object({
					slug: z.string(),
					why: z.string(),
				}),
			)
			.default([]),
		externalReads: z
			.array(
				z.object({
					title: z.string(),
					url: z.string(),
					source: z.string().optional(),
					why: z.string().optional(),
				}),
			)
			.default([]),
		verdict: z.string(),
		status: z.enum(['draft', 'ready']).default('ready'),
	}),
});

const models = defineCollection({
	loader: glob({ base: './src/content/models', pattern: '**/*.yaml' }),
	schema: z.object({
		vendor: z.enum([
			'OpenAI',
			'Anthropic',
			'Google',
			'xAI',
			'Meta',
			'Mistral',
			'DeepSeek',
			'Qwen / Alibaba',
			'Moonshot',
			'Baidu',
			'Microsoft',
			'Cohere',
			'NVIDIA',
			'Sber',
			'Yandex',
			'MTS',
			'Other',
		]),
		family: z.string(),
		name: z.string(),
		releaseDate: z.coerce.date(),
		releaseType: z.enum([
			'frontier-closed',
			'frontier-open',
			'tier-2-open',
			'russian',
			'other',
		]),
		modality: z
			.array(z.enum(['text', 'image', 'audio', 'video', 'code', 'agent']))
			.default(['text']),
		contextWindow: z.number().optional(),
		pricing: z
			.object({
				input: z.string(),
				output: z.string(),
			})
			.optional(),
		benchmarks: z
			.array(
				z.object({
					name: z.string(),
					score: z.string(),
				}),
			)
			.default([]),
		sourceUrl: z.string().url(),
		articleSlug: z.string().optional(),
		notes: z.string(),
		status: z.enum(['live', 'deprecated', 'restricted']).default('live'),
	}),
});

export const collections = { posts, digests, models };
