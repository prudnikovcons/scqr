#!/usr/bin/env node
/**
 * Usage: npm run new -- "Заголовок статьи" analysis innovations
 *   arg1: title (required)
 *   arg2: articleType — news | analysis | column (default: news)
 *   arg3: rubric slug from RUBRIC_CONFIG (default: tendencies)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const postsDir = join(__dir, '../src/content/posts');

const RUBRIC_LABELS = {
  trajectories: 'Траектории',
  generations:  'Генерации',
  automations:  'Автоматизации',
  innovations:  'Новации',
  illusions:    'Иллюзии',
  russia:       'В России',
  regulations:  'Регуляции',
  theories:     'Теории',
  tendencies:   'Тенденции',
};

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[ёе]/g, 'e').replace(/[ая]/g, 'a').replace(/б/g, 'b')
    .replace(/в/g, 'v').replace(/г/g, 'g').replace(/д/g, 'd')
    .replace(/ж/g, 'zh').replace(/з/g, 'z').replace(/[ий]/g, 'i')
    .replace(/к/g, 'k').replace(/л/g, 'l').replace(/м/g, 'm')
    .replace(/н/g, 'n').replace(/о/g, 'o').replace(/п/g, 'p')
    .replace(/р/g, 'r').replace(/с/g, 's').replace(/т/g, 't')
    .replace(/у/g, 'u').replace(/ф/g, 'f').replace(/х/g, 'kh')
    .replace(/ц/g, 'ts').replace(/ч/g, 'ch').replace(/ш/g, 'sh')
    .replace(/щ/g, 'shch').replace(/ъ|ь/g, '').replace(/ы/g, 'y')
    .replace(/э/g, 'e').replace(/ю/g, 'yu').replace(/я/g, 'ya')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

const [,, rawTitle, articleType = 'news', rubricSlug = 'tendencies'] = process.argv;

if (!rawTitle) {
  console.error('Usage: npm run new -- "Title" [articleType] [rubricSlug]');
  process.exit(1);
}

const validTypes = ['news', 'analysis', 'column'];
if (!validTypes.includes(articleType)) {
  console.error(`articleType must be one of: ${validTypes.join(', ')}`);
  process.exit(1);
}

if (!RUBRIC_LABELS[rubricSlug]) {
  console.error(`rubricSlug must be one of: ${Object.keys(RUBRIC_LABELS).join(', ')}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const slug = slugify(rawTitle);
const filename = `${today}-${slug}.md`;
const filepath = join(postsDir, filename);
const label = RUBRIC_LABELS[rubricSlug];

const pubDate = new Date().toISOString().replace(/\.\d+Z$/, '');
const publicUrl = `/${today}-${slug}/`;

const frontmatter = `---
title: "${rawTitle}"
description: ""
deck: ""
scqrVerdict: ""
pubDate: "${pubDate}"
articleType: "${articleType}"
stage: "draft"
status: "draft"
rubrics: ["${rubricSlug}"]
rubricLabels: ["${label}"]
topics: []
editorialFlags: []
sourceNote: ""
readingTime: 3
publicUrl: "${publicUrl}"
heroAlt: "Редакционная обложка SCQR к материалу «${rawTitle}»."
heroImage: ../../assets/blog-placeholder-1.jpg
---

Текст материала.
`;

mkdirSync(postsDir, { recursive: true });
writeFileSync(filepath, frontmatter, 'utf8');
console.log(`Created: src/content/posts/${filename}`);
