---
name: assemble-evidence
description: Используй после создания article_job для сборки полного контекста (evidence + style hints) для writer. Триггер — `pnpm scqr job:context <jobId>` или просьба «подготовь evidence для job».
---

# assemble-evidence

## Когда срабатывает
- Только что создана article_job с статусом `pending`.
- Перед запуском writer.

## Вход
- jobId из article_jobs.
- `signal` (с url, source).
- `review_action` (тезис, must_include, must_avoid, tone).

## Шаги
1. Читаешь сигнал и review_action.
2. WebFetch первоисточника с указанной url (если доступно).
3. Если source-агент дал ссылки на связанные публикации (например, predecessor releases) — также WebFetch.
4. Извлекаешь 3-7 ключевых цитат / цифр / дат из первоисточников. Каждая — с url и точной формулировкой.
5. Читаешь `.scqr/style-corpus/<articleType>.md` — стилевые ориентиры.
6. Читаешь `decision_log` для связанных тем (storyCluster) — чтобы writer знал контекст.
7. Сохраняешь всё в `.scqr/jobs/<job-id>/input.json`:

```json
{
  "job_id": "...",
  "signal": { "id": 142, "title": "...", "url": "...", "source": "OpenAI Blog" },
  "thesis": "...",
  "tone": "analysis",
  "must_include": "...",
  "must_avoid": "...",
  "evidence": [
    { "url": "...", "quote": "...", "kind": "primary" },
    ...
  ],
  "context_links": [
    { "url": "...", "title": "...", "from_decision_log": true }
  ],
  "style_hint": "../../.scqr/style-corpus/analysis.md",
  "frontmatter_template": { ... }
}
```

8. Меняешь статус job на `drafting`.

## Жёсткие правила
- evidence только из первоисточников. Никаких блог-постов, рерайтов или твитов.
- цитаты дословные, без вольных перефразировок.
- minimum 3 evidence-записи для analysis, 2 для news, 1-2 для column.

## Выход
`.scqr/jobs/<job-id>/input.json` — исчерпывающий контекст для writer.
