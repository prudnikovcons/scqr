import fs from 'node:fs/promises';
import path from 'node:path';

const SOURCE_ROOT = 'D:/CODEX/SCQR';
const PREPRINT_DIR = path.join(SOURCE_ROOT, 'preprint');
const STORIES_DIR = path.join(SOURCE_ROOT, 'stories', 'work-items');
const OUTPUT_DIR = path.join(process.cwd(), 'src', 'content', 'posts');

const cleanText = (value) =>
	value
		.replace(/`/g, '')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();

const splitCsv = (value) =>
	value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);

const parseBulletMeta = (source) => {
	const fields = {};
	const lines = source.split(/\r?\n/);

	for (const line of lines) {
		const match = line.match(/^- `([^`]+)`: `?(.*?)`?$/);
		if (!match) {
			if (line.trim() === '') {
				continue;
			}
			if (line.startsWith('# ')) {
				break;
			}
			continue;
		}

		fields[match[1]] = match[2];
	}

	return fields;
};

const parseMetaBlock = (source) => {
	const marker = '\n---\nmeta:\n';
	const start = source.lastIndexOf(marker);
	if (start === -1) {
		return {};
	}

	const block = source.slice(start + marker.length);
	const result = {};
	let currentKey = '';
	let collectingList = false;
	let collectingMultiline = false;
	const lines = block.split(/\r?\n/);

	for (const rawLine of lines) {
		const line = rawLine.replace(/\r/g, '');
		if (line.trim() === '') {
			continue;
		}

		const listMatch = line.match(/^ {2,4}- (.+)$/);
		if (collectingList && listMatch) {
			result[currentKey].push(listMatch[1].trim());
			continue;
		}

		const childLine = line.match(/^    (.+)$/);
		if (collectingMultiline && childLine) {
			result[currentKey] += `${result[currentKey] ? '\n' : ''}${childLine[1]}`;
			continue;
		}

		collectingList = false;
		collectingMultiline = false;

		const fieldMatch = line.match(/^  ([a-z_]+):(?: (.+))?$/);
		if (!fieldMatch) {
			continue;
		}

		const [, key, value = ''] = fieldMatch;
		currentKey = key;

		if (value === '|') {
			result[key] = '';
			collectingMultiline = true;
			continue;
		}

		if (value === '') {
			result[key] = [];
			collectingList = true;
			continue;
		}

		result[key] = value.trim();
	}

	return result;
};

const parseBody = (source) => {
	const headingMatch = source.match(/\n# (.+)\r?\n\r?\n/);
	if (!headingMatch) {
		return '';
	}

	const headingIndex = source.indexOf(headingMatch[0]);
	const bodyStart = headingIndex + headingMatch[0].length;
	const metaMarker = '\n---\nmeta:\n';
	const metaIndex = source.lastIndexOf(metaMarker);
	const bodyEnd = metaIndex === -1 ? source.length : metaIndex;
	return source.slice(bodyStart, bodyEnd).trim();
};

const toYamlArray = (items) => `[${items.map((item) => JSON.stringify(item)).join(', ')}]`;

const slugToPath = (slug) => path.join(OUTPUT_DIR, `${slug}.md`);

const ensureDir = async (dir) => {
	await fs.mkdir(dir, { recursive: true });
};

const readOptionalFile = async (filePath) => {
	try {
		return await fs.readFile(filePath, 'utf8');
	} catch {
		return null;
	}
};

const main = async () => {
	await ensureDir(OUTPUT_DIR);

	const preprintEntries = (await fs.readdir(PREPRINT_DIR))
		.filter((name) => name.endsWith('.md'))
		.sort();

	const written = [];

	for (const entry of preprintEntries) {
		const slug = entry.replace(/\.md$/, '');
		const preprintPath = path.join(PREPRINT_DIR, entry);
		const workItemPath = path.join(STORIES_DIR, `${slug}.md`);
		const publishRecordPath = path.join(STORIES_DIR, `${slug}.publish-record.md`);

		const [preprintRaw, workItemRaw, publishRecordRaw] = await Promise.all([
			fs.readFile(preprintPath, 'utf8'),
			readOptionalFile(workItemPath),
			readOptionalFile(publishRecordPath),
		]);

		const preprintMeta = parseBulletMeta(preprintRaw);
		const contentMeta = parseMetaBlock(preprintRaw);
		const workMeta = workItemRaw ? parseBulletMeta(workItemRaw) : {};
		const publishMeta = publishRecordRaw ? parseBulletMeta(publishRecordRaw) : {};
		const body = parseBody(preprintRaw);
		const firstParagraph = cleanText((body.split(/\r?\n\r?\n/).find(Boolean) ?? '').trim());
		const title = preprintMeta.Title || slug;
		const pubDateRaw = publishMeta['Published at'] || preprintMeta.Date || slug.slice(0, 10);
		const pubDate = pubDateRaw.includes(' ')
			? pubDateRaw.replace(' ', 'T') + ':00'
			: `${pubDateRaw}T09:00:00`;
		const articleType = (contentMeta.format || preprintMeta.Format || 'news').toString().trim();
		const rubrics = Array.isArray(contentMeta.rubrics) ? contentMeta.rubrics : [];
		const rubricLabels = preprintMeta.Rubrics ? splitCsv(preprintMeta.Rubrics) : [];
		const topics = Array.isArray(contentMeta.topics)
			? contentMeta.topics
			: preprintMeta.Topics
				? splitCsv(preprintMeta.Topics)
				: [];
		const storyCluster =
			contentMeta.story_cluster ||
			publishMeta['Story cluster'] ||
			preprintMeta['Story cluster'] ||
			workMeta['Related stories'] ||
			'';
		const sourceNote =
			contentMeta.source_note ||
			publishMeta['Source note'] ||
			'';
		const wordCount = Number.parseInt(String(contentMeta.word_count || '').trim(), 10);
		const readingTime = Number.isFinite(wordCount) ? Math.max(1, Math.round(wordCount / 180)) : undefined;
		const description = firstParagraph || cleanText(preprintMeta.Risks || title);
		const frontmatter = [
			'---',
			`title: ${JSON.stringify(title)}`,
			`description: ${JSON.stringify(description)}`,
			`pubDate: ${JSON.stringify(pubDate)}`,
			`articleType: ${JSON.stringify(articleType)}`,
			`stage: ${JSON.stringify(preprintMeta.Stage || publishMeta.Stage || '')}`,
			`status: ${JSON.stringify(preprintMeta.Status || publishMeta.Status || workMeta['Story status'] || '')}`,
			`rubrics: ${toYamlArray(rubrics)}`,
			`rubricLabels: ${toYamlArray(rubricLabels)}`,
			`topics: ${toYamlArray(topics)}`,
			`storyCluster: ${JSON.stringify(storyCluster)}`,
			`sourceNote: ${JSON.stringify(sourceNote)}`,
			`readingTime: ${Number.isFinite(readingTime) ? readingTime : 1}`,
			`publicUrl: ${JSON.stringify(publishMeta.URL || workMeta['Public URL'] || `/${slug}/`)}`,
			'---',
			'',
			`# ${title}`,
			'',
			body,
			'',
		].join('\n');

		await fs.writeFile(slugToPath(slug), frontmatter, 'utf8');
		written.push(slug);
	}

	console.log(`Imported ${written.length} SCQR materials into src/content/posts`);
};

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
