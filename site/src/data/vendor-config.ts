/**
 * Конфигурация вендоров для раздела /models/.
 *
 * Палитра — расширение того, что использовалось в ModelReleases3D.astro.
 * Цвета подобраны так, чтобы они различались на лиловом фоне (light theme)
 * и на тёмном (dark theme) без замены — все имеют достаточный контраст
 * по обеим темам.
 */

export type VendorId =
	| 'OpenAI'
	| 'Anthropic'
	| 'Google'
	| 'xAI'
	| 'Meta'
	| 'Mistral'
	| 'DeepSeek'
	| 'Qwen / Alibaba'
	| 'Moonshot'
	| 'Baidu'
	| 'Microsoft'
	| 'Cohere'
	| 'NVIDIA'
	| 'Sber'
	| 'Yandex'
	| 'MTS'
	| 'Other';

export interface VendorMeta {
	id: VendorId;
	color: string;
	country: 'US' | 'EU' | 'CN' | 'RU' | 'Other';
	kind: 'lab' | 'platform' | 'corp';
}

export const VENDORS: Record<VendorId, VendorMeta> = {
	OpenAI: { id: 'OpenAI', color: '#10a37f', country: 'US', kind: 'lab' },
	Anthropic: { id: 'Anthropic', color: '#d97706', country: 'US', kind: 'lab' },
	Google: { id: 'Google', color: '#2563eb', country: 'US', kind: 'corp' },
	xAI: { id: 'xAI', color: '#db2777', country: 'US', kind: 'lab' },
	Meta: { id: 'Meta', color: '#0866ff', country: 'US', kind: 'corp' },
	Mistral: { id: 'Mistral', color: '#ff7000', country: 'EU', kind: 'lab' },
	DeepSeek: { id: 'DeepSeek', color: '#7c3aed', country: 'CN', kind: 'lab' },
	'Qwen / Alibaba': {
		id: 'Qwen / Alibaba',
		color: '#0f766e',
		country: 'CN',
		kind: 'corp',
	},
	Moonshot: { id: 'Moonshot', color: '#b91c1c', country: 'CN', kind: 'lab' },
	Baidu: { id: 'Baidu', color: '#475569', country: 'CN', kind: 'corp' },
	Microsoft: { id: 'Microsoft', color: '#0078d4', country: 'US', kind: 'corp' },
	Cohere: { id: 'Cohere', color: '#39594d', country: 'US', kind: 'lab' },
	NVIDIA: { id: 'NVIDIA', color: '#76b900', country: 'US', kind: 'corp' },
	Sber: { id: 'Sber', color: '#21a038', country: 'RU', kind: 'corp' },
	Yandex: { id: 'Yandex', color: '#fc3f1d', country: 'RU', kind: 'corp' },
	MTS: { id: 'MTS', color: '#e30611', country: 'RU', kind: 'corp' },
	Other: { id: 'Other', color: '#64748b', country: 'Other', kind: 'lab' },
};

export const VENDOR_ORDER: VendorId[] = [
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
	'NVIDIA',
	'Cohere',
	'Sber',
	'Yandex',
	'MTS',
	'Other',
];

export const RELEASE_TYPE_LABELS: Record<string, string> = {
	'frontier-closed': 'Фронтир · закрытая',
	'frontier-open': 'Фронтир · открытая',
	'tier-2-open': 'Открытая · второй ряд',
	russian: 'Российская',
	other: 'Прочее',
};

export const RELEASE_TYPE_COLORS: Record<string, string> = {
	'frontier-closed': '#7c5cff',
	'frontier-open': '#a3e635',
	'tier-2-open': '#22d3ee',
	russian: '#f0b35a',
	other: '#94a3b8',
};

export const MODALITY_LABELS: Record<string, string> = {
	text: 'Текст',
	image: 'Изображения',
	audio: 'Аудио',
	video: 'Видео',
	code: 'Код',
	agent: 'Агент',
};
