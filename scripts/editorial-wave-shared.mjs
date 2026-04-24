import fs from 'node:fs/promises';
import path from 'node:path';

export const ROOT = process.cwd();
export const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
export const HERO_DIR = path.join(ROOT, 'src', 'assets', 'editorial');
export const GRAPHICS_DIR = path.join(ROOT, 'public', 'editorial', 'graphics');

const toneMap = {
	warm: {
		bg1: '#f6f1e3',
		bg2: '#e3dcc7',
		accent: '#c6f24b',
		accentSoft: '#dff699',
		ink: '#141510',
		grid: '#d8d2bf',
	},
	graph: {
		bg1: '#12140f',
		bg2: '#22261d',
		accent: '#c6f24b',
		accentSoft: '#7ea41b',
		ink: '#f6f5f1',
		grid: '#2d3128',
	},
	paper: {
		bg1: '#fbfaf6',
		bg2: '#ebe5d5',
		accent: '#c6f24b',
		accentSoft: '#d8ed8d',
		ink: '#171813',
		grid: '#d7d2c4',
	},
	dark: {
		bg1: '#10120e',
		bg2: '#1a1d16',
		accent: '#c6f24b',
		accentSoft: '#7ca517',
		ink: '#f6f5f1',
		grid: '#2d3128',
	},
};

const rubricTone = {
	automations: 'warm',
	innovations: 'paper',
	tendencies: 'warm',
	generations: 'graph',
	trajectories: 'dark',
	regulations: 'paper',
	russia: 'warm',
	illusions: 'dark',
	theories: 'graph',
};

const typeLabel = {
	news: 'новость',
	analysis: 'аналитика',
	column: 'колонка',
};

const ensureDir = async (dir) => fs.mkdir(dir, { recursive: true });

const escapeXml = (value) =>
	String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');

export const figure = (src, alt, caption) => [
	'<figure class="article-graphic">',
	`  <img src="${src}" alt="${alt}" />`,
	`  <figcaption>${caption}</figcaption>`,
	'</figure>',
].join('\n');

export const chartShell = (title, subtitle, content) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1440" height="900" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1440" height="900" rx="28" fill="#FBFAF6"/>
  <rect x="40" y="40" width="1360" height="820" rx="26" fill="#FBFAF6" stroke="#D7D2C4" stroke-width="2"/>
  <rect x="72" y="72" width="1296" height="176" rx="22" fill="#141510"/>
  <text x="110" y="144" fill="#F6F5F1" font-size="46" font-family="Arial, sans-serif" font-weight="700">${escapeXml(title)}</text>
  <text x="110" y="194" fill="#C8C9C1" font-size="24" font-family="Arial, sans-serif">${escapeXml(subtitle)}</text>
  <path d="M1120 110C1198 72 1292 82 1342 144C1384 198 1376 282 1324 330" stroke="#C6F24B" stroke-width="3" stroke-linecap="round"/>
  <circle cx="1298" cy="154" r="18" fill="#C6F24B"/>
${content}
</svg>
`;

export const detectGraphics = (body, graphicsLabels) =>
	Object.entries(graphicsLabels)
		.filter(([filename]) => body.includes(filename))
		.map(([, label]) => label);

const yamlArray = (items) => `[${items.map((item) => JSON.stringify(item)).join(', ')}]`;

const frontmatter = (post, stage) => {
	const lines = [
		'---',
		`title: ${JSON.stringify(post.title)}`,
		`description: ${JSON.stringify(post.description)}`,
		`pubDate: ${JSON.stringify(post.pubDate)}`,
		`articleType: ${JSON.stringify(post.articleType)}`,
		`stage: ${JSON.stringify(stage)}`,
		`status: ${JSON.stringify('ready')}`,
		`rubrics: ${yamlArray(post.rubrics)}`,
		`rubricLabels: ${yamlArray(post.rubricLabels)}`,
		`topics: ${yamlArray(post.topics)}`,
	];

	if (post.storyCluster) {
		lines.push(`storyCluster: ${JSON.stringify(post.storyCluster)}`);
	}

	if (post.sourceNote) {
		lines.push(`sourceNote: ${JSON.stringify(post.sourceNote)}`);
	}

	if (typeof post.readingTime === 'number') {
		lines.push(`readingTime: ${post.readingTime}`);
	}

	lines.push(`publicUrl: ${JSON.stringify(`/${post.slug}/`)}`);
	lines.push(`heroImage: ../../assets/editorial/${post.slug}-hero.svg`);
	lines.push('---', '', post.body, '');
	return lines.join('\n');
};

export const heroSvg = (post, index) => {
	const tone = toneMap[rubricTone[post.rubrics[0]] ?? 'paper'];
	const [line1, line2] = post.heroLines;
	const dateLabel = new Date(post.pubDate).toLocaleDateString('ru-RU', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	});
	const type = typeLabel[post.articleType] ?? post.articleType;
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${index}" x1="0" y1="0" x2="1600" y2="900" gradientUnits="userSpaceOnUse">
      <stop stop-color="${tone.bg1}"/>
      <stop offset="1" stop-color="${tone.bg2}"/>
    </linearGradient>
    <radialGradient id="glow-${index}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1220 180) rotate(90) scale(280 360)">
      <stop stop-color="${tone.accent}" stop-opacity="0.42"/>
      <stop offset="1" stop-color="${tone.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg-${index})"/>
  <rect x="72" y="72" width="1456" height="756" rx="28" stroke="${tone.grid}" stroke-width="2"/>
  <rect x="106" y="106" width="672" height="688" rx="28" fill="${tone.bg1}" stroke="${tone.grid}" stroke-width="1.5"/>
  <path d="M876 214C976 122 1132 108 1248 162C1358 214 1432 324 1432 446C1432 614 1298 742 1116 742C980 742 852 674 780 572" stroke="${tone.accentSoft}" stroke-width="3"/>
  <path d="M904 310C990 250 1096 230 1194 250C1328 280 1416 394 1400 542C1388 642 1330 728 1248 784" stroke="${tone.grid}" stroke-width="1.5" stroke-dasharray="8 10"/>
  <circle cx="1220" cy="180" r="260" fill="url(#glow-${index})"/>
  <text x="154" y="178" fill="${tone.ink}" font-size="26" font-family="Arial, sans-serif" letter-spacing="0.14em">${escapeXml(dateLabel.toUpperCase())}</text>
  <text x="154" y="220" fill="${tone.ink}" fill-opacity="0.72" font-size="22" font-family="Arial, sans-serif" letter-spacing="0.18em">${escapeXml(type.toUpperCase())}</text>
  <text x="154" y="442" fill="${tone.ink}" font-size="118" font-family="Arial, sans-serif" font-weight="800" letter-spacing="-0.04em">${escapeXml(line1)}</text>
  <text x="154" y="564" fill="${tone.ink}" font-size="118" font-family="Arial, sans-serif" font-weight="800" letter-spacing="-0.04em">${escapeXml(line2)}</text>
  <rect x="154" y="628" width="138" height="10" rx="5" fill="${tone.accent}"/>
  <text x="154" y="706" fill="${tone.ink}" fill-opacity="0.72" font-size="30" font-family="Arial, sans-serif">${escapeXml(post.rubricLabels[0] ?? 'SCQR')}</text>
  <text x="154" y="754" fill="${tone.ink}" fill-opacity="0.56" font-size="24" font-family="Arial, sans-serif">SCQR backfill wave</text>
</svg>
`;
};

const matrixDoc = ({ heading, intro, sourceBullets, graphicsLabels }, posts) => [
	heading,
	'',
	intro,
	'',
	'| Дата | Жанр | Рубрика | Заголовок | Внутренняя графика |',
	'| --- | --- | --- | --- | --- |',
	...posts.map((post) => {
		const graphicsUsed = detectGraphics(post.body, graphicsLabels);
		return `| ${post.pubDate.slice(0, 10)} | ${post.articleType} | ${post.rubricLabels[0]} | ${post.title} | ${graphicsUsed.join(', ') || 'обложка'} |`;
	}),
	'',
	'## Источники волны',
	'',
	...sourceBullets.map((item) => `- ${item}`),
].join('\n');

export const generateWave = async ({
	stage,
	docPath,
	heading,
	intro,
	posts,
	graphics,
	sourceBullets,
	graphicsLabels,
}) => {
	await Promise.all([ensureDir(POSTS_DIR), ensureDir(HERO_DIR), ensureDir(GRAPHICS_DIR)]);

	await Promise.all(
		posts.map((post, index) =>
			Promise.all([
				fs.writeFile(path.join(POSTS_DIR, `${post.slug}.md`), frontmatter(post, stage), 'utf8'),
				fs.writeFile(path.join(HERO_DIR, `${post.slug}-hero.svg`), heroSvg(post, index), 'utf8'),
			])
		)
	);

	await Promise.all(
		Object.entries(graphics).map(([filename, source]) =>
			fs.writeFile(path.join(GRAPHICS_DIR, filename), source, 'utf8')
		)
	);

	await fs.writeFile(
		docPath,
		matrixDoc({ heading, intro, sourceBullets, graphicsLabels }, posts),
		'utf8'
	);
};
