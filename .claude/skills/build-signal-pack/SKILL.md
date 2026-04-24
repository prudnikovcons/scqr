---
name: build-signal-pack
description: Используй для сборки md-пакета сигналов на рецензию владельцу. Триггер — команда `pnpm scqr pack <slot>` или явный запрос «собери пакет на ревью». Не путать с collect-signals (это сбор), здесь — компоновка ленты на одну сессию рецензии.
---

# build-signal-pack

## Когда срабатывает
- После collect-signals — есть свежие `signals.status='new'`.
- На ad-hoc запрос владельца.

## Вход
- `signals.status='new'` за последние ≤24 часа.
- `decision_log` за последние 7 дней — чтобы видеть, что владелец уже решал, и связывать новые сигналы с прошлыми.
- `sources` для отображения source.name и authority_score.

## Шаги
1. Читаешь pending сигналы.
2. Сортируешь по `score = source_authority * recency_factor * cluster_size_factor`.
3. Берёшь верхние 20-30 (учитывая разные кластеры — не больше 5 сигналов из одного кластера).
4. Формируешь markdown в `.scqr/packs/YYYY-MM-DD-<slot>.md`:

```markdown
# SCQR Pack — <YYYY-MM-DD> <slot>

Generated: <ISO timestamp>
Signals: <N> (cluster groups: <K>)

---

## SIG-1 — <title>
**Source**: <name> (authority: 7/10)
**Published**: <YYYY-MM-DD HH:MM>
**Why now**: <1 строка — почему важно сейчас, из cluster context или score reason>
**Cluster**: <theme или null>
**URL**: <link>

<summary 200-400 символов>

---

## SIG-2 — ...
```

5. Обновляешь `signals.status` на `in_pack` для включённых сигналов.
6. Создаёшь запись `packs` со ссылкой на md-файл, signal_count, status=pending_review.
7. Добавляешь подсказки из `memory` за прошлую неделю в верх пакета (раздел «Подсказка от ретро»).

## Выход
- Markdown-файл в `.scqr/packs/`.
- ID нового pack'а.
- Сообщение владельцу: «Пакет YYYY-MM-DD-<slot> готов: N сигналов, K кластеров. Файл: <path>. Жду рецензию в `.scqr/reviews/YYYY-MM-DD-<slot>.md`.»

## Связанный subagent
`signal-collector` (с другим контекстом — сборка пакета, а не сбор).
