import type { CollectionEntry } from 'astro:content';
import {
	VENDORS,
	VENDOR_ORDER,
	type VendorId,
} from '../data/vendor-config';

export type ModelEntry = CollectionEntry<'models'>;

/** Цвет вендора по id; fallback — Other. */
export function getVendorColor(vendor: string): string {
	const meta = VENDORS[vendor as VendorId];
	return meta?.color ?? VENDORS.Other.color;
}

/** Сортировка моделей по дате релиза (новые сверху). */
export function sortModelsByDate(models: ModelEntry[]): ModelEntry[] {
	return [...models].sort(
		(a, b) => b.data.releaseDate.valueOf() - a.data.releaseDate.valueOf(),
	);
}

/** Уникальные семейства, отсортированные по последнему релизу. */
export function groupByFamily(models: ModelEntry[]): {
	family: string;
	vendor: string;
	models: ModelEntry[];
}[] {
	const map = new Map<string, ModelEntry[]>();
	for (const m of models) {
		const key = `${m.data.vendor}::${m.data.family}`;
		const list = map.get(key) ?? [];
		list.push(m);
		map.set(key, list);
	}
	const groups = Array.from(map.entries()).map(([key, items]) => {
		const [vendor, family] = key.split('::');
		const sorted = sortModelsByDate(items);
		return { vendor, family, models: sorted };
	});
	groups.sort((a, b) => {
		const aLatest = a.models[0]?.data.releaseDate.valueOf() ?? 0;
		const bLatest = b.models[0]?.data.releaseDate.valueOf() ?? 0;
		return bLatest - aLatest;
	});
	return groups;
}

/** Группировка по вендорам в каноническом порядке. */
export function groupByVendor(models: ModelEntry[]): {
	vendor: string;
	models: ModelEntry[];
}[] {
	const map = new Map<string, ModelEntry[]>();
	for (const m of models) {
		const list = map.get(m.data.vendor) ?? [];
		list.push(m);
		map.set(m.data.vendor, list);
	}
	const groups: { vendor: string; models: ModelEntry[] }[] = [];
	for (const v of VENDOR_ORDER) {
		const items = map.get(v);
		if (items && items.length > 0) {
			groups.push({ vendor: v, models: sortModelsByDate(items) });
		}
	}
	return groups;
}

/** Список уникальных годов релизов для фильтра. */
export function uniqueYears(models: ModelEntry[]): number[] {
	const set = new Set<number>();
	for (const m of models) set.add(m.data.releaseDate.getFullYear());
	return Array.from(set).sort((a, b) => b - a);
}

/** Уникальные вендоры (только те, что есть в данных). */
export function uniqueVendors(models: ModelEntry[]): string[] {
	const set = new Set<string>();
	for (const m of models) set.add(m.data.vendor);
	return VENDOR_ORDER.filter((v) => set.has(v));
}

/** Стабильный URL модели. */
export function getModelHref(entry: ModelEntry): string {
	return `/models/${entry.id}/`;
}

/** Дата для атрибута и для сортировки на клиенте (ISO). */
export function getReleaseIso(entry: ModelEntry): string {
	return entry.data.releaseDate.toISOString().slice(0, 10);
}

/** Краткая отметка месяца релиза для UI: «апр 2026». */
const MONTHS_RU = [
	'янв',
	'фев',
	'мар',
	'апр',
	'мая',
	'июн',
	'июл',
	'авг',
	'сен',
	'окт',
	'ноя',
	'дек',
];
export function getReleaseShortLabel(entry: ModelEntry): string {
	const d = entry.data.releaseDate;
	return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
}

/** Если есть articleSlug — возвращает href в архиве. */
export function getRelatedArticleHref(entry: ModelEntry): string | null {
	const slug = entry.data.articleSlug;
	if (!slug) return null;
	return `/${slug}/`;
}
