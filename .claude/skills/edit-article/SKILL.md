---
name: edit-article
description: Используй для редактуры draft под style-guide и editorial-rules SCQR. Триггер — статус job=editing.
---

# edit-article

## Когда срабатывает
- article_job в статусе `editing`.

## Вход
- `.scqr/jobs/<job-id>/draft.md` (после writer).
- `.scqr/jobs/<job-id>/draft.notes.md`.
- `docs/style-guide.md`, `docs/editorial-rules.md`.

## Шаги
1. Спавнишь subagent `editor` через Task tool.
2. Editor сохраняет `.scqr/jobs/<job-id>/edited.md` + `edit.notes.md`.
3. Проверяешь, что длина не сократилась ниже минимума:
   - news ≥350 слов,
   - analysis ≥800 слов,
   - column ≥400 слов.
4. Меняешь статус job на `factchecking`.

## Жёсткие правила
- Editor не меняет thesis и must_include от владельца.
- Если ты видишь, что edited.md расходится с input.thesis — возврат в editor.
