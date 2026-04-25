#!/usr/bin/env node
/**
 * scripts/slice-mascots.mjs
 *
 * Slices the 5 mascot-v2 collage sheets (placed by the owner under
 * `.scqr/mascot-v2-sheets/`) into individual PNG assets and writes them to
 * `site/public/mascot-v2/`.
 *
 * Run from the workspace root or from `site/`:
 *   node site/scripts/slice-mascots.mjs
 *
 * Naming convention:
 *   sheet1: 6 cells, 3 rows × 2 cols. Scenes with background.
 *     scene-1 .. scene-6 (left→right, top→bottom)
 *   sheet2: 6 cells, 3 rows × 2 cols. Scenes with soft background.
 *     soft-1 .. soft-6
 *   sheet3: 6 cells, 2 rows × 3 cols. Clean poses on white.
 *     poseA-1 .. poseA-6
 *   sheet4: 6 cells, 2 rows × 3 cols. Clean poses on white.
 *     poseB-1 .. poseB-6
 *   sheet5: ~35 cells, 5 rows × 7 cols. Small emoji-style avatars on white.
 *     emoji-1 .. emoji-35
 *
 * After running, rename / symlink semantic aliases inside the script's
 * SEMANTIC_ALIASES table (e.g. avatar.png → emoji-1.png) and re-run.
 */

import sharp from 'sharp';
import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(here, '..', '..');

const sheetsDir = resolve(workspaceRoot, '.scqr', 'mascot-v2-sheets');
const outDir = resolve(workspaceRoot, 'site', 'public', 'mascot-v2');
const previewDir = resolve(workspaceRoot, '.scqr', 'mascot-v2-preview');

// Actual collages provided by owner (red-glasses v2 set, 1536x1024 each).
// Grids verified by counting cells in preview.
const SHEETS = [
	// 6 scene cells with backgrounds (power lines, oil pump, dog, drone, etc.)
	{ file: '01-scenes-with-bg.png', cols: 3, rows: 2, prefix: 'scene' },
	// Mixed pose grid (4 rows × 7 cols nominal — top row may include small avatars)
	{ file: '02-poses-grid-mixed.png', cols: 7, rows: 4, prefix: 'mix' },
	// 6 clean full-body poses on white
	{ file: '03-poses-clean.png', cols: 3, rows: 2, prefix: 'pose' },
	// Emoji-style grid A (4 rows × 7 cols = 28)
	{ file: '04-emoji-grid-a.png', cols: 7, rows: 4, prefix: 'emA' },
	// Emoji-style grid B (5 rows × 7 cols = 35)
	{ file: '05-emoji-grid-b.png', cols: 7, rows: 5, prefix: 'emB' },
];

/**
 * Map semantic names used across the site code to the slice that should be
 * copied into site/public/mascot/<name>.png.
 *
 * Tweak this table after first slice — open .scqr/mascot-v2-preview/ to
 * eyeball each cell and decide which one fits where.
 *
 * Defaults are best-guess assignments based on the collage content.
 */
// Best-guess mappings — adjust after eyeballing .scqr/mascot-v2-preview/.
// Cell numbering goes left→right, top→bottom inside each sheet.
const SEMANTIC_ALIASES = {
	// Hero on homepage — pose-1 (clean white): pointing at chart
	'hero.png': 'pose-1.png',
	// Newsletter banner — pose-3: at laptop on desk
	'banner.png': 'pose-3.png',
	// Footer goodbye — pose-6: waving hello/bye
	'footer-wave.png': 'pose-6.png',
	// Header avatar — mix-1 (thumbs-up, SCQR.RU branding on chest)
	'avatar.png': 'mix-1.png',
	// 404 lost — emB-9 (thinking pose with thought bubble + question mark)
	'lost.png': 'emB-9.png',
	// Search empty — emA-2 (magnifying glass)
	'search.png': 'emA-2.png',
	// Network/scene with infra — scene-1 (power lines)
	'network.png': 'scene-1.png',
	// Empty rubric — pose-4 (sitting with books, writing)
	'writing.png': 'pose-4.png',
	// Success — emA-26 placeholder (will pick from preview)
	'success.png': 'emA-7.png',
	// About steps
	'step-1.png': 'pose-1.png', // Сигналы — pointing at chart
	'step-2.png': 'emB-9.png',  // Рецензия — thinking with thought bubble
	'step-3.png': 'pose-3.png', // Производство — laptop
	'step-4.png': 'pose-6.png', // Публикация — waving
};

async function ensureDir(d) {
	mkdirSync(d, { recursive: true });
}

async function slice() {
	if (!existsSync(sheetsDir)) {
		console.error(`Sheets dir not found: ${sheetsDir}`);
		console.error(`Place the 5 collages here, named exactly:`);
		for (const s of SHEETS) console.error('  ' + s.file);
		process.exit(1);
	}

	await ensureDir(outDir);
	await ensureDir(previewDir);

	for (const sheet of SHEETS) {
		const path = resolve(sheetsDir, sheet.file);
		if (!existsSync(path)) {
			console.warn(`SKIP ${sheet.file} — not found in ${sheetsDir}`);
			continue;
		}
		const img = sharp(path);
		const meta = await img.metadata();
		const cellW = Math.floor(meta.width / sheet.cols);
		const cellH = Math.floor(meta.height / sheet.rows);
		console.log(`${sheet.file}: ${meta.width}×${meta.height} → ${sheet.cols}×${sheet.rows} cells (${cellW}×${cellH} each)`);

		let i = 1;
		for (let r = 0; r < sheet.rows; r++) {
			for (let c = 0; c < sheet.cols; c++) {
				const left = c * cellW;
				const top = r * cellH;
				const outName = `${sheet.prefix}-${i}.png`;
				const outPath = resolve(outDir, outName);
				const previewPath = resolve(previewDir, outName);
				await sharp(path)
					.extract({ left, top, width: cellW, height: cellH })
					.toFile(outPath);
				// also write a smaller preview copy for inspection
				await sharp(outPath)
					.resize({ width: 300, withoutEnlargement: true })
					.toFile(previewPath);
				i++;
			}
		}
	}

	console.log('\n--- Applying semantic aliases ---');
	const mascotDir = resolve(workspaceRoot, 'site', 'public', 'mascot');
	await ensureDir(mascotDir);
	for (const [alias, source] of Object.entries(SEMANTIC_ALIASES)) {
		const src = resolve(outDir, source);
		const dst = resolve(mascotDir, alias);
		if (existsSync(src)) {
			copyFileSync(src, dst);
			console.log(`  ${alias} ← ${source}`);
		} else {
			console.warn(`  ${alias} ← ${source} (source missing, skip)`);
		}
	}

	console.log('\nDone.');
	console.log(`  Sliced cells:    ${outDir}`);
	console.log(`  Preview thumbs:  ${previewDir}`);
	console.log(`  Semantic copies: ${mascotDir}`);
}

slice().catch((err) => {
	console.error(err);
	process.exit(1);
});
