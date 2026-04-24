---
name: interpret-review
description: Используй когда владелец прислал свободный текст рецензии на пакет сигналов. Раскладывает рецензию в JSON review_actions для каждого сигнала пакета. Критичный шаг — единственный, где формулируется тезис материала. Триггер — команда `pnpm scqr review:interpret` или прямой запрос «разбери рецензию».
---

# interpret-review

## Когда срабатывает
- Владелец положил рецензию в `.scqr/reviews/YYYY-MM-DD-<slot>.md`.
- Пакет имеет статус `pending_review`.

## Вход
- Markdown-пакет `.scqr/packs/YYYY-MM-DD-<slot>.md` (с SIG-N идентификаторами).
- Свободный текст рецензии `.scqr/reviews/YYYY-MM-DD-<slot>.md`.
- (опционально) `decision_log` за 7 дней.

## Шаги
1. Спавнишь subagent `review-interpreter` через Task tool с входом:
   - `pack_path`
   - `review_path`
   - `instruction: "Разбери рецензию на JSON review_actions, без вступления и хвоста."`
2. Получаешь JSON-массив.
3. Валидируешь его zod-схемой (engine/src/schemas/review-action.ts):
   - все signal_id есть в packe,
   - action ∈ перечисления,
   - для action=combine — combine_with непустой,
   - для action=write — thesis ИЛИ reason заполнено.
4. Сохраняешь в `.scqr/jobs/review-<reviewId>/actions.json`.
5. Вызываешь `pnpm scqr review:save <packId> <actionsFile>` — CLI пишет в БД review + review_actions.
6. Для каждого `action: "write"` (или `combine`/`series_candidate`) автоматически создаёшь article_jobs через `pnpm scqr job:new`.

## Выход
- Сохранённые review + review_actions в БД.
- Созданные article_jobs со статусом `pending`.
- Краткий отчёт владельцу:
  - N сигналов получили action.
  - X написать (jobs created), Y отложено, Z в архив, W в memory.

## Жёсткие правила
- Не интерпретируешь рецензию сам. Это работа `review-interpreter` subagent.
- Не пропускаешь сигналы пакета — каждому должен быть присвоен action (или явный keep_context).

## Связанный subagent
`review-interpreter` (.claude/agents/review-interpreter.md).
