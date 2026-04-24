import type { ImageMetadata } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '../consts';

type ImageLike = ImageMetadata | undefined;

interface PageIdentity {
	title: string;
	description: string;
	path: string;
	image?: ImageLike;
}

interface ArticleIdentity extends PageIdentity {
	publishedTime: Date;
	updatedTime?: Date;
	section?: string;
}

const buildUrl = (path: string) => new URL(path, SITE_URL).toString();

export const getAbsoluteImageUrl = (image?: ImageLike) =>
	image ? new URL(image.src, SITE_URL).toString() : undefined;

export const buildOrganizationJsonLd = () => ({
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: SITE_TITLE,
	url: SITE_URL,
	description: SITE_DESCRIPTION,
	logo: buildUrl('/favicon.svg'),
});

export const buildWebsiteJsonLd = ({ title, description, path, image }: PageIdentity) => ({
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: title,
	url: buildUrl(path),
	description,
	publisher: {
		'@type': 'Organization',
		name: SITE_TITLE,
		url: SITE_URL,
	},
	image: getAbsoluteImageUrl(image),
});

export const buildCollectionPageJsonLd = ({ title, description, path, image }: PageIdentity) => ({
	'@context': 'https://schema.org',
	'@type': 'CollectionPage',
	name: title,
	url: buildUrl(path),
	description,
	isPartOf: {
		'@type': 'WebSite',
		name: SITE_TITLE,
		url: SITE_URL,
	},
	image: getAbsoluteImageUrl(image),
});

export const buildArticleJsonLd = ({
	title,
	description,
	path,
	image,
	publishedTime,
	updatedTime,
	section,
}: ArticleIdentity) => ({
	'@context': 'https://schema.org',
	'@type': 'Article',
	headline: title,
	description,
	url: buildUrl(path),
	datePublished: publishedTime.toISOString(),
	dateModified: (updatedTime ?? publishedTime).toISOString(),
	articleSection: section,
	image: getAbsoluteImageUrl(image),
	author: {
		'@type': 'Organization',
		name: SITE_TITLE,
	},
	publisher: {
		'@type': 'Organization',
		name: SITE_TITLE,
		url: SITE_URL,
		logo: {
			'@type': 'ImageObject',
			url: buildUrl('/favicon.svg'),
		},
	},
	isPartOf: {
		'@type': 'WebSite',
		name: SITE_TITLE,
		url: SITE_URL,
	},
	mainEntityOfPage: buildUrl(path),
});
