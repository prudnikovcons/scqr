# SCQR.RU — Design System

**SCQR.RU** is a Russian-language analytical AI news publication (новости искусственного интеллекта). The product feel sits closer to a traditional online newsroom — RBC, CNews, Kommersant — than to a SaaS landing page. The site is read primarily by Russian-speaking executives, analysts, and researchers who want a serious, dispassionate digest of model launches, tooling, business moves, and applied research.

The brand has one mascot — a friendly white-and-graphite humanoid robot in round black glasses with glowing blue irises and an "SCQR.RU" wordmark on his chest. He is the **single illustrative anchor** across the site (hero, banners, empty states, avatars, stickers). No abstract blobs, no neon halos, no glassmorphism, no AI-slop gradients.

> Tone: умный, внимательный, объективный — analytical, attentive, objective.

## Sources

- `uploads/homepage-mockup.png` — single-page reference of the production homepage at desktop width.
- `uploads/mascot-sheet.png` — the mascot bible (views, poses, stickers, colour palette, character traits).

Both originals are also kept in `assets/reference/` so they survive once `uploads/` is cleared.

No codebase or Figma file was provided — every value below was either dictated in the brief or measured directly off the two reference images. If you have a Figma file or repo, attach it via the Import menu and I will reconcile.

---

## Index

| File / folder | What's inside |
|---|---|
| `colors_and_type.css` | Design tokens (colours, type, spacing, radii, shadows) + element/semantic resets. Drop-in via `<link>`. |
| `assets/mascot/` | Cropped mascot images — hero, face, thinking pose, 7 stickers. Use these directly. |
| `assets/reference/` | Original uploaded references kept for inspection. Do **not** use in production output. |
| `fonts/` | (empty — fonts loaded from Google Fonts CDN; see Caveats) |
| `preview/` | Standalone HTML cards that populate the Design System tab. One concept per card. |
| `ui_kits/website/` | High-fidelity recreation of the SCQR.RU homepage with reusable JSX components. |
| `SKILL.md` | Skill manifest — makes this folder usable as a Claude Code agent skill. |
| `README.md` | This file. |

---

## Visual Foundations

### Colour
- **Primary accent — Violet `#6C4DFF`.** Used for primary buttons, the featured-tag pill ("ГЛАВНОЕ"), the newsletter CTA strip, links on hover, the SCQR wordmark colour, and the rubric icon strokes. Never as a full-bleed page background.
- **Secondary accent — Blue `#3AA0FF`.** Used for the mascot's eye glow, secondary highlights, occasional inline emphasis, and the "Будь в курсе…" gradient counterpart.
- **Soft tints — `#F1EDFF` (violet-50) and `#EBF5FF` (blue-50).** These carry banners, the newsletter strip, the podcast card, and rubric icon chips. They are the only "filled" backgrounds the page uses.
- **Ink stack — `#0D1117 / #333A45 / #5A6472`.** Headlines and primary text are full ink; body text uses the 700 stack for slightly softer reading; meta/timestamps use the 500 stack.
- **Borders — `#E6E8EC`.** The newsroom feel comes from thin, neutral 1px hairlines around cards and between rows. We never substitute shadow for a missing border.
- **No status floods.** Success/warning/danger exist as tokens but are reserved for actual UI feedback (form errors, confirmations) — they don't appear on editorial surfaces.

### Type
- **Display — Manrope 700/800, tight tracking (-0.02em / -0.025em).** Headlines, hero titles, section headers ("Популярное", "Рубрики"), tag pills.
- **Body — Inter 400/500, line-height 1.6.** All running prose, card subtitles, paragraphs.
- **Mono — JetBrains Mono 500.** Reserved for **timestamps** in the news feed ("12:42", "Вчера, 23:12"). Mono is a precision signal here, not decoration; do not use it for body or labels.
- **Eyebrows / rubric labels — Manrope 700, 12px, uppercase, tracking 0.08em.** "ГЛАВНОЕ", "Модели", "Бизнес", "Исследования", etc.
- **Headlines balance, paragraphs pretty.** `text-wrap: balance` on h1–h3, `text-wrap: pretty` on p — Russian phrases are long and orphans look ugly otherwise.

### Spacing & layout
- **4 px base unit.** Tokens go 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80.
- **Container 1200px** with 24px gutters. The homepage is a 2-column grid: a wide editorial column (~66%) and a sidebar feed column (~34%) separated by 24px.
- **Cards stack tight.** Vertical rhythm inside a card is 8 → 12 → 16, not 16 → 24 — newsrooms are dense.
- **Section spacing 48–64px** between major regions (Hero → Популярное → Рубрики → Footer).

### Surfaces, borders, shadows
- The page is paper-white. Cards are paper-white-on-paper-white separated by a 1px `#E6E8EC` border. **Borders do the work; shadows are almost absent.**
- Three shadow tokens exist (`--shadow-1/2/3`) but in the system we lean on `--shadow-1` (a barely-there 1–2px) for hover lift and reserve `--shadow-2` for floating menus / dropdowns. Editorial cards default to `--shadow-0`.
- Corner radii: **8px** for inputs and standard cards, **12px** for feature/banner blocks, **16px** for the podcast card and any large hero banner. Pills use `999px`. The newspaper feel rejects pill-shaped containers for anything except tags.

### Backgrounds & imagery
- No full-bleed gradients, no repeating patterns, no textures, no decorative SVG flourishes.
- The newsletter banner uses a flat `--violet-50` block with the mascot image bleeding off the left edge.
- Article thumbnails are 16:9 photo or product shots, no overlays. Mini-feed thumbnails on the sidebar are 56×56 squares (logo / brand mark of the company being reported on — OpenAI, NVIDIA, etc).
- The mascot is the only illustration that ever appears. Use him at high contrast against white.

### Animation, hover, press
- **Animations are minimal and fast (120–180ms, ease-out).** Hover transitions on buttons / links / cards. No bounces, no springs.
- **Hover states**:
  - Buttons: darken background by one step (`violet-500 → violet-600`).
  - Cards: 1px border darkens to `--line-strong` and a `--shadow-1` appears — the card "lifts a hair".
  - Links: violet-600 text + 2px underline offset.
  - Rubric chips / soft pills: tint deepens by ~6% (violet-50 → violet-100 light).
- **Press states**: bg darkens one more step (`violet-600 → violet-700`); no scale transform. The site is a serious newsroom — buttons don't bounce.
- **Focus**: 3px violet @25% alpha ring (`--shadow-focus`). Always visible on keyboard focus.

### Transparency & blur
- Sticky top nav uses `rgba(255,255,255,0.92)` + `backdrop-filter: blur(8px)` so headlines scrolling behind it remain readable. That is the **only** blur surface.
- No frosted-glass cards, no translucent overlays elsewhere. No glassmorphism.

### Imagery treatment
- Cool-leaning, neutral. Photos are unprocessed editorial — no warm filters, no duotones, no grain. The robot mascot lives against soft lavender-blue UI mock backgrounds in the hero.
- Logo thumbnails (mini-feed) are vector marks on white squares with a 1px border, no shadow.

---

## Content Fundamentals

### Language & tone
- **All UI strings in Russian.** Date formats follow Russian conventions ("16 мая 2024", "Вчера, 23:12"). Time uses 24-hour HH:MM.
- Tone is **dispassionate analytical**: third-person, objective. Headlines describe what happened, not how the writer feels about it. No exclamation marks in headlines. No questions in headlines except where the article genuinely poses one.
- Address: predominantly **impersonal / third-person** ("Anthropic выпустила Claude 3.5", "Модель понимает текст…"). When the publication speaks directly to the reader, it uses **«ты»** in marketing CTAs ("Будь в курсе будущего вместе с SCQR.RU", "Увидимся в будущем!") — friendly but not overly familiar. Never «вы» — that would feel corporate-stiff for a newsroom that owns a mascot.
- **No emoji in body copy or headlines.** Use icon glyphs (eye for views, calendar for dates) sparingly and only as small inline marks.
- Numbers: thousands separator is a non-breaking space ("12 684", "8 932"). Currency in articles uses "$2 млрд", "₽15 млн".

### Casing
- Headlines: **sentence case** (only the first word and proper nouns capitalised) — "OpenAI представила GPT-4o — новую эру естественного общения с ИИ".
- Tags / pills / rubrics: **UPPERCASE** with letter-spacing — "ГЛАВНОЕ", "МОДЕЛИ", "БИЗНЕС", "ИССЛЕДОВАНИЯ", "ОБУЧЕНИЕ", "МНЕНИЕ", "ИНСТРУМЕНТЫ".
- Section titles ("Популярное", "Рубрики", "События", "Подкаст SCQR Talk"): **Title case for the first word only** (Russian convention).
- Buttons: **Sentence case**, infinitive or imperative — "Подписаться на рассылку", "Подписаться", "Все новости", "Больше новостей", "Календарь событий".

### Voice samples (from the brief & mockup)
- Hero subhead: "Модель понимает текст, изображения и звук одновременно. Общение стало быстрее, естественнее и контекстнее."
- Newsletter pitch: "Будь в курсе будущего вместе с SCQR.RU"
- Newsletter feature bullets (terse, no full sentences): "Только проверенные новости" / "Экспертные мнения и аналитика" / "Удобно, быстро и без воды"
- Mascot tagline: "Увидимся в будущем!"
- Rubric subtitles (one phrase, no period): "новости о нейросетях и моделях", "сервисы и платформы на базе ИИ", "ИИ в компаниях и стартапах"

### Don'ts
- No marketing puffery ("революционный", "невероятный", "мощнейший"). Let facts speak.
- No emoji as bullets or accents.
- No exclamations on news headlines.
- No "click here" / "узнайте больше" — links carry verbs that describe the destination.

---

## Iconography

The brief did not ship an icon set, and no codebase was provided. The reference homepage uses two distinct icon systems we need to honour:

1. **Rubric icons** — six chunky violet line-icons in soft violet chips (Модели = stacked cubes / network, Инструменты = wrench-cross, Бизнес = briefcase, Исследования = flask, Обучение = open book, Мнение = speech bubble). The line weight is medium (~2px stroke), corners slightly rounded, fill is `--violet-500` line on `--violet-50` background chip.
2. **UI affordance icons** — small (16–18px) line icons in `--ink-700` for nav (search 🔍, eye, calendar, location pin, play, chevron, arrow-right, RSS).

**Substitution chosen: [Lucide Icons](https://lucide.dev) via CDN** — same line weight, similar geometry, free, well-maintained. Used throughout `ui_kits/website/`. Exact mappings:

| Concept | Lucide name | Usage |
|---|---|---|
| Search | `search` | Top nav |
| Bell / subscribe | `bell` | Mobile (not used on desktop) |
| Eye (views) | `eye` | Article meta |
| Calendar | `calendar` | Event card |
| Map pin | `map-pin` | Event card |
| Play | `play` | Video thumbs, podcast |
| Chevron right | `chevron-right` | "All news" links |
| Lightning | `zap` | "Популярное" header |
| Cube grid | `boxes` | Rubric: Модели |
| Wrench | `wrench` | Rubric: Инструменты |
| Briefcase | `briefcase` | Rubric: Бизнес |
| Flask | `flask-conical` | Rubric: Исследования |
| Book open | `book-open` | Rubric: Обучение |
| Message square | `message-square` | Rubric: Мнение |

**Flagged substitution** — the rubric icons in the production mockup look custom-drawn (specifically the "Модели" stacked-cube glyph and "Инструменты" wrench cross). Lucide is the closest free CDN match; if you have the originals as SVG, drop them into `assets/icons/rubrics/` and I will swap them in.

**Emoji and unicode**: not used. There is no codebase emoji font, and the body-copy ban from the brief is enforced. Special characters used inline are limited to **«»** (Russian quotation marks), **—** (em-dash, not hyphen), **…** (ellipsis, not three dots), and **₽ $** for currency.

**Logos / marks**: the SCQR.RU wordmark itself is set in Manrope 800 with the "SCQR" portion in `--ink-900` and ".RU" in `--violet-500` (per the homepage and the mascot's chest plate). It is rendered as live text — there is no PNG/SVG logo file because Manrope is loaded.

---

## Caveats

1. **No Figma / no codebase.** Every spec was inferred from two PNGs and the brief. If the production site exists, hand it over and I'll reconcile spacing, exact icon shapes, and any tokens I missed.
2. **Mascot crops are bitmap.** Stickers, hero, face, and one pose were sliced out of the reference sheet. Backgrounds are very light grey (`#F4F5F7`-ish) — not transparent. They'll look right on white surfaces but will **edge-band** on tinted surfaces (violet-50, blue-50). If you can ship transparent PNGs of the mascot, that solves it everywhere. The `Newsletter Banner` component compensates by sitting the mascot on a white pedestal inside a violet-50 strip.
3. **Fonts are CDN-loaded.** No `.woff2` files have been bundled into `fonts/` because the brief specifies Manrope / Inter / JetBrains Mono — all three are first-class on Google Fonts and that's the most reliable source. If you self-host, drop the files into `fonts/` and add `@font-face` blocks to the top of `colors_and_type.css`.
4. **Rubric icons substituted with Lucide.** Flagged above — swap when you have the originals.

---

## How to use this system

1. Link `colors_and_type.css` once at the page level.
2. Open `ui_kits/website/index.html` to see every component in context.
3. For one-offs, copy the JSX components out of `ui_kits/website/` — they're self-contained.
4. For Claude Code: this folder is also a skill (`SKILL.md`).
