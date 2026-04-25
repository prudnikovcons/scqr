# SCQR — Промпты для Claude Design

> Готовые промпты для генерации дизайна сайта SCQR.RU в новом стиле (с маскотом-роботом, фиолетовым акцентом, AI-news-портал). Каждый промпт = отдельная сессия в Claude Design (claude.ai/new или artifacts).

## Перед началом — положи референсы в репо

Положи оба референса в `docs/design-refs/`:

1. `docs/design-refs/mascot-sheet.png` — маскот-шит (виды, позы, эмодзи, палитра).
2. `docs/design-refs/homepage-mockup.png` — макет главной.

К **каждой** сессии Claude Design прикрепляй обе картинки. Это критично: без референсов Claude угадывает, с референсами — точно попадает в стиль.

## Порядок генерации

Иди строго по этому порядку. Каждый шаг опирается на предыдущий.

| # | Промпт | Что генерируется | Зачем |
|---|---|---|---|
| 0 | Design System | Палитра, типографика, маскот guide, базовые компоненты (Button, Card, Pill, NavLink) | Фундамент для всего остального |
| 1 | Homepage | Главная страница целиком | Самый видимый артефакт, основа для остальных |
| 2 | Article Page | Статья (single post) | Второй по важности — куда чаще всего попадает читатель |
| 3 | Archive Page | Лента всех материалов с фильтрами | По типам: news/analysis/column |
| 4 | Rubric Page | Страница рубрики | Один из навигационных контуров |
| 5 | Cluster (Story) Page | Развивающаяся история во времени | Уникальный для SCQR контур |
| 6 | Topic Page | Лёгкая подборка по теме | Простая фильтрация |
| 7 | About Page | О проекте | Текстовая страница с маскотом |
| 8 | 404 + Empty States | Ошибки и пустые состояния | Полный комплект edge-cases |
| 9 | Mascot Illustrations Pack | Набор маскота во всех ключевых местах | Чтобы маскот жил на сайте, а не только на главной |

После каждого шага — забираешь сгенерированный код и говоришь мне: «готово, забирай». Я адаптирую в Astro-компоненты `site/`.

---

## Промпт 0 — Design System

Открой [claude.ai](https://claude.ai), новый чат. Прикрепи `mascot-sheet.png` и `homepage-mockup.png`. Вставь промпт ниже целиком.

````markdown
Create a complete design system for SCQR.RU — a Russian-language analytical AI news publication. The brand is positioned as serious, analytical, and modern, with a friendly robot mascot as the visual anchor.

## Reference images attached
1. Mascot sheet (white-and-black 3D robot-analyst with glasses, multiple poses, full color palette).
2. Homepage mockup (modern AI-news layout with hero, news feed sidebar, subscription banner, popular section, events, rubrics grid, podcast card, footer).

## Output
A single React component (Tailwind CSS) called `DesignSystem` that demonstrates ALL of the following on one page:

### 1. Brand identity
- Logo wordmark "SCQR.RU" (display weight, slight letterspacing, deep navy `#0D1117`).
- Tagline: "новости искусственного интеллекта" (small, muted, all lowercase).
- Mascot avatar (round badge, white background, mascot head 3/4 view) — show three sizes: 32px, 48px, 96px.

### 2. Color palette (use ONLY these — they map exactly to the mascot sheet)
- `--scqr-ink-900: #0D1117`  (primary text, deep ink)
- `--scqr-ink-700: #333A45`  (secondary text, graphite)
- `--scqr-ink-100: #E6E8EC`  (borders, subtle dividers)
- `--scqr-paper: #FFFFFF`     (background)
- `--scqr-violet-600: #6C4DFF` (PRIMARY accent — buttons, featured tags, active states)
- `--scqr-blue-500: #3AA0FF`   (SECONDARY accent — links on hover, eye-glow on mascot)
- Plus auto-derived tints: violet-50 `#F1EDFF`, violet-100 `#E0D6FF`, blue-50 `#EBF5FF` for soft backgrounds.

Render swatches with hex labels.

### 3. Typography
- Display (headlines, hero): Manrope or Inter, weight 700, tight letterspacing.
- Body: Inter, weight 400-500, line-height 1.6.
- Mono (timestamps, source codes): JetBrains Mono.

Show this scale (in display units, all in Russian):
- Display XL — 56/64 — "OpenAI представила новую модель"
- Display L  — 40/48 — "Раздел: Тенденции"
- Display M  — 28/36 — "Заголовок второго уровня"
- Heading L  — 22/28 — "Подзаголовок крупный"
- Heading M  — 18/24 — "Подзаголовок"
- Body L     — 16/26 — "Основной текст. SCQR помогает быстрее понимать, как меняется рынок ИИ."
- Body M     — 14/22 — "Метаданные, описания"
- Caption    — 12/16 — "Время чтения · 3 мин"
- Mono S     — 13/18 — "12:42"

### 4. Mascot character — SCQR Bot
The mascot is a white-and-graphite humanoid robot with round head, large blue glowing eyes, oversized round glasses, "SCQR.RU" wordmark on chest. Personality: analytical, objective, smart, reliable, modern, friendly. He is NOT a cute kid robot — he's a confident analyst.

Show on the design system page:
- Avatar (head 3/4, used in header right-corner badge).
- Full body — three poses: "explaining" (raised finger), "with laptop", "waving hello".
- Three emoji-style stickers (head only, expressions: thinking, thumbs-up with heart, peace sign).
- Caption under each: when to use it (e.g. "Avatar — header, footer, comments"; "Explaining pose — subscription banner"; "Sticker — empty states, success toasts").

### 5. Components

#### Button
- Primary (violet bg, white text, "Подписаться")
- Secondary (white bg, ink-900 border, "Все новости")
- Ghost (no bg, violet text, "Больше новостей →")
- Sizes: sm (32px), md (40px), lg (48px)
- States: default, hover, active, disabled, loading

#### Pill / Tag (for categories, breaking labels)
- Filled violet (e.g. "ГЛАВНОЕ", uppercase, 11px, weight 600, rounded-md)
- Outline (e.g. "Конференция")
- With dot prefix (e.g. "● Live") for events
- Soft (light violet bg with violet text, "Новый выпуск")

#### Article card variants
- Hero (large image left, headline + lead + meta right)
- Standard card (image top, title, lead, meta — for popular block)
- Mini card (small image, title, source dot, time — for news feed sidebar)
- Video card (thumbnail with play overlay)
- Event card (date block left, title + location + tag right)
- Rubric card (icon, title, short description, soft colored bg)
- Podcast card (microphone illustration, episode title, duration timestamp)

#### Rubric icons (six rubrics from homepage mockup)
- Модели — cube/box icon
- Инструменты — wrench
- Бизнес — briefcase
- Исследования — flask/test-tube
- Обучение — graduation cap
- Мнение — speech bubble
Each icon in its own colored soft pill (different soft tints — violet, blue, mint, peach, lavender, pink).

#### Navigation
- Top nav links (regular, hover-underline)
- Active nav link (violet underline)
- Search icon button
- Subscribe button (primary)

#### Form elements
- Text input ("Ваш email")
- Search input with icon
- Newsletter inline form (input + primary button on right)

#### Social icons row
- Telegram, VK, YouTube, X/Twitter, RSS — outline, 20px, ink-700, hover ink-900

### 6. Spacing & radius
- Base unit: 4px. Common spacings: 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- Radius scale: sm 6px / md 10px / lg 16px / xl 24px / full (pills).

### 7. Layout grid
- Container max-width: 1280px.
- Columns: 12, gutter 24px.
- Show a sample 8/4 split (main content + sidebar).

## Page structure of the design system render
- Section anchors at top (Brand, Color, Type, Mascot, Components, Layout).
- Each section as a clean panel with title, description in Russian, demo on the right.
- Light mode only (we don't need dark mode — site is permanently light, like CNews/RBC).

## Don'ts
- No gradients except subtle 0-8% on hero and subscription banner backgrounds.
- No glassmorphism, no neon, no startup-saas-decoration.
- No emoji in copy unless explicitly part of UX (rubric icons are SVG, not emoji).
- All text in Russian.
- Mascot is the ONLY illustrative element — no abstract shapes, no decorative blobs.

When done, label the file `scqr-design-system.tsx` so I can extract it.
````

---

## Промпт 1 — Homepage

Новый чат. Прикрепи обе картинки + (если уже есть) экспорт design-system из шага 0.

````markdown
Build the SCQR.RU homepage as a single-file React + Tailwind component.

## Reference images attached
- Mascot sheet (use mascot exactly as drawn: white-and-graphite robot with round glasses, blue glowing eyes, "SCQR.RU" on chest).
- Homepage mockup (target layout — match the structure precisely, polish typography and spacing).

## Brand & tokens (apply throughout)
- Primary accent: violet `#6C4DFF`
- Secondary accent: blue `#3AA0FF`
- Ink: `#0D1117` (text), `#333A45` (secondary text), `#E6E8EC` (borders)
- Paper: `#FFFFFF`
- Soft violet bg: `#F1EDFF`, soft blue bg: `#EBF5FF`
- Container max 1280px, 24px gutters
- Display font: Manrope/Inter 700; body Inter 400-500; mono JetBrains Mono

## Page sections (top to bottom)

### Header (sticky, 80px)
- Left: SCQR.RU wordmark + tiny tagline "новости искусственного интеллекта"
- Center: nav links — Новости, Статьи, Обзоры, Инструменты, Конкурсы, События, Видео, Подкасты, Словарь
- Right: search icon button, "Подписаться" primary button, mascot avatar (40px round)
- 1px bottom border on scroll

### Hero (8/4 grid)
**Left 8 cols:**
- Pill "ГЛАВНОЕ" (violet filled, uppercase, 11px)
- H1 (Display XL): "OpenAI представила GPT-4o — новую эру естественного общения с ИИ"
- Lead (Body L, 2 lines max): "Модель понимает текст, изображения и звук одновременно. Общение стало быстрее, естественнее и контекстнее."
- Meta row: date "16 мая 2024" + eye-icon "12 684 просмотра"

**Right 4 cols:**
- Big illustration of the mascot working with a tablet, surrounded by floating UI panels with charts. Soft violet+blue ambient glow behind. Mascot face uses the **explaining/working** pose (raised finger or holding tablet). Background tablets show small bar charts and pie charts.

### Sub-hero strip (4 minor news cards in a row, full width)
Each card: 280-320px wide, soft border, 16px radius, hover-lift.
Layout per card: large brand logo or thumbnail at top, then 2-line title.
Examples (all in Russian):
- Google logo → "Google представила Gemini 1.5 Pro"
- Code snippet thumbnail → "Как ИИ меняет разработку ПО"
- Landscape thumbnail → "Midjourney v6 уже доступен"
- Microsoft Copilot logo → "Microsoft Copilot получил память"

### Two-column main content (8/4 split)

**Right sidebar — Лента новостей (sticky on scroll above 1024px)**
- Section header: "Лента новостей" + ghost link "Все новости"
- 5 list items, each: time chip "12:42" (mono, violet bg), category tag "/ Модели" (small ink-700), 2-line title, round 40px avatar (source: A=Anthropic, R=Runway, NVIDIA, OpenAI, etc.)
- Bottom: secondary button "Больше новостей"

**Left main column:**

#### Subscription banner (full width, soft violet 5% bg, rounded-xl, 32px padding)
- Left: smaller mascot illustration with tablet showing line chart "+38%"
- Center: H3 "Будь в курсе будущего вместе с SCQR.RU" + 3 mini-features inline (icon + small label):
  ▢ Только проверенные новости  ▢ Экспертные мнения и аналитика  ▢ Удобно, быстро и без воды
- Right: primary button "Подписаться на рассылку"

#### Section "⚡ Популярное"
Section title with lightning emoji prefix.
Layout: 1 large card on left (60%) + 3 stacked smaller cards on right (40%).
- Large card: full-width image (abstract neural network purple/blue), title "Как ИИ-агенты изменят интернет в ближайшие 2 года", lead "Разбираемся, почему следующая волна ИИ — это не модели, а автономные агенты, которые действуют вместо нас.", date "15 мая 2024", eye "8 932"
- Mini cards (with play-button overlay for video):
  - "Sora от OpenAI вышла для всех — создаём видео по тексту" — date — eye
  - "5 нейросетей для работы и жизни, которые стоит попробовать прямо сейчас" — date — eye
  - "ИИ в медицине: новые открытия и реальные кейсы" — date — eye

### Right column — События (events sidebar) — same 4-col width as news feed
Section title "События" + ghost link "Все события"
3 event cards stacked:
- Date block (large day number, small month, e.g. "27 / МАЯ") + title "Конференция AI Journey 2024" + location "Москва, офлайн" + tag "Конференция"
- "03 / ИЮН" + "Митап AI Makers Saint Petersburg" + "Санкт-Петербург" + "Митап"
- "10 / ИЮН" + "Вебинар: Как внедрить ИИ в бизнес без боли" + "Онлайн" + "Вебинар"
Bottom: secondary button "Календарь событий"

### Rubrics grid (6 cards in 3×2 grid, full width)
- Section title "Рубрики" + ghost link "Все рубрики"
- Each card: icon in soft colored chip (each rubric has its own tint — violet, blue, mint, peach, lavender, pink), title, 1-2 line description
- Rubrics:
  1. Модели — "новости о нейросетях и моделях"
  2. Инструменты — "сервисы и платформы на базе ИИ"
  3. Бизнес — "ИИ в компаниях и стартапы"
  4. Исследования — "научные достижения и эксперименты"
  5. Обучение — "курсы, гайды и материалы"
  6. Мнение — "колонки экспертов и аналитика"

### Right column — Подкаст SCQR Talk
- Soft violet bg card
- "Новый выпуск" pill (small violet)
- H3: "Будущее рядом: стоит ли бояться сильного ИИ?"
- Body: "Говорим с исследователем ИИ о рисках, возможностях и границах технологий."
- Microphone illustration with audio waveform graphic
- Time stamp "48:21"
- "Все выпуски" ghost link in section header

### Footer
- Top section, 4 columns:
  1. Brand: SCQR.RU + tagline + 5 social icons (Telegram, VK, YouTube, X, RSS)
  2. Разделы: Новости, Статьи, Обзоры, Инструменты
  3. О сайте: О проекте, Команда, Контакты, Реклама
  4. Помощь: Подписка, Добавить новость, Правила сайта, Политика конфиденциальности
- Bottom: small mascot waving with speech bubble "Увидимся в будущем! 👋" (right-aligned)
- Copyright row: "© 2026 SCQR.RU" + small line

## States to demonstrate
- Default and one hover state per interactive element
- Mobile breakpoint hint (collapse nav to hamburger, sidebar moves below main, hero stack vertical)

## Russian copy throughout
- All visible text in Russian.
- Use the exact strings above for headlines.
- Filler items can use realistic AI-news headlines.

## Don'ts
- Don't replace mascot with a different character — match the reference exactly (white robot, glasses, blue eyes).
- Don't use any decorative blobs, gradients beyond subtle, neon glows, or saas-marketing patterns.
- Don't put emoji in body text (rubric icons are SVG, lightning ⚡ in Популярное section header is the only emoji).
- Don't crowd — generous whitespace between sections (64-96px vertical).

File name: `scqr-homepage.tsx`.
````

---

## Промпт 2 — Article Page

Новый чат. Прикрепи `mascot-sheet.png` + design-system артефакт из шага 0.

````markdown
Build the SCQR.RU article page (single post) as a React + Tailwind component.

## Reference images
- Mascot sheet (use sparingly — small avatar in author block).
- Use the design system tokens established earlier (violet `#6C4DFF`, blue `#3AA0FF`, ink `#0D1117`).

## Article data shape (placeholder)
- title: "Почему рынок ИИ всё больше похож на инфраструктурную гонку, а не на гонку приложений"
- deck: "Главная линия рынка проходит уже не между красивыми приложениями, а между теми, кто контролирует нижние этажи системы..."
- scqrVerdict: "Поэтому в ближайшие годы рынок ИИ будет выглядеть менее романтично, чем мечтали энтузиасты приложений."
- pubDate: "24 апреля 2026, 13:40"
- articleType: "analysis"
- rubric: "Траектории"
- topics: ["инфраструктура", "Jensen Huang", "OpenAI", "Anthropic"]
- readingTime: 2
- sourceNote: "Подготовлено на основе мартовского эссе Дженсена Хуанга, апрельских заявлений OpenAI и Anthropic."
- storyCluster: "Инфраструктурная гонка"

## Page structure

### Header
Same sticky header as homepage (logo, nav, search, subscribe button, mascot avatar).

### Article header (max 760px content + 320px right sidebar = 1100px wide centered)

**Top meta row (above title):**
- Rubric pill (violet outline) "Траектории"
- Format pill (ink outline) "Аналитика"
- Reading time chip (mono) "2 мин"
- Date "24 апреля 2026, 13:40"

**Title** (Display L, max 760px wide).

**Deck** (Body L, ink-700, max 700px).

**Cover image** — full-width within main column, 16:9 ratio, ~700px high; use placeholder gradient with mascot illustration overlaid bottom-right small.

### Sidebar (right, sticky, 320px) — appears AFTER scrolling past hero
Three blocks stacked:

#### 1. SCQR-вывод
- Soft violet card (16px radius)
- Small violet uppercase label "Вывод SCQR"
- The verdict text in larger weight, ink-900

#### 2. Основание публикации
- White card with ink-100 border
- Label "Основание публикации"
- The sourceNote text (Body M)

#### 3. Темы
- White card
- Label "Темы"
- Tag cloud (ink-outline pills): инфраструктура, Jensen Huang, OpenAI, Anthropic

#### 4. Сюжет (Story navigation)
- Soft blue bg card
- Label "Сюжет: Инфраструктурная гонка"
- Mini list of 3-4 articles in this storyCluster (date + short title), with current article highlighted

### Article body (left main column, 720px wide)

Body uses serif-like Inter for readability. Body L, line-height 1.7. Generous paragraph spacing 24px.

Include 2 inline figures:
- `<figure class="article-graphic">` with placeholder SVG-styled chart — caption "Верхние слои дают скорость и внимание, нижние — дефицит и власть."
- Another mid-article: caption "Каждый следующий слой рынка зависит от устойчивости предыдущего."

Body should have 6 paragraphs (lorem-style Russian-feeling text — keep tone analytical, no fluff).

### After body — Author/source block
- Small mascot avatar (48px) + "Подготовлено редакцией SCQR" + meta line "ИИ-редактор · 24 апреля 2026"

### Related articles (full content width)
"Ещё по теме «Инфраструктурная гонка»" — section title.
Grid of 3 article cards (medium variant from design system).

### Story navigation strip (full width, soft bg)
- Heading "Развитие сюжета"
- Horizontal timeline with 4-5 dated dots, each labeled with article title
- Current article position emphasized with violet ring

### Newsletter inline (smaller variant of homepage banner)
- Mascot mini avatar
- "Не пропускайте сильные материалы — раз в неделю подборка SCQR"
- Email input + primary button "Подписаться"

### Footer (same as homepage)

## Russian copy
All text in Russian, exactly as above where specified, lorem-Russian for body.

## Don'ts
- No comments section, no related-from-other-rubrics block (we keep article surface clean).
- No social-share floating bar (we test traffic via UTM, not vanity).
- No "Recommended for you" personalized algo block.
- No "estimated read progress bar" at top — we trust readingTime in header.

File: `scqr-article.tsx`.
````

---

## Промпт 3 — Archive Page

````markdown
Build the SCQR.RU archive page as a React + Tailwind component. This is the "all materials" hub, but readable like a newspaper archive, NOT like a social feed.

## Reference: design system + homepage from previous prompts.

## Page structure

### Header (same as elsewhere)

### Page intro (centered, max 700px)
- Pill "АРХИВ"
- Display L: "Все материалы SCQR"
- Body L: "Лента новостей, аналитика и колонки. Раздел работает без JavaScript: можно листать ленту, можно фильтровать по типу или рубрике."
- Quick stats row (3 mini-stats inline): "1 282 материала · 9 рубрик · 41 неделя"

### Filters row (sticky below header on scroll)
- Format chips (toggle group): Все · Новости · Аналитика · Колонки
- Rubric dropdown (chip with caret): "Все рубрики"
- Sort dropdown: "Сначала новые / Сначала важные"
- Search input (right)

### Main feed (split: 8 cols list + 4 cols meta sidebar)

**Main: list of articles, NOT a card grid — closer to newspaper archive style.**
Each row:
- Left: small thumbnail 120×120 (rounded-md)
- Center: format pill + rubric pill + reading time + date · then title (large, weight 600) · then 2-line lead · then topics as small ink-100 chips
- Right: views count (eye icon + number)
- Hover: violet left-edge bar appears (3px violet line)
- 24px padding, divider 1px ink-100 between rows

Show 12 rows, then "Показать ещё 20" ghost button.

**Sidebar (4 cols):**

#### Block 1 — "Линии сюжетов"
- White card
- Label "Активные сюжеты"
- 5 list items: small icon, story name, badge with material count
  Examples: "Инфраструктурная гонка (12)", "Регулирование 2026 (8)", "Российский рынок (15)", "Корпоративный ИИ (9)", "Безопасность агентов (6)"

#### Block 2 — "Топ авторов / источников недели"
- 5 list items with mascot or source logo + name + count

#### Block 3 — "Карта рубрик"
- 9 small pills in a free-form layout, each with material count

### Footer

## Russian copy
All in Russian.

## Don'ts
- No infinite scroll — we want predictable archive with explicit "show more".
- No "trending now" sticky widget — that's the homepage's job.
- No sponsor banners.
- No date range picker — keep filters minimal (format + rubric + sort + search).

File: `scqr-archive.tsx`.
````

---

## Промпт 4 — Rubric Page

````markdown
Build a Rubric Page for SCQR.RU as React + Tailwind. Example rubric: "Траектории" (analysis-heavy rubric).

Each rubric in SCQR has its own slight personality (color tint, intro voice), but the structure is the same.

## Page structure

### Header (same)

### Rubric hero (full width, soft tinted bg — for "Траектории" use soft blue `#EBF5FF`)
- Container 1280
- Left side (8 cols): rubric icon (large, in colored chip), Display XL "Траектории", Body L description "Долгие линии в развитии ИИ — куда движутся рынок, технологии и государственные подходы. Аналитика, которая опирается на цифры и факты, а не на хайп.", quick stats row (count of materials, average reading time, last update)
- Right side (4 cols): mini list of last 3 articles with thumbnails
- Bottom row of hero: pill "RSS" with copy URL + pill "Подписаться на ленту"

### Featured article strip (1 hero + 3 secondary in 8/4 layout)
- Hero card variant (large image left, headline right, like homepage hero but smaller)
- 3 cards in right column (mini variant from design system)

### Rubric body — list of materials
Same archive-style row layout (image + center content + views), but pre-filtered for this rubric.
20 rows, then "Показать ещё".

### Sidebar
#### "Соседние рубрики"
6 small rubric chips, each linking to its own page, with mini count.

#### "Сюжеты этой рубрики"
3-5 stories with material count each.

### Bottom — "Перейти в соседнюю рубрику"
- Two large nav cards: ← previous rubric · next rubric →

### Footer

## Don'ts
- No category-specific marketing (no "Subscribe to Tendentsii rubric only").
- No advertisers.
- Don't change typography per rubric — only color tint and icon.

File: `scqr-rubric-page.tsx`.
````

---

## Промпт 5 — Cluster (Story) Page

````markdown
Build a Cluster (Story) Page for SCQR.RU as React + Tailwind. This is a unique format: a story that develops over time, with multiple SCQR materials connected to it.

Example: cluster "Инфраструктурная гонка".

## Page structure

### Header

### Cluster hero (full width, soft violet `#F1EDFF` bg)
- Container 1280, content max 1000 centered
- Pill "СЮЖЕТ" (violet filled, uppercase)
- Display XL: "Инфраструктурная гонка"
- Body L: "Как лаборатории, чипмейкеры и государства борются не за лучший продукт, а за нижние этажи системы — энергию, чипы, дата-центры и право на масштаб."
- Right of headline: an "anchor" panel: small mascot illustration (analytical pose) + meta block "Сюжет ведут с 9 января 2026 · 12 материалов · последнее обновление 4 дня назад"
- Below headline: short summary box (3-4 sentences) — current state of the story.

### Story timeline (full width, scrollable horizontal on mobile, vertical on desktop)
Vertical timeline desktop:
- Vertical violet line on the left
- For each material in the cluster, a node:
  - Date (mono, ink-700)
  - Article card (medium variant) on the right
  - The very latest one has a "ТЕКУЩАЯ ТОЧКА" pill above it

Show 8-12 timeline entries, mixing news and analysis materials.

### Cluster verdict (full width, soft tint)
- Section title "Куда идёт сюжет"
- 2-3 paragraph editorial summary (in Russian, analytical tone)
- Closing line in larger weight: the latest scqrVerdict

### Related clusters
3 cards: "Регулирование 2026", "Энергетика и ИИ", "Корпоративный ИИ"

### Subscribe inline (smaller version of homepage banner — "Получать обновления этого сюжета")

### Footer

## Don'ts
- No reverse chronological default — stories run forward in time. Reader can flip with toggle, but default is chronological.
- No "Other readers also viewed" algo block.
- No comments.

File: `scqr-cluster-page.tsx`.
````

---

## Промпт 6 — Topic Page

````markdown
Build a lightweight Topic Page for SCQR.RU as React + Tailwind. Topic is lighter than Rubric or Cluster — it's just a tag-based collection.

Example: topic "OpenAI" — collects all articles tagged with this topic.

## Page structure

### Header

### Topic hero (compact, 200px tall, no decorative bg — just a thin violet underline below)
- Pill "ТЕМА"
- Display M: "OpenAI"
- 1-line description: "Материалы SCQR, упоминающие OpenAI как ключевого участника"
- Stats: "47 материалов · 8 рубрик · упоминания с января 2026"

### Filter row
- Format chips: Все / Новости / Аналитика / Колонки
- Rubric secondary filter: dropdown
- Sort: новые/старые

### List of materials
Same archive-row style as on Rubric/Archive pages.
30 rows max per page, pagination "Показать ещё".

### Sidebar
#### "Связанные темы"
Tag cloud of co-occurring topics (e.g. Anthropic, GPT-5, Stargate, OpenAI Blog).

#### "Сюжеты с темой"
List of clusters that include this topic.

### Footer

## Don'ts
- Topics are decoration, not navigation backbone. Don't make this page heavier than it needs to be.
- No cover image for the topic — only the simple underlined header.
- No "subscribe to this topic" — topics aren't subscription units.

File: `scqr-topic-page.tsx`.
````

---

## Промпт 7 — About Page

````markdown
Build the About page for SCQR.RU as React + Tailwind.

## Tone
Honest, direct, no marketing. Plain Russian. Mascot as the visual anchor (one or two appearances).

## Page structure

### Header

### Hero (centered, 800px max)
- Pill "О ПРОЕКТЕ"
- Display XL: "SCQR — аналитическое издание об искусственном интеллекте"
- Body L: "Мы помогаем разобраться, как ИИ меняет рынки, государство, корпоративную работу и научные дисциплины. Не быстрые новости, а вдумчивая аналитика."

### Two-column "What we do / What we don't" panel (8/8)
**Left card (soft violet bg):**
Heading "Что мы делаем"
- Разбираем сильные сигналы рынка ИИ
- Связываем новости в сюжетные линии
- Атрибутируем каждый факт к первоисточнику
- Публикуем материал только если есть тезис, а не просто новость

**Right card (soft blue bg):**
Heading "Чего мы не делаем"
- Не гонимся за скоростью
- Не публикуем рерайты без угла
- Не используем форумы и агрегаторы как источник
- Не делаем жёлтых заголовков

### How we work (full-width section, white bg)
- Section heading "Как устроена редакция"
- 4-step horizontal flow with mascot poses for each step:
  1. **Сигналы** — мascot icon (analyzing) — "Каждое утро система собирает 70+ источников"
  2. **Рецензия** — мascot (thinking) — "Редактор читает дайджест и пишет свободную рецензию"
  3. **Производство** — мascot (with laptop) — "Writer, editor и factchecker готовят материал"
  4. **Публикация** — мascot (waving) — "Финальный апрув — и материал на сайте"

### Editorial principles (long-form text, max 700px, 2 columns on desktop)
4-5 short paragraphs of editorial credo — adapt the rules from `docs/editorial-rules.md`. Russian, plain prose, no bullet lists in body.

### Team / Contact
- Small grid of editor avatars (placeholder), each with name + role
- Below: contact card with email, Telegram, RSS

### Footer

## Don'ts
- No marketing copy ("революционная платформа", "лидеры рынка").
- No statistics about audience size or engagement (we don't measure that publicly).
- No call-to-action "join our team" unless the team is hiring.
- No partner logos / "as seen on" strip.

File: `scqr-about.tsx`.
````

---

## Промпт 8 — 404 + Empty States

````markdown
Build a Pack of 4 small components for SCQR.RU as React + Tailwind: 404 page, empty rubric, search no results, network error.

Each is a small, self-contained component. The mascot is the visual anchor for each — different pose per state.

## Components

### 1. NotFound404
- Centered (800px max)
- Mascot in "thinking/confused" pose (large, ~200px)
- Display L: "Страница не нашлась"
- Body L: "Адрес исчез или его никогда не было. Бывает."
- 3 helpful links as cards: "← На главную · Открыть свежий выпуск · Сообщить об ошибке"

### 2. EmptyRubric
- For when a rubric has no materials yet (rare)
- Mascot "writing in notebook" pose
- Display M: "В этой рубрике пока пусто"
- Body M: "Скоро здесь появятся материалы. А пока — посмотрите соседние рубрики."
- Row of 3 rubric cards as suggestions

### 3. SearchNoResults
- Mascot with magnifying glass
- Display M: "По запросу «<query>» ничего не нашлось"
- Body M: "Попробуйте короче или другими словами. Или загляните в архив — там 1 200+ материалов."
- Quick chips: "Архив · Сюжеты · Все рубрики"

### 4. NetworkError
- Mascot looking at a broken plug
- Display M: "Не удалось загрузить"
- Body M: "Похоже, что-то с соединением. Попробуйте обновить страницу."
- Primary button: "Обновить"

## Common rules
- Light bg `#FFFFFF` or soft `#F9FAFB`
- Centered, generous padding (96px vertical)
- Mascot is the only illustration — no error icons, no warning triangles
- Russian only

File: `scqr-states.tsx` with all four exported.
````

---

## Промпт 9 — Mascot Illustrations Pack

````markdown
Generate a single React + Tailwind component called `MascotPack` that arranges all the mascot illustrations we'll need across the site, with usage notes.

## Reference: mascot sheet image attached.

## Output
A grid (3 cols) showing each mascot illustration with caption "Use in: <where>".

## Required illustrations

1. **Avatar 32/48/96px** — head 3/4 view, white bg circle, used in header, footer, comment author, deployment toast.
2. **Hero pose — explaining (raised finger)** — used on About page step "Производство".
3. **Hero pose — with tablet+chart** — used on homepage hero, subscription banner.
4. **Hero pose — typing on laptop** — used on Article Page footer "ИИ-редактор".
5. **Hero pose — waving (greeting)** — used in homepage footer corner with speech bubble.
6. **State pose — thinking (hand on chin)** — used on 404 and EmptyRubric.
7. **State pose — magnifying glass** — used on Search no-results.
8. **State pose — broken plug / network error** — used on NetworkError component.
9. **State pose — writing in notebook** — used on EmptyRubric.
10. **Sticker — thumbs up + heart** — used on success toasts ("Подписка оформлена").
11. **Sticker — peace sign / two fingers** — used in onboarding.
12. **Sticker — thinking / confused face** — used on 404 inline.

For each: render the illustration at consistent size (240×240) on white bg with soft violet 5% radial glow behind, label below "Use in: ..." Russian-to-English mix is fine for technical context.

## Style consistency rules
- Match the reference mascot sheet exactly: white-and-graphite robot, big round glasses, blue glowing eyes, "SCQR.RU" wordmark on chest
- All poses are 3D-rendered look (not flat/cartoon)
- Always face the viewer (3/4 view by default, full front for stickers)
- No props the original sheet doesn't have (no bowtie, no sneakers, no badges other than "SCQR.RU")

File: `scqr-mascot-pack.tsx`.
````

---

## После генерации — что я делаю

1. Ты приносишь экспорт каждого компонента (`.tsx` файл).
2. Я кладу их в `site/src/components/_designs/` как референс (не подключённый к роутингу).
3. Пере-портирую в Astro:
   - Tailwind 4 (если ещё не подключён в `site/`, добавляю), или используем CSS-переменные на токенах SCQR.
   - React → Astro: статичные компоненты переписываются 1:1, динамика через `client:load`.
   - Pages в `site/src/pages/` обновляются под новый layout.
4. Сохраняю `site/src/content/posts/*.md` без изменений — они адаптируются к новому ArticleLayout автоматически (схема та же).
5. Маскот-пак — складываю PNG-рендеры в `site/public/mascot/` + типизированный `<Mascot pose="explaining" size="md"/>` Astro-компонент.

## Замечания

- Мы НЕ используем Claude для генерации финальных растровых иллюстраций маскота. Claude Design делает HTML/React-mockups; финальные PNG/SVG маскота генерируешь в Codex (через `gpt-image-1.5`) по тем же позам — у нас уже есть маскот-шит как референс. Я подготовлю промпты для Codex отдельно, когда будем переходить к финальным ассетам.
- Цветовая палитра жёстко зафиксирована в каждом промпте (`#6C4DFF` и т.д.) — Claude не должен импровизировать.
- Все промпты явно говорят «Russian throughout» и список «Don'ts» — без этого Claude иногда добавляет saas-clutter и английские строки.

Когда готов — начинай с **Промпта 0** (Design System), скидывай мне результат, едем дальше по списку.
