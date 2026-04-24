---
name: factcheck-article
description: Используй для проверки фактов после editor. Без status=pass от factchecker статья не публикуется. Триггер — статус job=factchecking.
---

# factcheck-article

## Когда срабатывает
- article_job в статусе `factchecking`.

## Вход
- `.scqr/jobs/<job-id>/edited.md`
- `.scqr/jobs/<job-id>/input.json` (evidence)

## Шаги
1. Спавнишь subagent `factchecker` через Task tool.
2. Factchecker сохраняет `.scqr/jobs/<job-id>/factcheck.json`.
3. Если status=pass — меняешь job на `briefing`.
4. Если status=fail — возвращаешь в `editing` (или `drafting` для серьёзных фактологических ошибок) с приложенным списком issues для исправления.

## Жёсткие правила
- Любой fail = блок публикации.
- При fail обязательно прикладываешь suggested_fix к issue.
- Если factchecker не смог проверить факт (unverifiable) — он сам помечает это, и факт удаляется до повторного pass.
