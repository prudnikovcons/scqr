---
name: write-article
description: Используй для производства первого draft статьи SCQR по input.json. Триггер — статус job=drafting или явный запрос «напиши draft по job <id>». Только русский язык, стиль строго по style-corpus.
---

# write-article

## Когда срабатывает
- article_job в статусе `drafting` с заполненным input.json.

## Вход
- `.scqr/jobs/<job-id>/input.json`
- `.scqr/style-corpus/<articleType>.md`
- `docs/style-guide.md`, `docs/editorial-rules.md`

## Шаги
1. Спавнишь subagent `writer` через Task tool с указанием job_id.
2. Writer пишет в `.scqr/jobs/<job-id>/draft.md` (frontmatter + body) и `draft.notes.md`.
3. После завершения проверяешь:
   - frontmatter валиден (поля по `site/src/content.config.ts`).
   - длина соответствует tone.
   - финальный абзац перекликается с заголовком.
4. Меняешь статус job на `editing`.

## Жёсткие правила
- Если writer вернул draft, в котором тезис расходится с input.thesis — возвращаешь в writer на доработку (не пускаешь дальше).
- Если в draft появились факты, которых нет в evidence — также возврат.
- Slug формируется в writer-стадии, фиксируется в frontmatter.

## Выход
- `draft.md` + `draft.notes.md` в job-папке.
- job.status=editing.
