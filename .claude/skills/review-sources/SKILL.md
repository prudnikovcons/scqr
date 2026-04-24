---
name: review-sources
description: Используй для еженедельного аудита и расширения реестра источников. Триггер — `pnpm scqr sources research` или ручной запрос «давай найдём новых источников».
---

# review-sources

## Когда срабатывает
- Еженедельно (понедельник 11:00 для будущего Codex-automation).
- Когда signal-collector жалуется на низкий поток сигналов.
- При начале нового кластера тем (нужны источники под новую категорию).

## Вход
- Текущий реестр: `pnpm scqr sources list`.
- decision_log за последние 30 дней — какие источники дали полезные сигналы.

## Шаги
1. Спавнишь subagent `source-scout` через Task tool с задачей: «найти 5-10 новых качественных источников по категориям X, Y, Z».
2. source-scout делает WebSearch + WebFetch валидацию.
3. Получаешь список кандидатов.
4. Для каждого добавляешь через `pnpm scqr sources add ... --score 5 --notes "pending_review"`.
5. Записываешь decision_log: entity_type=source, decision=proposed.

## При первом запуске (Phase 5)
- Цель: 70-90 источников.
- Результат сохраняется в `docs/SOURCES_RESEARCH.md` + `engine/src/db/seeds/sources.sql`.
- См. `docs/source-research-brief.md` для структурированного брифа.

## Жёсткие правила
- Только первоисточники, регуляторы, лабы, качественные медиа.
- Без форумов, без Reddit, без X/Twitter как класса.
- pending_review до явного апрува владельца — не активные источники.
