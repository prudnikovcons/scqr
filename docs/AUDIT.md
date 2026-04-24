# SCQR Audit — состояние перед переделкой

Дата аудита: 2026-04-25. Исполнитель: Claude Code (Opus 4.7). Контекст: подготовка к реструктуризации по `docs/EXEC_PLAN.md`.

## Текущая структура

Репозиторий — `D:\CODEX\gitscqr\scqr\` (внутри более широкой директории `D:\CODEX\gitscqr\`, где `.git` сейчас лежит именно в `scqr/`).

```
D:\CODEX\gitscqr\
├── scqr/                              # git-репозиторий + Astro-сайт
│   ├── .git/                          # git root, main = origin/main
│   ├── astro.config.mjs
│   ├── package.json                   # name: scqr, Astro 6.1.9, Node >=22.12.0
│   ├── tsconfig.json
│   ├── docs/                          # 8 операционных документов
│   │   ├── agent-operating-model.md
│   │   ├── editorial-designer-operating-model.md
│   │   ├── editorial-image-briefs.md
│   │   ├── editorial-image-system.md
│   │   ├── editorial-wave-1.md
│   │   ├── editorial-wave-2.md
│   │   ├── site-redesign-roadmap.md
│   │   └── vercel-runbook.md
│   ├── src/
│   │   ├── content.config.ts          # Zod-схема для posts
│   │   ├── content/posts/             # 65 markdown-статей (2026-01-09 → 2026-04-24)
│   │   ├── components/                # 7 Astro-компонентов
│   │   ├── layouts/BlogPost.astro
│   │   ├── pages/                     # index, blog, cluster, rubric, topic, about
│   │   ├── data/                      # curation, editorial-image-styles
│   │   ├── lib/                       # site.ts, structuredData.ts
│   │   ├── assets/editorial/          # 63 SVG-иллюстрации (contributed/, incoming/)
│   │   ├── assets/fonts/              # Atkinson regular + bold
│   │   └── styles/                    # CSS
│   ├── scripts/                       # 6 mjs-скриптов
│   │   ├── create-post.mjs
│   │   ├── validate-content.mjs
│   │   ├── generate-editorial-wave-1.mjs
│   │   ├── generate-editorial-wave-2.mjs
│   │   ├── export-image-briefs.mjs
│   │   └── import-scqr-content.mjs
│   ├── public/editorial/              # фавиконы, ассеты
│   └── .scqr/design-audit/            # архив design-аудита
├── _design_ref/                       # Figma-прототип (React/HTML, не в git)
└── *.png                              # 4 скриншота макетов (wave1-home, article, mobile, desktop)
```

Отдельный проект `D:\CODEX\SCQR\` — WordPress-бэкенд источника контента, мигрирует в gitscqr через `scripts/import-scqr-content.mjs`. **В эту переделку не входит.**

## Version lock

| Инструмент | Версия | Источник |
|---|---|---|
| Node.js | v22.20.0 | локальная установка |
| npm | 10.9.3 | в составе Node |
| pnpm | 10.33.2 | установлен глобально |
| Git | 2.54.0.windows.1 | Git for Windows |
| Astro | ^6.1.9 | `scqr/package.json` |
| @astrojs/mdx | ^5.0.4 | там же |
| @astrojs/rss | ^4.0.18 | там же |
| @astrojs/sitemap | ^3.7.2 | там же |
| TypeScript | ^5.9.3 | там же |
| sharp | ^0.34.3 | там же |
| `gh` CLI | не установлен | будем обходиться ручным PR |

Node engines в `scqr/package.json`: `">=22.12.0"` — оставляем как есть.

## Git-состояние

- Репо: `D:\CODEX\gitscqr\scqr\.git` (история в подкаталоге, не в корне `gitscqr`).
- Ветка: `main`, `ahead 0, behind 0` относительно `origin/main`.
- Последние 10 коммитов — стабильная история (refine hero, midday package, multi-style image system, premium curation, normalize archive, rebuild homepage, rubric surfaces, editorial tooling, first image system, innovations rubric).
- **60+ файлов с правками uncommitted** (контент + docs + скрипты + src/content.config.ts + src/data + src/lib). Правки тематически однородны: доработка материалов wave-1/2 и подгонка стилистики.
- 4 новых файла: `docs/editorial-designer-operating-model.md`, три статьи (`2026-04-24-alphafold-4-ot-struktury-k-povedeniyu.md`, `2026-04-24-criticgpt-kritik-dlya-modeley.md`, `2026-04-24-gde-vstrechayutsya-pamyat-i-logika.md`).
- Новые директории с активами: `src/assets/editorial/contributed/2026-04-24-evening/`, `2026-04-24-v3/`, `incoming/`, и `src/data/editorial-designer.js`.

## Контент

65 статей за 2026-01-09 → 2026-04-24. Распределение по месяцам:

- январь 2026 — 4
- февраль 2026 — 3
- март 2026 — 20
- апрель 2026 — 38 (wave-1/2 — интенсивный запуск)

Структура frontmatter (`scqr/src/content.config.ts`):

```ts
title, description, deck, scqrVerdict, pubDate, updatedDate?,
articleType ∈ {news, analysis, column, illustration},
stage?, status? ∈ {draft, ready, approved},
rubrics[], rubricLabels[], topics[], editorialFlags[],
storyCluster?, sourceNote?, readingTime?, publicUrl?,
heroAlt, heroStyle (enum EDITORIAL_IMAGE_STYLE_ORDER),
heroSource? (enum HERO_SOURCE_OPTIONS),
heroImage? (image loader).
```

Это — ground truth. **Не меняем** эту схему при переделке; добавим только два опциональных поля в Phase 4: `signals?: string[]` (связка с таблицей signals) и `thesis?: string` (тезис из рецензии владельца).

Рубрики, встречающиеся в статьях: `tendencies` (Тенденции), `trajectories` (Траектории), `theories` (Теории), `innovations` (Новации), `illusions` (Иллюзии), `regulations` (Регуляции), `russia` (В России), `automations` (Автоматизации), `generations` (Генерации).

## Что сохраняем (не трогаем)

- 65 файлов `src/content/posts/*.md` — ground truth контента.
- 63 SVG в `src/assets/editorial/` — визуальная система.
- Atkinson-шрифты в `src/assets/fonts/`.
- Astro-конфиг, pages/, components/, layouts/ — существующий дизайн wave-1 согласован владельцем.
- Docs: editorial-*, site-redesign-roadmap, vercel-runbook, agent-operating-model, editorial-designer-operating-model — переносим в корневой `docs/` как есть, обновим только то, что требует пайплайн.
- Scripts: create-post, validate-content, import-scqr-content — владелец ими пользуется; путь правим после переезда.
- Git-история main.

## Что перемещаем (без изменения содержимого)

- `scqr/.git` → `D:\CODEX\gitscqr\.git` (корень workspace).
- `scqr/docs/` → `D:\CODEX\gitscqr\docs/`.
- `scqr/*` (всё остальное) → `D:\CODEX\gitscqr\site/`.
- `*.png` из корня `gitscqr` → `site/public/design-audit/` или `.scqr/design-audit/` (это материалы, не рантайм — решим точно в Phase 1).

## Что создаём

- `D:\CODEX\gitscqr\package.json` + `pnpm-workspace.yaml` + `tsconfig.base.json`.
- `D:\CODEX\gitscqr\AGENTS.md` + `CLAUDE.md` + `README.md`.
- `D:\CODEX\gitscqr\.gitignore` (поверх существующего).
- `D:\CODEX\gitscqr\.env.example`.
- `D:\CODEX\gitscqr\.claude\agents\` — 8 субагентов.
- `D:\CODEX\gitscqr\.claude\skills\` — 12 скиллов.
- `D:\CODEX\gitscqr\docs\BOOTSTRAP.md` (копия исходного документа владельца), `EXEC_PLAN.md`, `editorial-rules.md`, `style-guide.md`, `source-policy.md`, `review-interpretation.md`, `memory-policy.md`, `runbook.md`, `automations.md`, `AUDIT.md` (этот файл).
- `D:\CODEX\gitscqr\engine\` — TS CLI + pipeline + SQLite schema.
- `D:\CODEX\gitscqr\.scqr\` — runtime (data.db, packs, jobs, visual-queue, style-corpus, logs). В `.gitignore`.

## Что удаляем

Ничего. `_design_ref/` и `*.png` в корне — не в git, остаются как вспомогательные материалы. `.scqr/design-audit/` (внутри scqr/) — оставляем как архив.

## Риски и митигация

1. **Потеря uncommitted-правок (60+ файлов)** — главный риск. Митигация: до любого `git mv` или reconfigure делаем `git checkout -b chore/pre-refactor-content`, `git add` по списку (явно, без `git add -A`, чтобы не затянуть мусор), `git commit`, `git push`, `git checkout main`, `git merge --ff-only chore/pre-refactor-content`, `git push`.
2. **Поднятие `.git` на уровень выше** — операция, где легко сломать историю. Митигация: делаем clone в соседнюю директорию, там тестируем `git mv` на уровень выше через создание поддиректорий `site/` и `docs/` в новом клоне, проверяем `git log --follow`, и только после этого воспроизводим в основной копии. Либо ещё проще: идём вариантом B — оставляем `.git` внутри `scqr/`, но переименовываем `scqr/` в `site/`, а workspace-root делаем `D:\CODEX\gitscqr\`. В этом случае git-history сохраняется без трюков, Vercel переподхватывает изменение пути. **Выбираем вариант B по умолчанию** — меньше рисков.
3. **Vercel-билд может отвалиться** после переименования. Митигация: вся операция — через ветку `chore/workspace-restructure`, preview-деплой, только после green — мёрж в main.
4. **Astro-сайт + pnpm-workspace** — нюанс с install-командой Vercel. Митигация: в `docs/vercel-runbook.md` записываем новый install command (`pnpm install --frozen-lockfile`), build command (`pnpm --filter site build`), output directory (`site/dist`).
5. **Существующие mjs-скрипты** имеют относительные пути `src/content/posts/`. После переезда в `site/` работают только из рабочей директории `site/`. Митигация: оставляем их в `site/scripts/`, запускаем из `site/` (сохраняет поведение), либо добавляем `pnpm --filter site <script>`.
6. **Корпус стиля** (5 выжимок) — положим в `.scqr/style-corpus/`. Не фиксируем в git, чтобы не загрязнять историю; при необходимости regenerated из статей.
7. **gh CLI отсутствует** — без автоматического открытия PR. Митигация: `publish:prepare` готовит ветку + коммит; PR открывается владельцем руками через GitHub UI, либо мы добавим установку `gh` позже.

## Style-corpus (первичная выжимка)

Положено в `D:\CODEX\gitscqr\.scqr\style-corpus\`. Три файла — по одному на `articleType`. Содержат: 2-3 опорные статьи, первые 400 символов каждой, характерные приёмы (лид, дейтлайн, обороты), запрещённые конструкции. Для writer-субагента это первичный контекст стиля; полная выжимка по всем 65 статьям — отдельная задача Phase 2.

## Что переносим в `docs/EXEC_PLAN.md`

План утверждённый, хранится в `C:\Users\user\.claude\plans\c-users-user-downloads-bootstrap-prompt-zany-hinton.md`. В Phase 2 копируется в `D:\CODEX\gitscqr\docs\EXEC_PLAN.md` как single source of truth для всех будущих сессий (и Claude Code, и Codex).

## Checkpoint Phase 0

- [x] Структура зафиксирована.
- [x] Версии зафиксированы.
- [x] Git-состояние описано, uncommitted правки перечислены.
- [x] Контент-схема прочитана, 65 статей учтены.
- [x] Что сохраняем / перемещаем / создаём — описано.
- [x] Риски перенесены в явный список с митигацией.
- [x] Style-corpus первичный — создан.

**Готов к Phase 1 (git hygiene + workspace restructure) по утверждению владельца.**
