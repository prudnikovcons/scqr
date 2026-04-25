# SCQR Editorial System — Execution Plan

> Single source of truth для всей реализации. Канонический документ, на который ссылаются `AGENTS.md`, `CLAUDE.md`, все агенты и скиллы. Обновляется по результатам каждой фазы.

## 1. Цель и пользовательская ценность

SCQR — русскоязычное аналитическое издание об ИИ. После запуска редакционной системы владелец (Максим) может:

- Получать утром и вечером md-пакет сигналов с ~80 источников.
- Писать одну свободную рецензию на пакет вместо ручного отбора и постановки задач.
- Доверять системе остальную часть цикла: writer → editor → factchecker → visual-briefer → publish.
- Видеть полную трассировку каждого решения (decision_log) и накопление паттернов (memory).
- Поддерживать темп без потери качества: 1-3 материала в день, каждый с авторским тезисом.

До системы — один редактор делал всё руками. После — редактор делает только то, что не делегируется: пишет рецензию, апрувит финал, открывает PR.

## 2. Архитектура

### Контуры

1. **Сбор сигналов** (`engine/src/collectors/`) — RSS, HTML (cheerio + readability), GitHub releases.
2. **Реестр источников** (`sources` table) — авторитетность, частота, категория, language.
3. **Сборка пакета** (`pipeline/pack-builder.ts`) — md-файл с 20-30 сигналами, кластерами, контекстом из decision_log.
4. **Рецензия и интерпретатор** (`review-interpreter` agent) — свободный текст → JSON `review_actions`.
5. **Производство статьи** — `writer → editor → factchecker → visual-briefer` через `.scqr/jobs/<id>/` файлы.
6. **Публикация** — git-ветка `article/<slug>` + commit; PR открывает владелец; Vercel auto-deploy main.
7. **Память и ретро** — `decision_log` + `memory` + `retro-reviewer`.
8. **Интерфейс** — Claude Code сессия (сейчас) / Codex (будет). Веб-морды нет — её заменяет thread.

### Control plane vs data plane

Критичное решение: CLI **не вызывает LLM**. Вся логика вокруг агентов — в активной сессии harness'а.

- **Data plane**: `pnpm scqr <command>` — атомарные операции над БД и файлами.
- **Control plane**: Claude Code session (или Codex) — спавнит агентов через Task tool, читает/пишет файлы, фиксирует через CLI.
- **Контракт**: файлы в `.scqr/jobs/<id>/`, `.scqr/packs/`, `.scqr/reviews/`, `.scqr/visual-queue/`.

Это делает систему harness-agnostic: смена Claude Code на Codex не требует перепроектирования.

### Граф процессов

```
sources → [collect] → signals → [cluster] → [pack] → packs (md)
                                                        ↓
                                     владелец → review (md)
                                                        ↓
                                  [interpret-review] → review_actions (JSON)
                                                        ↓
                                                  article_jobs
                                                        ↓
              [writer] → [editor] → [factchecker] → [visual-briefer]
                                                        ↓
                       site/src/content/posts/<slug>.md + .scqr/visual-queue/<slug>.md
                                                        ↓
                    [publish:prepare] → git branch article/<slug> → owner PR → Vercel prod
                                                        ↓
                                       decision_log + memory
                                                        ↓
                              [weekly-retro] → docs/memory/YYYY-WW.md
```

## 3. Агенты (8) и Skills (12)

| Agent | Roles | Файл |
|---|---|---|
| signal-collector | сбор + сборка пакета | [.claude/agents/signal-collector.md](../.claude/agents/signal-collector.md) |
| review-interpreter | разбор рецензии в JSON actions | [.claude/agents/review-interpreter.md](../.claude/agents/review-interpreter.md) |
| writer | первый draft | [.claude/agents/writer.md](../.claude/agents/writer.md) |
| editor | редактура под style-guide | [.claude/agents/editor.md](../.claude/agents/editor.md) |
| factchecker | проверка фактов по первоисточникам | [.claude/agents/factchecker.md](../.claude/agents/factchecker.md) |
| visual-briefer | cover/infographic brief | [.claude/agents/visual-briefer.md](../.claude/agents/visual-briefer.md) |
| source-scout | deep-research по источникам | [.claude/agents/source-scout.md](../.claude/agents/source-scout.md) |
| retro-reviewer | еженедельная ретроспектива | [.claude/agents/retro-reviewer.md](../.claude/agents/retro-reviewer.md) |

| Skill | Триггер | Файл |
|---|---|---|
| collect-signals | `pnpm scqr collect <slot>` | [.claude/skills/collect-signals/](../.claude/skills/collect-signals/) |
| build-signal-pack | `pnpm scqr pack <slot>` | [.claude/skills/build-signal-pack/](../.claude/skills/build-signal-pack/) |
| interpret-review | владелец прислал review.md | [.claude/skills/interpret-review/](../.claude/skills/interpret-review/) |
| assemble-evidence | новый article_job | [.claude/skills/assemble-evidence/](../.claude/skills/assemble-evidence/) |
| write-article | job.status=drafting | [.claude/skills/write-article/](../.claude/skills/write-article/) |
| edit-article | job.status=editing | [.claude/skills/edit-article/](../.claude/skills/edit-article/) |
| factcheck-article | job.status=factchecking | [.claude/skills/factcheck-article/](../.claude/skills/factcheck-article/) |
| brief-cover | job.status=briefing | [.claude/skills/brief-cover/](../.claude/skills/brief-cover/) |
| brief-infographic | writer/editor попросил график | [.claude/skills/brief-infographic/](../.claude/skills/brief-infographic/) |
| publish-article | job.status=ready + апрув | [.claude/skills/publish-article/](../.claude/skills/publish-article/) |
| review-sources | еженедельный аудит | [.claude/skills/review-sources/](../.claude/skills/review-sources/) |
| weekly-retro | пятница / `pnpm scqr retro` | [.claude/skills/weekly-retro/](../.claude/skills/weekly-retro/) |

## 4. Сущности БД

10 таблиц в SQLite через Drizzle ORM. Точная схема — [engine/src/db/schema.ts](../engine/src/db/schema.ts).

1. **sources** — реестр источников с authority_score, type, language, active.
2. **signals** — индивидуальные материалы со status (FSM).
3. **signal_clusters** — тематические группы (storyCluster).
4. **packs** — md-пакеты на рецензию.
5. **pack_items** — связь pack ↔ signals с display_id (SIG-N) и importance_note.
6. **reviews** — сессии рецензий владельца + пути к файлам.
7. **review_actions** — раскладка действий (write|defer|archive|keep_context|combine|series_candidate).
8. **article_jobs** — очередь производства с slug и job_dir.
9. **decision_log** — все редакционные решения (entity_type+entity_id, decision, reason).
10. **memory** — наблюдения retro-reviewer и ручные пометки.

## 5. Состояния сигнала (FSM)

```
new
 → cluster (автоматом при collect)
 → in_pack (при pack-builder)
 → reviewed (после review:save)
   → selected → in_production → published
   → deferred (с defer_until)
   → archived
   → kept_for_context
   → series_candidate
```

Каждый переход пишется в `decision_log` с `decided_by` (signal-collector | review-interpreter | owner | cli | retro).

## 6. Контракты между агентами

Все артефакты — в `.scqr/jobs/<job-id>/`. Структура:

```
.scqr/jobs/<job-id>/
├── input.json              # вход для writer (assemble-evidence пишет)
├── draft.md                # writer пишет
├── draft.notes.md          # writer пишет (что сложно, что для factchecker)
├── edited.md               # editor пишет
├── edit.notes.md           # editor пишет (журнал правок)
├── factcheck.json          # factchecker пишет (status: pass|fail + items)
├── visual-brief.md         # visual-briefer пишет
└── final/                  # опционально: окончательный split frontmatter/body
    ├── frontmatter.yaml
    └── body.md
```

`input.json` — основной контракт между фазами. Полная схема — в [docs/review-interpretation.md](review-interpretation.md).

## 7. Структура workspace

См. [README.md](../README.md) и фактическое дерево после Phase 1 + 2.

## 8. Automations

Спецификация cron-задач — в [docs/automations.md](automations.md). Текущий harness (Claude Code) их **не исполняет** — нужен либо Codex automation, либо внешний планировщик (GitHub Actions).

| Name | Cron | Действие |
|---|---|---|
| daily-morning-collect | `0 9 * * *` | collect+pack morning, drop to triage |
| daily-evening-collect | `0 19 * * *` | collect+pack evening |
| weekly-source-review | `0 11 * * 1` | source-scout: 5-10 кандидатов |
| weekly-retro | `0 16 * * 5` | retro: docs/memory/YYYY-WW.md |

## 9. Порядок реализации (фазы)

| Фаза | Цель | Статус |
|---|---|---|
| 0 | Audit | ✅ done — `docs/AUDIT.md` |
| 1 | Workspace restructure + scaffold | ✅ done (commit `bf512b4`) |
| 2 | Каркас документов | 🔄 in progress (этот документ) |
| 3 | Engine implementation (collectors, pipeline, реальные команды, тесты) | pending |
| 4 | Site: extension content.config.ts (`signals?`, `thesis?`) | pending |
| 5 | Seed sources (deep-research), первый боевой `collect+pack` | pending |
| 6 | E2E dry run | pending |
| 7 | README finalize, runbook, первая реальная публикация | pending |

Каждая фаза заканчивается чекпоинтом владельцу: что сделано, что не сделано, что проверено.

## 10. Тесты приёмки

- **Phase 1**: ✅ pnpm install чистый, `pnpm scqr doctor` 11/11, `pnpm --filter site build` 289 страниц, ai.scqr.ru работает на новом prod-deploy.
- **Phase 2**: все документы из раздела 9 присутствуют, AGENTS.md/CLAUDE.md ссылаются на них корректно.
- **Phase 3**: `pnpm --filter engine test` зелёный; `pnpm scqr collect --dry-run` с 2-3 тестовыми RSS пишет в БД; pack собирается.
- **Phase 4**: `astro check` без ошибок; `pnpm scqr article:save` пишет md, который проходит content collection schema.
- **Phase 5**: ≥70 sources в БД, первый pack в `.scqr/packs/`.
- **Phase 6**: E2E цикл прошёл на синтетической рецензии, статья + brief + commit готовы.
- **Phase 7**: первая реальная публикация в `main`, владелец доволен темпом и точностью.

## 11. Чего НЕ делаем

- Не переписываем дизайн сайта (wave-1 согласован).
- Не трогаем существующие 65 статей вне явных запросов владельца.
- Не меняем URL-структуру.
- Не генерируем растровые изображения в Claude Code (только брифы; обложки → Codex-operator).
- Не пишем параллельные схемы статей (legacy vs new) — ground truth один.
- Не вводим learn-to-rank на старте — простая эвристика (source_authority × recency × cluster_size); ML после 4-6 недель данных.

## 12. Открытые вопросы (track here)

- [ ] gh CLI установка для автоматического `gh pr create` — отложено до Phase 7.
- [ ] Codex-harness: формат `.codex/agents/*.toml` и automations — добавляется отдельной фазой после Phase 7.
- [ ] Изображения для wave-2 (расширение `editorial-image-styles.js`): остаётся за дизайнерским контуром.
- [ ] Memory-формат: SQLite-таблица + markdown в `docs/memory/`. Решено: оба, синхронизирует retro-reviewer.

## 13. Связанные документы

- [AGENTS.md](../AGENTS.md), [CLAUDE.md](../CLAUDE.md), [README.md](../README.md)
- [docs/AUDIT.md](AUDIT.md)
- [docs/editorial-rules.md](editorial-rules.md)
- [docs/style-guide.md](style-guide.md)
- [docs/source-policy.md](source-policy.md)
- [docs/review-interpretation.md](review-interpretation.md)
- [docs/memory-policy.md](memory-policy.md)
- [docs/runbook.md](runbook.md)
- [docs/automations.md](automations.md)
- [docs/vercel-runbook.md](vercel-runbook.md)
- [docs/editorial-image-system.md](editorial-image-system.md), [docs/editorial-designer-operating-model.md](editorial-designer-operating-model.md)
- [docs/site-redesign-roadmap.md](site-redesign-roadmap.md)
