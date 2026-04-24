---
name: collect-signals
description: Используй когда нужно обойти реестр источников SCQR и записать новые сигналы в БД. Триггеры — команда `pnpm scqr collect <slot>` или явный запрос «собрать утренние/вечерние сигналы». Не используй для сборки md-пакета (для этого build-signal-pack).
---

# collect-signals

## Когда срабатывает
- Утром около 09:00 (`slot=morning`).
- Вечером около 19:00 (`slot=evening`).
- Ad-hoc по запросу владельца.

## Вход
- Активные источники в таблице `sources`.
- Опционально: фильтр `--source <id>` для одного источника.

## Шаги
1. Читаешь активные источники.
2. Для каждого вызываешь правильный коллектор:
   - `engine/src/collectors/rss.ts` — для type=rss.
   - `engine/src/collectors/html.ts` — для type=html (cheerio + readability).
   - `engine/src/collectors/github.ts` — для type=github.
   - arxiv/regulator/blog — обработчик HTML с разными селекторами.
3. Нормализуешь: title (≤200 символов), summary (200-400), url (canonical), source_id, published_at (UTC), content_hash.
4. Дедуплицируешь: `pipeline/dedupe.ts` сравнивает с последними 500 сигналами по cosine similarity.
5. Кластеризуешь: `pipeline/cluster.ts` группирует по теме (новый cluster или прикрепление к существующему за 30 дней).
6. Пишешь в `signals` со status=`new`.
7. Логируешь в `.scqr/logs/collect-<ts>.log`.

## Выход
```json
{
  "slot": "morning",
  "fetched": 87,
  "new": 64,
  "duplicates": 19,
  "errors": 4,
  "clustered_into": 12,
  "signal_ids": [142, 143, ...]
}
```

## Контроль качества
- Источник упал → `last_error` + skip, не падаем целиком.
- > 30% источников упало → алерт владельцу заметкой в финальном выводе.
- Пустые summary → выбрасываем сигнал из этой пачки (повторим в следующий слот).

## Связанный subagent
`signal-collector` (.claude/agents/signal-collector.md).
