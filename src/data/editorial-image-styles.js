export const HERO_SOURCE_OPTIONS = [
	'user-supplied',
	'generated',
	'hybrid',
	'diagram',
];

export const LEGACY_EDITORIAL_IMAGE_STYLE_ORDER = [
	'editorial_collage',
	'signal_network',
	'industrial_plate',
	'threshold_space',
	'quiet_monument',
];

export const PRIMARY_EDITORIAL_IMAGE_STYLE_ORDER = [
	'documentary_frame',
	'scientific_lucid',
	'human_collage',
	'civic_blueprint',
	'editorial_still_life',
];

export const EDITORIAL_IMAGE_STYLE_ORDER = [
	...LEGACY_EDITORIAL_IMAGE_STYLE_ORDER,
	...PRIMARY_EDITORIAL_IMAGE_STYLE_ORDER,
];

export const EDITORIAL_IMAGE_STYLES = {
	editorial_collage: {
		id: 'editorial_collage',
		label: 'Редакционный коллаж',
		shortLabel: 'Коллаж',
		description:
			'Бумажный коллаж с мягким офсетным зерном, вырезанными формами и интеллектуальной журнальной подачей.',
		era: 'legacy',
		visualMode: 'abstract-collage',
		palette: ['warm paper', 'charcoal', 'muted olive', 'acid green accent'],
		medium: 'paper collage',
		subjectBias: ['теории', 'иллюзии', 'эссе'],
		avoid: ['literal interfaces', 'mascot robots', 'corporate stock pose'],
		bestFor: ['theories', 'illusions', 'column'],
		fallbackPriority: ['human_collage', 'editorial_still_life'],
		promptStyle:
			'Style family: refined editorial paper collage, layered cut-paper silhouettes, offset print realism, soft misregistration, restrained analog texture, intelligent magazine art direction.',
	},
	signal_network: {
		id: 'signal_network',
		label: 'Сигнальная сеть',
		shortLabel: 'Сеть',
		description:
			'Модульная сеть сигналов, каналов и узлов: аккуратная связность, порты, контуры и инженерная абстракция.',
		era: 'legacy',
		visualMode: 'system-network',
		palette: ['paper white', 'graphite', 'smoked glass', 'acid green signal'],
		medium: 'diagrammatic object system',
		subjectBias: ['агенты', 'интеграции', 'рабочие контуры'],
		avoid: ['busy dashboard UI', 'neon cyberpunk', 'floating holograms'],
		bestFor: ['automations', 'innovations', 'protocols'],
		fallbackPriority: ['editorial_still_life', 'documentary_frame'],
		promptStyle:
			'Style family: modular editorial network illustration, elegant nodes and channels, restrained systems-diagram energy without literal UI, sleek matte materials, abstract operational infrastructure.',
	},
	industrial_plate: {
		id: 'industrial_plate',
		label: 'Индустриальная пластина',
		shortLabel: 'Индустрия',
		description:
			'Плотная индустриальная метафора: металл, энергия, стойки, щиты, ритм производства и нижние этажи инфраструктуры.',
		era: 'legacy',
		visualMode: 'industrial-abstract',
		palette: ['warm paper', 'iron black', 'concrete beige', 'acid green power line'],
		medium: 'industrial object study',
		subjectBias: ['вычисления', 'энергия', 'стройка'],
		avoid: ['sci-fi skyline', 'blazing neon', 'empty decorative geometry'],
		bestFor: ['trajectories', 'tendencies', 'infrastructure'],
		fallbackPriority: ['editorial_still_life', 'documentary_frame'],
		promptStyle:
			'Style family: industrial editorial still life, brushed metal, grid discipline, power-distribution forms, infrastructural mass, calm technical monumentality with paper-toned lighting.',
	},
	threshold_space: {
		id: 'threshold_space',
		label: 'Пороговое пространство',
		shortLabel: 'Порог',
		description:
			'Архитектурный режим доступа: шлюзы, коридоры, рамки, барьеры, допуск и институциональный контроль.',
		era: 'legacy',
		visualMode: 'institutional-threshold',
		palette: ['stone white', 'graphite', 'smoked glass', 'olive signal'],
		medium: 'architectural staging',
		subjectBias: ['допуск', 'регулирование', 'режим доступа'],
		avoid: ['futurist spaceship corridors', 'blue neon', 'hard sci-fi armor'],
		bestFor: ['generations', 'regulations', 'access'],
		fallbackPriority: ['civic_blueprint', 'documentary_frame'],
		promptStyle:
			'Style family: architectural threshold illustration, corridor logic, controlled access, ceremonial gateways, glass-and-stone minimalism, quiet authority, premium editorial staging.',
	},
	quiet_monument: {
		id: 'quiet_monument',
		label: 'Тихий монумент',
		shortLabel: 'Монумент',
		description:
			'Один крупный символический объект с высокой визуальной массой: власть, капитал и тяжёлые решения без плакатности.',
		era: 'legacy',
		visualMode: 'symbolic-monument',
		palette: ['parchment', 'charcoal', 'dusty bronze', 'olive cut'],
		medium: 'symbolic object study',
		subjectBias: ['рынок', 'капитал', 'власть'],
		avoid: ['hero poster rhetoric', 'golden excess', 'literal currency symbols'],
		bestFor: ['russia', 'market-power', 'capital'],
		fallbackPriority: ['civic_blueprint', 'editorial_still_life'],
		promptStyle:
			'Style family: singular monumental object study, sculptural editorial realism, calm symbolic power, matte surfaces, long shadows, lots of negative space, premium print sensibility.',
	},
	documentary_frame: {
		id: 'documentary_frame',
		label: 'Документальный кадр',
		shortLabel: 'Кадр',
		description:
			'Живой фото-редакционный образ с человеческим масштабом, естественным светом и реальной средой вместо холодной абстракции.',
		era: 'primary',
		visualMode: 'documentary',
		palette: ['warm daylight', 'skin tones', 'slate blue', 'oxide red', 'soft green accent'],
		medium: 'editorial photography',
		subjectBias: ['команды', 'рабочая среда', 'полевые сюжеты', 'городская инфраструктура'],
		avoid: ['generic corporate handshake', 'stock smiling office', 'over-stylized cinema poster'],
		bestFor: ['automations', 'russia', 'tendencies'],
		fallbackPriority: ['editorial_still_life', 'civic_blueprint'],
		promptStyle:
			'Style family: restrained documentary editorial photography, believable human scale, warm natural light, tactile real-world surfaces, magazine reportage without stock-photo cliches.',
	},
	scientific_lucid: {
		id: 'scientific_lucid',
		label: 'Светлая наука',
		shortLabel: 'Наука',
		description:
			'Светлая научная визуализация: лабораторная чистота, прозрачные материалы, ясная форма и спокойная интеллектуальная точность.',
		era: 'primary',
		visualMode: 'scientific',
		palette: ['lab white', 'silver', 'soft cobalt', 'burgundy', 'mineral green accent'],
		medium: 'scientific editorial render',
		subjectBias: ['биология', 'исследования', 'новые модели', 'математические структуры'],
		avoid: ['cartoon molecules', 'medical brochure stock', 'acid sci-fi glow'],
		bestFor: ['innovations', 'generations', 'theories'],
		fallbackPriority: ['editorial_still_life', 'human_collage'],
		promptStyle:
			'Style family: luminous scientific editorial image, translucent materials, precise forms, clean field depth, contemporary research aesthetic, no medical stock vibe, no cluttered infographic literalism.',
	},
	human_collage: {
		id: 'human_collage',
		label: 'Человеческий коллаж',
		shortLabel: 'Лица',
		description:
			'Коллаж из фотофрагментов, жестов, лиц, документов и культурных следов с более человеческой и журнальной подачей.',
		era: 'primary',
		visualMode: 'human',
		palette: ['paper cream', 'terracotta', 'plum', 'ink black', 'moss accent'],
		medium: 'photo-paper collage',
		subjectBias: ['культура', 'критика', 'язык', 'общественные эффекты ИИ'],
		avoid: ['meme collage chaos', 'too many cutouts', 'celebrity portrait logic'],
		bestFor: ['theories', 'illusions', 'generations'],
		fallbackPriority: ['editorial_collage', 'documentary_frame'],
		promptStyle:
			'Style family: high-end magazine photo collage, torn paper edges, human presence, cultural fragments, careful layering, warm analogue print energy, emotionally intelligent but restrained.',
	},
	civic_blueprint: {
		id: 'civic_blueprint',
		label: 'Гражданский чертёж',
		shortLabel: 'Чертёж',
		description:
			'Институциональная и картографическая графика: государственные контуры, архивы, планы и режимы допуска без тяжёлой бюрократической скуки.',
		era: 'primary',
		visualMode: 'civic',
		palette: ['vellum', 'dusty blue', 'slate', 'stone', 'civic green accent'],
		medium: 'architectural-map collage',
		subjectBias: ['государство', 'регулирование', 'архивы', 'допуск', 'нацпроекты'],
		avoid: ['literal government seals', 'patriotic poster rhetoric', 'sterile dashboard maps'],
		bestFor: ['regulations', 'russia', 'automations'],
		fallbackPriority: ['threshold_space', 'documentary_frame'],
		promptStyle:
			'Style family: civic editorial blueprint, institutional plans, archive paper, map-room geometry, measured authority, cooler palette, clear structure, intelligent public-systems atmosphere.',
	},
	editorial_still_life: {
		id: 'editorial_still_life',
		label: 'Предметная сцена',
		shortLabel: 'Предмет',
		description:
			'Предметная студийная сцена: один реальный объект как метафора, мягкий свет, ощутимые фактуры и ясная композиция.',
		era: 'primary',
		visualMode: 'still-life',
		palette: ['linen', 'charcoal', 'smoked glass', 'oxide red', 'selective green accent'],
		medium: 'studio still life',
		subjectBias: ['технологические релизы', 'память и вычисления', 'качество моделей', 'продуктовые сигналы'],
		avoid: ['sterile product ad', 'too much chrome', 'floating object on empty gradient'],
		bestFor: ['innovations', 'trajectories', 'generations'],
		fallbackPriority: ['scientific_lucid', 'documentary_frame'],
		promptStyle:
			'Style family: premium editorial still life, one or two tactile objects, controlled studio light, elegant negative space, conceptual product photography without ad gloss.',
	},
};

export const getEditorialImageStyle = (styleId) =>
	EDITORIAL_IMAGE_STYLES[styleId] ?? null;

export const isLegacyEditorialImageStyle = (styleId) =>
	LEGACY_EDITORIAL_IMAGE_STYLE_ORDER.includes(styleId);

export const isPrimaryEditorialImageStyle = (styleId) =>
	PRIMARY_EDITORIAL_IMAGE_STYLE_ORDER.includes(styleId);

