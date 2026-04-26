# SCQR Automations

Документ описывает автоматические задачи сборщика сигналов. Обновляется при каждом изменении расписания.

---

## Текущее расписание

| Задача | ID | Время (МСК) | Дни | Действие |
|---|---|---|---|---|
| Утренний сбор | `scqr-morning-collect` | 08:00 | Пн–Вс (7/7) | `collect morning` → `pack morning` |
| Вечерний сбор | `scqr-evening-collect` | 19:00 | Пн–Вс (7/7) | `collect evening` → `pack evening` |

Задачи управляются через **Claude Code Scheduled Tasks** (раздел «Scheduled» в сайдбаре).

### Крон-выражения

```
scqr-morning-collect  cronExpression: "0 8 * * *"   # каждый день в 08:00 по локальному времени (МСК, UTC+3)
scqr-evening-collect  cronExpression: "0 19 * * *"  # каждый день в 19:00 по локальному времени (МСК, UTC+3)
```

Крон вычисляется в локальном часовом поясе машины (МСК = UTC+3). Система применяет небольшой случайный джиттер ±10 мин для балансировки нагрузки — фактическое время пуска может немного смещаться.

---

## Логика выходных дней

**До этого изменения**: расписание работало только пн–пт (стандартная ошибка `1-5` в cron).

**Теперь**: оба расписания работают `* * *` (7 дней в неделю). Владелец получает пакеты и в субботу, и в воскресенье — без каких-либо пропусков.

### Weekend Digest (воскресенье вечером)

Воскресный вечерний пакет автоматически получает флаг `weekly_digest=true` в таблице `packs`. При этом:
- `pack.ts` определяет воскресенье через `slot === 'evening' && new Date().getDay() === 0`.
- В конец MD-файла добавляется блок `## Weekend Digest` с агрегатом по количеству сигналов за Сб–Вс.
- Владелец видит итог выходных одним файлом — не нужно смотреть оба дня отдельно.

---

## Файлы задач

Задачи хранятся как skill-файлы:

```
C:\Users\user\.claude\scheduled-tasks\
├── scqr-morning-collect\SKILL.md
└── scqr-evening-collect\SKILL.md
```

---

## Что выполняется при каждом запуске

### Утро (08:00)
1. `pnpm scqr db backup` — резервная копия БД перед сбором
2. `pnpm scqr collect morning` — обход активных источников, запись в `.scqr/logs/collect-morning-YYYYMMDD.jsonl`
3. `pnpm scqr pack morning` — MD-пакет в `.scqr/packs/YYYY-MM-DD-morning.md`

### Вечер (19:00)
1. `pnpm scqr collect evening` — обход источников, запись в `.scqr/logs/collect-evening-YYYYMMDD.jsonl`
2. `pnpm scqr pack evening` — MD-пакет в `.scqr/packs/YYYY-MM-DD-evening.md`
   (в воскресенье добавляется Weekend Digest)

---

## Как изменить расписание

Через Claude Code Scheduled Tasks (GUI) или через MCP:
```
mcp__scheduled-tasks__update_scheduled_task(
  taskId: "scqr-morning-collect",
  cronExpression: "0 9 * * *"   # сдвинуть на 09:00
)
```

Крон — всегда **локальное время МСК**, не UTC.

---

## Мониторинг

- JSONL-логи: `.scqr/logs/collect-<slot>-<YYYYMMDD>.jsonl`
  - Каждая строка = один источник: `source_id`, `fetched_count`, `deduplicated_count`, `error`
- Авто-деактивация: если источник падает 3 раза подряд → `active=false` + запись в `decision_log`
- Алерт: если >30% источников упало за один прогон — collect выводит предупреждение в stdout задачи
- Бэкапы: `.scqr/backups/data-YYYYMMDD-HHmm.db`
