export const EDITORIAL_IMAGE_STYLES = {
	editorial_collage: {
		id: 'editorial_collage',
		label: 'Редакционный коллаж',
		shortLabel: 'Коллаж',
		description:
			'Бумажный коллаж с мягким офсетным зерном, вырезанными формами и интеллектуальной журнальной подачей.',
		bestFor: ['theories', 'illusions', 'column'],
		promptStyle:
			'Style family: refined editorial paper collage, layered cut-paper silhouettes, offset print realism, soft misregistration, restrained analog texture, intelligent magazine art direction.',
	},
	signal_network: {
		id: 'signal_network',
		label: 'Сигнальная сеть',
		shortLabel: 'Сеть',
		description:
			'Модульная сеть сигналов, каналов и узлов: аккуратная связность, порты, контуры и собранная инженерная абстракция.',
		bestFor: ['automations', 'innovations', 'protocols'],
		promptStyle:
			'Style family: modular editorial network illustration, elegant nodes and channels, restrained systems-diagram energy without literal UI, sleek matte materials, abstract operational infrastructure.',
	},
	industrial_plate: {
		id: 'industrial_plate',
		label: 'Индустриальная пластина',
		shortLabel: 'Индустрия',
		description:
			'Плотная индустриальная метафора: металл, энергия, стойки, щиты, ритм производства и нижние этажи инфраструктуры.',
		bestFor: ['trajectories', 'tendencies', 'infrastructure'],
		promptStyle:
			'Style family: industrial editorial still life, brushed metal, grid discipline, power-distribution forms, infrastructural mass, calm technical monumentality with paper-toned lighting.',
	},
	threshold_space: {
		id: 'threshold_space',
		label: 'Пороговое пространство',
		shortLabel: 'Порог',
		description:
			'Архитектурный режим доступа: шлюзы, коридоры, рамки, барьеры, допуск и ощущение институционального контроля.',
		bestFor: ['generations', 'regulations', 'access'],
		promptStyle:
			'Style family: architectural threshold illustration, corridor logic, controlled access, ceremonial gateways, glass-and-stone minimalism, quiet authority, premium editorial staging.',
	},
	quiet_monument: {
		id: 'quiet_monument',
		label: 'Тихий монумент',
		shortLabel: 'Монумент',
		description:
			'Один крупный символический объект с высокой визуальной массой: власть, капитал, рынок и тяжёлые решения без плакатности.',
		bestFor: ['russia', 'market-power', 'capital'],
		promptStyle:
			'Style family: singular monumental object study, sculptural editorial realism, calm symbolic power, matte surfaces, long shadows, lots of negative space, premium print sensibility.',
	},
};

export const EDITORIAL_IMAGE_STYLE_ORDER = Object.keys(EDITORIAL_IMAGE_STYLES);

