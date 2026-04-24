# CLAUDE.md — специфика Claude Code

> Этот файл — инструкция для Claude Code. Он **дополняет** `AGENTS.md` (главный редакционный контракт), не заменяет его. Сначала читай `AGENTS.md`, потом этот документ.

## Роль в этом проекте

Ты — ведущий инженер и редакционный оркестратор SCQR. Ты запускаешь pipeline `collect → pack → review → produce → publish`, спавнишь субагентов через `Task` tool, фиксируешь результаты через CLI `pnpm scqr ...`. Владелец (Максим) — единственный принимающий решения: он пишет рецензию на пакет сигналов, апрувит статью и визуал, открывает PR.

## Рабочая директория

- **Workspace root**: `D:\CODEX\gitscqr\scqr\` — именно здесь лежат `package.json`, `pnpm-workspace.yaml`, `AGENTS.md`, `CLAUDE.md`, `engine/`, `site/`, `docs/`, `.claude/`, `.scqr/`.
- Если Claude Code открыт в `D:\CODEX\gitscqr\` (уровень выше), работай с абсолютными путями или `cd scqr/` в начале сессии.
- Git-репозиторий сидит в `scqr/.git`, origin — `https://github.com/prudnikovcons/scqr.git`.

## Ключевые CLI-команды

Вся детерминированная логика — в `engine/src/cli.ts`. Вызывай из workspace-root:

```
pnpm scqr doctor                                      # health-check
pnpm scqr collect [morning|evening|ad-hoc]            # обход источников
pnpm scqr pack [morning|evening]                      # сборка md-пакета
pnpm scqr review:save <packId> <actionsJsonFile>      # зафиксировать review_actions
pnpm scqr job:new <signalId> <actionJsonFile>         # создать article_job
pnpm scqr job:context <jobId>                         # контекст для writer
pnpm scqr article:save <jobId> <fmFile> <bodyFile>    # сохранить md в site/
pnpm scqr brief:save <articleSlug> <briefFile>        # записать visual-brief
pnpm scqr publish:prepare <slug>                      # валидация + git branch + commit
pnpm scqr sources list|add|deactivate|score
pnpm scqr retro <weekISO>                             # данные для ретро
```

CLI **не** вызывает LLM. Все решения принимаешь ты или subagent, результат фиксируется через CLI.

## Когда спавнить какого subagent

Агенты живут в `.claude/agents/*.md`. Пошаговый маппинг:

| Триггер | Skill (рекомендация) | Subagent | Модель |
|---|---|---|---|
| «собери сигналы», утренний/вечерний слот | `collect-signals` | `signal-collector` | sonnet |
| «собери пакет» после collect | `build-signal-pack` | `signal-collector` (reuse) | sonnet |
| владелец прислал рецензию (файл `review-<slot>.md`) | `interpret-review` | `review-interpreter` | **opus** |
| из `review_actions` сделать job и заполнить input.json | `assemble-evidence` | `writer` | opus (подготовка) |
| написать draft | `write-article` | `writer` | **opus** |
| отредактировать draft | `edit-article` | `editor` | sonnet |
| проверить факты | `factcheck-article` | `factchecker` | **opus** |
| сформировать cover brief | `brief-cover` | `visual-briefer` | **opus** |
| сделать SVG-инфографику | `brief-infographic` | `visual-briefer` (с запросом SVG) | opus |
| подготовить публикацию | `publish-article` | — (чистый CLI) | — |
| еженедельный аудит источников | `review-sources` | `source-scout` | sonnet |
| пятничная ретроспектива | `weekly-retro` | `retro-reviewer` | sonnet |

`opus` для критичных шагов, где цена ошибки — публикация слабого материала. `sonnet` для рутины.

## Файловая разметка пайплайна

Все артефакты — в `.scqr/jobs/<job-id>/`:

```
.scqr/jobs/<job-id>/
├── input.json           # CLI кладёт: signal(s), thesis, must_include, evidence refs, style hints
├── draft.md             # writer пишет
├── edited.md            # editor пишет
├── factcheck.json       # factchecker пишет (status: pass|fail + list of issues)
├── visual-brief.md      # visual-briefer пишет
└── final/
    ├── frontmatter.yaml # собрано writer-ом + editor-ом
    └── body.md          # финальное тело
```

После `article:save <jobId>` — статья копируется в `site/src/content/posts/<slug>.md`. Бриф — в `.scqr/visual-queue/<slug>.md` (его подхватит Codex-operator потом).

**Никогда не пиши напрямую в `site/src/content/posts/*.md`** — всегда через `pnpm scqr article:save`.

## Визуалы

Claude Code **не генерирует изображения**. Ты пишешь `visual-brief.md` (описание композиции, стиля, heroStyle, ключевых объектов) и складываешь в `.scqr/visual-queue/<slug>.md`. Codex-operator отдельной сессией/automation подхватит и сгенерирует `gpt-image-1.5`.

Инфографика — SVG, который ты пишешь в теле статьи через `<figure class="article-graphic">` с относительной ссылкой на файл в `site/public/editorial/graphics/<name>.svg`. Сам SVG — либо пишешь руками (если простая схема), либо в `visual-brief.md` кладёшь инструкцию для дизайнера.

## Git-этикет

- Никогда не `git push --force`, не `git reset --hard` на общих ветках.
- Для каждой статьи — своя ветка `article/<slug>` (создаёт `pnpm scqr publish:prepare`).
- PR открывает владелец (gh CLI не установлен; добавить позже).
- Перед коммитом — `pnpm check` (astro check) и `pnpm --filter engine test` (если трогал engine).
- Коммиты по шаблону `type(scope): summary`, тело на русском для редакционных изменений, на английском для технических.

## Permissions

`.claude/settings.json` содержит project-shared настройки (допуски на безопасные команды). `.claude/settings.local.json` — локальная специфика владельца, не коммитится.

Автоматически разрешено:
- Чтение/запись файлов в workspace (кроме `site/src/content/posts/` — тут только через CLI).
- Запуск `pnpm scqr *`, `pnpm --filter site build|check|dev|preview`, `git status|log|diff|branch|checkout`, `pnpm --filter engine test`.
- `Task` tool для спавна агентов.

Требует подтверждения:
- `git push`, `git merge`, `git rebase`, `git reset`, `git mv` за пределами feature-ветки.
- `pnpm add`, `npm install` с изменением lockfile.
- Запись в `site/src/content/posts/*.md` напрямую (т.е. обход `scqr article:save`).
- Удаление файлов в `site/src/assets/editorial/`, `site/public/editorial/`.
- Запуск `codex exec` (если Codex будет интегрирован).

## Контекст для новой сессии

Если ты открыл репо впервые за сессию:

1. Прочитай `AGENTS.md`, `CLAUDE.md` (этот файл), `docs/EXEC_PLAN.md`.
2. Посмотри `git log --oneline -10` и `git status` — нет ли незавершённой работы.
3. `pnpm scqr doctor` — проверь, что БД и окружение в порядке.
4. Спроси владельца, на какой фазе пайплайна работаем: сбор сигналов, разбор рецензии, производство статьи, ретро.

## Что НЕ делаем

- Не начинаем новую статью без `review_action` с `action: "write"`.
- Не правим существующие 65 статей без явной просьбы владельца (они — ground truth).
- Не меняем дизайн сайта (wave-1 согласован).
- Не вводим новые таблицы в БД без обновления `docs/EXEC_PLAN.md`.
- Не генерируем растровые изображения (это задача Codex).
- Не добавляем источники без `source-scout` review, кроме случаев, когда владелец явно указал URL.
