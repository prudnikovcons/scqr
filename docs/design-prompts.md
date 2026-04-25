# SCQR — Workflow для Claude Design

> Как мы делаем дизайн SCQR.RU в Claude Design (`claude.ai/design`, Opus 4.7). Этот файл — пошаговый workflow, а не сборник изолированных промптов. Один Project, последовательная генерация, итерация через inline comments.

## Как Claude Design работает

- Один **Project** держит ВЕСЬ сайт. Не открывай отдельные чаты под каждую страницу.
- Когда ты создаёшь Project, Claude **наследует design system** — это значит, что палитра, шрифты, компоненты задаются один раз, дальше каждая страница ими пользуется автоматически.
- Промпт работает по схеме «4 пункта»: **goal** (что строим), **layout** (как расположено), **content** (что внутри), **audience** (для кого). Длинные простыни инструкций не нужны.
- Уточнения делаешь двумя способами:
  - **Чат** — для широких изменений («сделай весь сайт строже», «убери все градиенты»).
  - **Inline comments** — кликаешь на конкретный элемент на canvas и пишешь короткое замечание. Быстрее, чем описывать словами.
- На входе можно использовать: текст промпта, screenshots, документы (DOCX/PPTX/XLSX), web-captures, codebase. Маскот-шит и mockup главной мы используем как screenshots.
- На выходе: PDF, PPTX, HTML, ZIP, Canva — а главное, **Handoff to Claude Code**: единый bundle с design tokens + component structure + intent per page. Мы используем именно его.

## Маскот — отдельный трек

Claude Design в UI-моках использует **плейсхолдеры маскота**, не финальные растры. Финальные PNG-обложки маскота во всех позах (для hero, banner, footer, 404 и т.д.) генерим **отдельно через Codex** (gpt-image-1.5) по тому же шиту, который у тебя уже есть. Я подготовлю промпты для Codex отдельно, когда дойдём до production-ассетов. В Claude Design на этапе мокапа используются placeholder'ы.

---

## Подготовка (один раз перед стартом)

1. Положи две картинки в репо: `docs/design-refs/mascot-sheet.png` и `docs/design-refs/homepage-mockup.png`. Они пригодятся и Claude Design, и мне при адаптации.
2. Зайди на [claude.ai/design](https://claude.ai/design) под своим Pro-аккаунтом. На вопросе «What do you do?» выбери **Product** (нам подходит больше всего — мы делаем продуктовые страницы, а не маркетинг).
3. Создай новый **Project** с именем `SCQR.RU` и описанием:
   `Russian-language analytical AI news publication. Light theme, violet/blue accent, mascot-driven illustrations, newspaper-archive feel. We build a full website: homepage, article page, archive, rubric, story cluster, topic, about, error states.`

Этот текст уйдёт в project context — Claude будет учитывать его в каждой генерации.

---

## Шаг 1 — Заложить design system

В новом Project, прежде чем рисовать страницы, поговори с Claude один раз про бренд. Прикрепи **обе картинки** (`mascot-sheet.png` и `homepage-mockup.png`) и отправь промпт:

````
Build the SCQR.RU design system and lock it in for the project.

Goal: a clean, analytical newsroom system — closer to RBC/CNews than to a SaaS landing. Light theme only.

Brand tokens (use these EXACTLY):
- Primary accent: violet #6C4DFF
- Secondary accent: blue #3AA0FF  
- Ink: #0D1117 (text), #333A45 (secondary text), #E6E8EC (borders)
- Paper: #FFFFFF (background)
- Soft tints (for banners, cards): violet-50 #F1EDFF, blue-50 #EBF5FF

Typography:
- Display & headings: Manrope, weight 700, tight letterspacing
- Body: Inter, weight 400-500, line-height 1.6
- Mono (timestamps): JetBrains Mono

Mascot: see attached mascot sheet. He's a white-and-graphite humanoid robot with round glasses, blue glowing eyes, "SCQR.RU" wordmark on chest. Personality: analytical, objective, smart, friendly. Use him as the SINGLE illustrative element across the site (avatar, hero, banners, empty states). No abstract blobs, no neon, no glassmorphism.

Components I'll need:
- Buttons: primary (violet bg), secondary (white + ink border), ghost
- Pills/tags: filled violet for "ГЛАВНОЕ"/featured, outline for categories, soft for "Новый выпуск"
- Cards: hero, standard article, mini news (for sidebar feed), event card with date block, rubric card with icon, podcast card
- Navigation: sticky top bar
- Inputs: text, search, newsletter inline
- Six rubric icons in soft chips: Модели, Инструменты, Бизнес, Исследования, Обучение, Мнение

Audience: Russian-speaking executives, analysts, researchers. Serious tone, no emoji in body, all UI strings in Russian.

Show me the design system on one canvas so I can review tokens and components before we move to pages.
````

После генерации:
- Если палитра/шрифты/маскот выглядят правильно — кликни **Save as project design system**. Все следующие страницы автоматически унаследуют это.
- Если что-то не так (например, маскот мультяшный или цвета сдвинулись) — уточняй через **inline comment** прямо на проблемном элементе. Не уходи в новый чат.

**Когда готов**, отправь мне ссылку на canvas или скриншот. Это первая контрольная точка.

---

## Шаг 2 — Главная страница

В **том же Project**, прикрепи `homepage-mockup.png` ещё раз и отправь:

````
Build the SCQR.RU homepage. Use the project design system.

Goal: replicate the structure of the attached homepage mockup, polished to production-ready quality. This is our most-visited page; layout decisions here drive other pages.

Layout (top → bottom):
1. Sticky header — wordmark "SCQR.RU" + tagline · nav (Новости, Статьи, Обзоры, Инструменты, Конкурсы, События, Видео, Подкасты, Словарь) · search · "Подписаться" button · mascot avatar
2. Hero (8/4) — left: "ГЛАВНОЕ" pill, headline "OpenAI представила GPT-4o — новую эру естественного общения с ИИ", lead, date, view count. Right: large mascot with tablet, surrounded by floating chart panels.
3. Sub-hero strip — 4 minor news cards in a row (Google Gemini, разработка ПО, Midjourney, Microsoft Copilot)
4. Two-column body:
   - Left main: subscription banner (mascot with +38% chart + 3 features + violet CTA), then "⚡ Популярное" with 1 large card + 3 stacked mini cards
   - Right sidebar: "Лента новостей" with 5 timestamped items (12:42, 11:31, 10:15, 09:47, Вчера 23:12), plus "События" block with 3 events (27 мая Конференция, 03 июн Митап, 10 июн Вебинар)
5. Rubrics grid — 6 cards in 3×2: Модели, Инструменты, Бизнес, Исследования, Обучение, Мнение (each with icon and short description)
6. Right column on rubrics row: "Подкаст SCQR Talk" card with mic illustration, episode title, "48:21" duration
7. Footer — wordmark · social row (Telegram, VK, YouTube, X, RSS) · 3 nav columns · mascot waving with "Увидимся в будущем!" speech bubble

Content: all in Russian, exact strings as listed above. Filler items use realistic AI-news headlines.

Audience: same as project — Russian readers of analytical AI media.

Don'ts: no carousels, no infinite scroll, no popup overlays, no marketing badges ("BEST AI NEWS!"), no decorative blobs.
````

После генерации:
- Главные правки делай через **inline comments**. Например, кликни на hero-картинку с маскотом → «маскот должен быть крупнее, занимать ~60% правой колонки, центрирован вертикально».
- Большие архитектурные изменения («сделай футер компактнее») — через чат.
- Анимации добавь после: «Add a subtle hover-lift on news cards (translate-Y -2px, shadow on)» — это работает.

**Контрольная точка**: главная согласована, ты готов идти к статье.

---

## Шаг 3 — Страница статьи

Она наследует header/footer/токены автоматически. Только новые блоки.

````
Build the SCQR.RU article page (single post). Reuse header and footer from homepage; design tokens from the project design system.

Goal: a calm, readable article surface where the verdict and context are visible without scrolling, and the body has room to breathe.

Layout:
- Article header (centered, max 1100px = 720 main + 320 sidebar):
  - Meta row: rubric pill "Траектории" (violet outline), format pill "Аналитика", reading-time chip "2 мин", date "24 апреля 2026, 13:40"
  - H1 "Почему рынок ИИ всё больше похож на инфраструктурную гонку, а не на гонку приложений"
  - Deck (lead, 2 lines)
  - Cover image (16:9, full main-column width)
- Right sticky sidebar (320px), 4 stacked blocks:
  1. "Вывод SCQR" — soft violet card with the verdict text
  2. "Основание публикации" — sourceNote
  3. "Темы" — outline tag pills
  4. "Сюжет: <storyCluster>" — soft blue card with mini timeline of related articles
- Article body (left, 720px) — Inter Body L, line-height 1.7, generous paragraph spacing. Include 2 inline figures with caption: <figure class="article-graphic"> placeholder with simple bar/line SVG and short caption.
- Author block — 48px mascot avatar + "Подготовлено редакцией SCQR" + ISO date
- Related articles — 3 cards in a row, "Ещё по теме «<storyCluster>»"
- Story navigation strip — full-width soft bg, horizontal timeline of dated dots with article titles, current position highlighted with violet ring
- Newsletter inline (compact version of homepage banner)
- Footer

Content: Russian text throughout. Body is 6 paragraphs of placeholder analytical Russian (not lorem latin).

Audience: same as project.

Don'ts: no comments, no social-share floating bar, no read-progress bar, no "Recommended for you" personalised algo block.
````

После генерации, ключевая правка: правый сайдбар должен **stick на скролле** ниже шапки. Через inline comment проверь.

---

## Шаг 4 — Архив

````
Build the SCQR.RU archive page. Reuse header/footer/tokens.

Goal: a calm filterable list of all materials, closer to a newspaper archive than to a social feed.

Layout:
- Page intro (centered, max 700px): "АРХИВ" pill, H1 "Все материалы SCQR", description, mini-stats row "1 282 материала · 9 рубрик · 41 неделя"
- Sticky filter row: format chips (Все · Новости · Аналитика · Колонки), rubric dropdown, sort dropdown, search input
- Two columns (8/4):
  - Left: list of articles as ROWS (not cards) — each row: 120×120 thumbnail, then format+rubric+time+date row, headline, 2-line lead, topic chips, views count on the right. Hover: violet 3px left edge bar appears. 1px ink-100 divider between rows. 12 rows visible, then "Показать ещё 20" ghost button.
  - Right sidebar: "Активные сюжеты" block (5 stories with material count badges), "Топ источников недели" block (5 items), "Карта рубрик" block (9 small pills with counts)

Content: Russian, realistic AI-news headlines in filler.

Don'ts: no infinite scroll, no date range picker, no sponsor banners.
````

---

## Шаг 5 — Рубрика

````
Build the SCQR.RU rubric page (example: "Траектории").

Goal: per-rubric hub with a slight identity tint, but same skeleton across all 9 rubrics.

Layout:
- Hero (full-width, soft tinted background — for "Траектории" use blue-50 #EBF5FF):
  - Left (8 cols): rubric icon in colored chip, H1 "Траектории", description, stats row, RSS pill
  - Right (4 cols): mini list of 3 latest articles with thumbnails
- Featured strip — 1 hero article + 3 secondary cards (8/4)
- Body — same archive-row list (filtered to this rubric), 20 rows + "Показать ещё"
- Sidebar:
  - "Соседние рубрики" — 6 small chips with mini counts
  - "Сюжеты этой рубрики" — 3-5 stories
- Bottom — two large nav cards: ← previous rubric · next rubric →
- Footer

Audience and tokens: project defaults.

Don'ts: no per-rubric subscription, no advertisers.
````

---

## Шаг 6 — Сюжет (Cluster)

````
Build the SCQR.RU cluster (story) page (example: "Инфраструктурная гонка").

Goal: a developing story across multiple SCQR materials, presented chronologically.

Layout:
- Hero (full-width, soft violet #F1EDFF):
  - "СЮЖЕТ" pill, H1 "Инфраструктурная гонка", description, anchor panel on the right with mascot (analytical pose) + meta "Сюжет ведут с 9 января 2026 · 12 материалов · последнее обновление 4 дня назад"
  - Below: short summary box (3-4 sentences) — current state of the story
- Vertical timeline:
  - Violet line on the left
  - Each material is a node: date (mono, ink-700), then medium article card to the right
  - The latest entry has "ТЕКУЩАЯ ТОЧКА" pill above
  - Show 8-12 entries, mixing news and analysis
- Cluster verdict (full-width, soft tint): section heading "Куда идёт сюжет", 2-3 paragraph editorial summary, closing line in larger weight
- Related clusters — 3 cards: "Регулирование 2026", "Энергетика и ИИ", "Корпоративный ИИ"
- Subscribe inline — "Получать обновления этого сюжета"
- Footer

Don'ts: default reverse-chrono. Stories run forward in time.
````

---

## Шаг 7 — Тема (Topic)

````
Build the SCQR.RU topic page (example: "OpenAI") — lighter than rubric or cluster.

Goal: tag-based collection. Compact, archive-row layout.

Layout:
- Hero compact (200px tall, no decorative bg, thin violet underline):
  - "ТЕМА" pill, H2 "OpenAI", 1-line description, stats "47 материалов · 8 рубрик · упоминания с января 2026"
- Filter row — format chips, rubric secondary filter, sort
- Archive-row list, 30 rows + pagination
- Sidebar:
  - "Связанные темы" — tag cloud of co-occurring topics
  - "Сюжеты с темой" — list of clusters that include this topic
- Footer

Don'ts: no cover image for the topic, no "subscribe to topic", no per-topic hero illustration.
````

---

## Шаг 8 — About

````
Build the SCQR.RU about page.

Goal: honest, plain Russian, mascot as visual anchor (1-2 appearances), no marketing copy.

Layout:
- Hero (centered, max 800px): "О ПРОЕКТЕ" pill, H1 "SCQR — аналитическое издание об искусственном интеллекте", lead
- Two-column "What we do / What we don't" (8/8):
  - Left soft-violet card "Что мы делаем" with 4 short statements
  - Right soft-blue card "Чего мы не делаем" with 4 short statements
- "Как устроена редакция" — 4-step horizontal flow (Сигналы → Рецензия → Производство → Публикация), each step with mascot pose and one-sentence description
- Editorial principles — 4-5 short paragraphs, max 700px, 2-column on desktop
- Team / contact — small grid of placeholder editor avatars + contact card (email, Telegram, RSS)
- Footer

Don'ts: no audience/engagement statistics, no partner-logos strip, no "join our team" CTA.
````

---

## Шаг 9 — 404 + Empty states

Один промпт на четыре маленьких компонента:

````
Build a pack of 4 small state components for SCQR.RU on one canvas.

Goal: graceful failure states with mascot as visual anchor and helpful actions. Centered, generous padding, only ONE illustration per state (the mascot in different pose).

1. NotFound404 — mascot "thinking/confused" pose, H2 "Страница не нашлась", lead "Адрес исчез или его никогда не было. Бывает.", 3 helpful link cards (← На главную · Открыть свежий выпуск · Сообщить об ошибке)
2. EmptyRubric — mascot "writing in notebook" pose, H3 "В этой рубрике пока пусто", lead "Скоро здесь появятся материалы. А пока — посмотрите соседние рубрики.", row of 3 rubric suggestion cards
3. SearchNoResults — mascot with magnifying glass, H3 "По запросу «<query>» ничего не нашлось", lead "Попробуйте короче или другими словами. Или загляните в архив — там 1 200+ материалов.", quick chips (Архив · Сюжеты · Все рубрики)
4. NetworkError — mascot looking at broken plug, H3 "Не удалось загрузить", lead "Похоже, что-то с соединением. Попробуйте обновить страницу.", primary button "Обновить"

Don'ts: no error icons, warning triangles, "DANGER" red banners. Mascot is the only illustration.
````

---

## Шаг 10 — Mascot pack (placeholders для нашей разметки)

````
Build a Mascot Pack reference page that shows where each mascot pose appears across the site.

Goal: a single canvas with each placeholder mascot illustration we'll use, plus a caption "Use in: <where>".

Show 12 placeholders at consistent 240×240 size on white bg with soft violet 5% radial glow:
1. Avatar 32/48/96px (head 3/4) — header, footer, comment author
2. Hero — explaining (raised finger) — About page step "Производство"
3. Hero — with tablet+chart — homepage hero, subscription banner
4. Hero — typing on laptop — Article footer "ИИ-редактор"
5. Hero — waving — homepage footer corner with speech bubble
6. State — thinking — 404, EmptyRubric
7. State — magnifying glass — Search no-results
8. State — broken plug — NetworkError
9. State — writing in notebook — EmptyRubric
10. Sticker — thumbs up + heart — success toasts
11. Sticker — peace sign — onboarding
12. Sticker — confused face — inline 404

These are placeholders for layout. Final raster mascot art is generated separately via Codex / gpt-image-1.5 — but we need the slots in place now so the layout is final.

Match the project mascot exactly: white-and-graphite humanoid, big round glasses, blue glowing eyes, "SCQR.RU" on chest.
````

---

## Шаг 11 — Handoff в Claude Code

Когда все 10 страниц/компонентов в Project выглядят правильно:

1. Открой каждую страницу, проверь mobile breakpoint (есть отдельная вкладка) — поправь то, что плохо стопится.
2. Жми **Export → Handoff to Claude Code**. Это создаст bundle с design files + design tokens + component structure + intent per page.
3. Выкачай ZIP архив или дай мне ссылку на handoff (если сервис делает share-link).
4. Я разворачиваю в `site/src/components/_designs/` как референс, добавляю Tailwind 4 в `site/`, и переписываю Astro-компоненты под новую систему.

## Лучшие практики, которых стоит держаться

- **Один Project, не много чатов.** Все следующие шаги стоят на design system, который ты заложил на шаге 1.
- **Inline comments вместо описаний словами.** Кликни на проблему, напиши «крупнее на 20%», а не «во втором блоке слева, в третьем card сверху».
- **Goal/layout/content/audience в каждом промпте.** Длинные ТЗ Claude Design не любит — тонет в деталях. Короткий, чёткий промпт + итерации.
- **Не спрашивай у Claude, как «правильно»** — он импровизирует. Указывай явно: «violet #6C4DFF, не другой».
- **Reference images важнее прозы.** Mockup и mascot-sheet делают за тебя половину работы.
- **Не спеши с handoff.** Перед export — пройдись по mobile breakpoint каждой страницы. После handoff менять структуру дороже, чем в Claude Design.

## Что НЕ делает Claude Design

- Финальные растровые иллюстрации маскота (placeholders only). Финальный mascot art — Codex / gpt-image-1.5.
- Backend-логику. Только front-end mockups.
- Реальный контент. Все статьи остаются как есть в `site/src/content/posts/`.

## После генерации

Дай знать, на каком шаге результат не сошёлся, и я подскажу формулировку правки. После handoff'а — я подключаю Tailwind в `site/`, переписываю компоненты, прогоняю build + Vercel preview, и только потом мёрж в main.
