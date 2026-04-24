# SCQR — Редакционная система

Русскоязычное аналитическое издание об искусственном интеллекте: [scqr.ru](https://scqr.ru). Этот репозиторий — рабочий контур редакции: сайт на Astro + TypeScript-движок для сбора сигналов, интерпретации рецензий и производства материалов.

## Быстрый старт

```bash
cd D:\CODEX\gitscqr\scqr
pnpm install

# Сайт
pnpm dev                    # локальный preview (http://localhost:4321)
pnpm build                  # продакшн-сборка в site/dist
pnpm check                  # astro check

# Движок
pnpm scqr doctor            # health-check БД и окружения
pnpm scqr --help            # все команды
```

## Структура

```
scqr/                          # workspace root (git)
├── AGENTS.md                  # редакционный контракт (все агенты)
├── CLAUDE.md                  # специфика Claude Code
├── package.json               # workspace (pnpm)
├── pnpm-workspace.yaml
├── docs/                      # операционные документы
├── .claude/                   # agents + skills для Claude Code
├── site/                      # Astro, 65+ статей
│   ├── src/content/posts/     # ground truth контента
│   └── src/assets/editorial/  # 63+ SVG-обложек
├── engine/                    # TypeScript CLI + pipeline
│   └── src/
│       ├── cli.ts             # команды pnpm scqr *
│       ├── db/schema.ts       # Drizzle, 10 таблиц
│       ├── collectors/        # rss, html, github
│       ├── pipeline/          # dedupe, cluster, score, pack-builder
│       └── commands/          # подкоманды CLI
└── .scqr/                     # runtime (в .gitignore)
    ├── data.db                # SQLite
    ├── packs/                 # md-пакеты сигналов
    ├── jobs/                  # артефакты article_job
    ├── visual-queue/          # cover/infographic briefs
    └── style-corpus/          # выжимка стиля из 65 статей
```

## Редакционный цикл

1. Утром / вечером: `pnpm scqr collect <slot>` обходит источники, `pack <slot>` собирает md-пакет в `.scqr/packs/`.
2. Владелец читает пакет, пишет свободную рецензию (`.scqr/reviews/<slot>.md`).
3. Claude Code (или Codex) запускает `review-interpreter`, получает JSON `review_actions`, фиксирует через `pnpm scqr review:save`.
4. Для каждого `action: "write"` создаётся `article_job`. Writer → editor → factchecker → visual-briefer.
5. `pnpm scqr article:save` кладёт готовый md в `site/src/content/posts/`, `brief:save` — в `.scqr/visual-queue/`.
6. `pnpm scqr publish:prepare <slug>` создаёт ветку `article/<slug>`, коммитит. Владелец открывает PR.
7. Vercel деплоит из `main` после мержа.

## Для владельца — частые действия

### Утренний пакет пришёл, хочу написать рецензию
Открой свежий `.scqr/packs/YYYY-MM-DD-morning.md`. Пиши рецензию в свободной форме прямо в `.scqr/reviews/YYYY-MM-DD-morning.md`: где зацепило, что важно, какой угол, что отложить, что совсем мимо. Упоминай сигналы по идентификатору `SIG-<N>` из пакета (необязательно — интерпретатор поймёт и по цитате).

Потом скажи агенту: «Разбери рецензию и запусти производство».

### Хочу заморозить сигнал на 2 недели
В рецензии пиши явно: «SIG-42 — отложить до начала мая, пока не станет ясно с регулированием». `review-interpreter` положит `defer` с датой возврата.

### Хочу серию из 3 материалов по одной теме
В рецензии: «Сигналы SIG-7, SIG-12, SIG-19 — одна линия, сделать серией, начать с SIG-12 как якорным». Агент создаст 3 `article_job` с общим `storyCluster`.

### Я не согласен с обложкой
`visual-brief.md` содержит описание и heroStyle. Скажи: «Замени стиль на `civic_blueprint`, убери центральную фигуру, добавь схему допуска». Агент перезапишет бриф.

### Система упала
- `pnpm scqr doctor` — быстрый health-check.
- `.scqr/logs/<cmd>-<ts>.log` — pino-логи последних команд.
- `git status` — не застрял ли pipeline на полу-готовой ветке.

Подробнее — `docs/runbook.md`.

## Документация

- `AGENTS.md` — контракт для AI-агентов (миссия, правила, запреты).
- `CLAUDE.md` — инструкция для Claude Code.
- `docs/EXEC_PLAN.md` — полный план системы.
- `docs/editorial-rules.md`, `docs/style-guide.md` — редакционные правила и стайл-гайд.
- `docs/review-interpretation.md` — как превращать рецензию в actions.
- `docs/source-policy.md`, `docs/memory-policy.md` — политика источников и памяти.
- `docs/automations.md` — cron-задачи (для будущего Codex).
- `docs/vercel-runbook.md` — деплой.

## Статус

Система в стадии bring-up: Phase 1 (workspace restructure) в работе. Следующие фазы — engine implementation, seed источников, первая реальная публикация. См. `docs/EXEC_PLAN.md` → «Фазы исполнения».
