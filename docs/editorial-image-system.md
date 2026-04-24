# SCQR Editorial Image System

## Цель
Держать все обложки SCQR в одном визуальном языке: не стоковая техно-иллюстрация, не баннер с текстом, а спокойная редакционная метафора для делового медиа об ИИ.

## Базовый стиль
- Формат: горизонтальная editorial cover image, удобно для карточки, статьи и главной.
- Подход: concept-driven illustration with print realism.
- Характер: взрослый, собранный, аналитический, без плакатной агрессии.
- Среда: светлая бумажная основа, мягкая фактура, ощущение качественного журнального разворота.
- Акцент: кислотно-зелёный SCQR как единственный яркий цветовой сигнал.
- Композиция: один главный образ, 1-2 вторичных сигнала, много воздуха, без визуального мусора.
- Фактура: бумага, офсет, тонкое зерно, мягкие тени, аккуратный коллажный слой.

## Что избегать
- буквальный “робот с экраном”
- неоновые футуристические города
- синий корпоративный сток
- интерфейсы, диаграммы и текст внутри обложки
- логотипы, водяные знаки, читаемые надписи
- мемность, киберпанк и дешёвый sci-fi

## Мастер-промт
```text
Use case: stylized-concept
Asset type: editorial cover image for SCQR article
Primary request: create a premium editorial illustration for a Russian-language AI industry magazine
Scene/backdrop: calm paper-toned background with subtle print grain and soft studio depth
Subject: one clear metaphor that expresses the article thesis without literal UI screenshots or robots
Style/medium: contemporary editorial illustration, refined analog collage, print-magazine realism, restrained 3D forms, elegant art direction
Composition/framing: horizontal composition, strong focal point, generous negative space, center or slightly off-center object, clean silhouette, built for website card and article hero
Lighting/mood: soft directional light, controlled contrast, serious and intelligent mood
Color palette: warm paper, charcoal, graphite, muted olive, SCQR acid green as a precise accent
Materials/textures: paper, brushed metal, smoked glass, matte plastic, faint ink and offset texture
Constraints: no text, no logos, no watermark, no people looking at camera, no generic stock-tech style, no blue neon cyberpunk, no clutter
Avoid: cheesy futurism, dashboard UI, literal chat bubbles, random server-room clichés, visual noise
```

## Адаптация под статьи
В каждый частный промт добавляем только:
- главный тезис материала
- центральную метафору
- 1-2 допустимые детали среды
- что именно должно стать кислотно-зелёным акцентом

## Первая пятёрка для главной

### 1. Корпоративные агенты выходят из пилота
- Тезис: агенты переходят из режима эксперимента в штатный контур компании.
- Метафора: модульные рабочие столы или архивные лотки, в которые аккуратно встраиваются светящиеся зелёные блоки решений.

### 2. Вычисления становятся главным дефицитом
- Тезис: рынок ИИ упирается в энергию, чипы и центры обработки данных.
- Метафора: тонкая энергосеть и стойки вычислений как промышленный распределительный щит с одним ярким активным контуром.

### 3. Корпоративный ИИ догоняет потребительский рынок
- Тезис: деньги и влияние смещаются из массового сегмента в корпоративный.
- Метафора: весы или двухконтурная система, где тяжёлый корпоративный блок перевешивает лёгкий массовый слой.

### 4. Протоколы для агентов становятся зоной риска
- Тезис: стандарт связи агентов вырос быстрее, чем зрелая защита вокруг него.
- Метафора: сеть из аккуратных портов и кабелей, где один зелёный канал даёт красивую связность, но в стыках видны трещины и уязвимость.

### 5. Большие лаборатории продают режим доступа
- Тезис: фронтирные лаборатории продают не только модель, а право входа в особый контур доступа.
- Метафора: архитектурный шлюз, пропускная рамка или изолированный световой коридор с ограниченным входом.

## Именование файлов
- Основной принцип: не перетирать существующие SVG-обложки без необходимости.
- Формат новых файлов: `<slug>-hero-v2.png`
- Папка: `src/assets/editorial/`
