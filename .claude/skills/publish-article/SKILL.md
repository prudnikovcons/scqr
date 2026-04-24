---
name: publish-article
description: Используй для финальной публикации готовой статьи. Триггер — статус job=ready и владелец дал апрув. Создаёт ветку article/<slug>, копирует md в site/, коммитит. Не пушит в remote — это делает владелец вручную.
---

# publish-article

## Когда срабатывает
- article_job в статусе `ready`.
- Владелец явно сказал «опубликуй <slug>».

## Вход
- `.scqr/jobs/<job-id>/edited.md` (или `final/body.md` если есть отдельный финал).
- `.scqr/jobs/<job-id>/factcheck.json` (status=pass).
- `.scqr/jobs/<job-id>/visual-brief.md`.

## Шаги
1. Запускаешь `pnpm scqr publish:prepare <slug>`.
2. CLI делает:
   - Валидация frontmatter zod-схемой (по site/src/content.config.ts).
   - Проверка: heroImage существует или явный TODO_COVER в visual-queue.
   - `git checkout -b article/<slug>` (если не на ветке).
   - `pnpm scqr article:save <jobId> <fmFile> <bodyFile>` копирует в `site/src/content/posts/<slug>.md`.
   - `git add site/src/content/posts/<slug>.md` (плюс SVG-инфографика, если есть).
   - `git commit -m "publish(<rubric>): <slug>"` со ссылкой на job_id и signal_id в теле коммита.
3. Возвращаешь владельцу:
   - Ветка готова, путь к коммиту.
   - Команды для PR: `git push -u origin article/<slug>` и далее GitHub UI.
4. Меняешь job.status на `published` (или `awaiting_pr`).

## Жёсткие правила
- Не пушишь сам. Только подготавливаешь.
- Не мёржишь в main.
- Не вызываешь Vercel напрямую — деплой идёт через main → Vercel автоматически после мержа PR.
- Если factcheck.json.status=fail — отказываешь в публикации.

## После публикации
- Пишешь decision_log: entity_type=article, entity_id=<slug>, decision=published.
- Сигналу присваиваешь status=published.
- Триггеришь `weekly-retro` skill при необходимости (в конце недели).
