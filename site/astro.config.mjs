// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://scqr.ru',
	integrations: [mdx(), sitemap()],
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Manrope',
			cssVariable: '--font-display',
			fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
			weights: [400, 500, 600, 700, 800],
			styles: ['normal'],
			subsets: ['latin', 'cyrillic'],
			display: 'swap',
		},
		{
			provider: fontProviders.google(),
			name: 'Inter',
			cssVariable: '--font-body',
			fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
			weights: [400, 500, 600, 700],
			styles: ['normal'],
			subsets: ['latin', 'cyrillic'],
			display: 'swap',
		},
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			fallbacks: ['ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
			weights: [400, 500],
			styles: ['normal'],
			subsets: ['latin'],
			display: 'swap',
		},
	],
});
