# SCQR Review Interpretation

> Как свободный текст рецензии владельца превращается в JSON `review_actions`. Это самый критичный шаг во всей системе — если он работает плохо, весь pipeline ниже идёт не туда.

## 1. Зачем

Владелец не должен заполнять формы. Утром он читает md-пакет и пишет одну рецензию свободным текстом — как заметку для самого себя. `review-interpreter` (модель `opus`) разбирает её на структурированные действия, которые CLI пишет в БД.

## 2. Артефакты

### Вход

Два файла:
- `.scqr/packs/YYYY-MM-DD-<slot>.md` — пакет с сигналами (display_id формата `SIG-N`).
- `.scqr/reviews/YYYY-MM-DD-<slot>.md` — свободная рецензия владельца.

Опциональный третий вход — выгрузка `decision_log` за последние 7 дней, чтобы интерпретатор не противоречил недавним решениям владельца.

### Выход

Один файл — `.scqr/jobs/review-<reviewId>/actions.json`. Массив объектов, по одному на каждый сигнал из пакета (без пропусков).

## 3. Схема `review_action`

```typescript
type Action = "write" | "defer" | "archive" | "keep_context" | "combine" | "series_candidate";

interface ReviewAction {
  signal_id: number;            // SIG-N → numeric id из таблицы pack_items
  action: Action;
  thesis?: string;              // тезис материала (для action="write")
  tone?: "news" | "analysis" | "column";
  must_include?: string;        // дословные формулировки/цитаты владельца
  must_avoid?: string;          // что избегать
  combine_with?: string[];      // ["SIG-2", "SIG-7"] — для action="combine"
  series_anchor?: string;       // якорный сигнал — для action="series_candidate"
  defer_until?: string;         // ISO date — для action="defer"
  reason: string;               // обязательно: одна строка-обоснование
}
```

## 4. Семантика actions

### `write`
Пишем материал. Обязательно `thesis` или (если владелец не дал тезис явно, но сказал «надо написать») заполняешь `reason: "explicit owner request without thesis"` и помечаешь job как требующий уточнения.

### `defer`
Отложить. Если в рецензии есть дата возврата — `defer_until` в ISO-формате (`2026-05-09`). Если просто «отложить» без даты — `defer_until: null`, `reason` объясняет, чего ждём.

### `archive`
Слабый сигнал, не возвращаемся. Запись пишется в `decision_log` для истории. Сигнал больше не появится в будущих пакетах.

### `keep_context`
Дефолт для сигналов, которые рецензент не упомянул явно ни прямо, ни по теме. Сигнал остаётся в БД, его учитывают в кластерах и `pack-builder` будущих пакетов, но материал по нему сейчас не пишем.

### `combine`
Объединить с другим сигналом. `combine_with` — список SIG-id; первый элемент считается якорным. Создаётся **один** `article_job` с `signal_id` = якорный, остальные сигналы прикрепляются через метаданные job.

### `series_candidate`
Кандидат в серию из 2+ материалов с общим `storyCluster`. `series_anchor` — главный сигнал серии. `article_jobs` для каждого члена серии создаются отдельно, но с общим `storyCluster` в frontmatter.

## 5. Жёсткие правила интерпретации

1. **Каждый сигнал из пакета имеет ровно одну запись в массиве.** Никаких пропусков, никаких дублей. Если пакет — 25 сигналов, в actions.json — 25 объектов.

2. **Сохраняй формулировки владельца дословно.** Если рецензент написал «фильтр допуска по факту стал экономическим, а не техническим» — это идёт в `must_include` или `thesis` без перефразировки.

3. **Не додумывай тезис.** Если в рецензии нет ясной позиции, но есть указание «надо писать» — `action: "write"`, `thesis: null`, `reason: "owner asked to write but no clear thesis given — needs clarification"`. Job создастся, но сразу уйдёт в `error` и владельцу придёт запрос уточнить.

4. **Одна фраза рецензии может относиться к нескольким сигналам — раскладывай.** Если владелец пишет «по корпоративным агентам — пишем оба, и SIG-3, и SIG-12» — в actions два write-объекта.

5. **При неуверенности — `defer`, не `archive`.** Архив — окончательный, defer возвращаемый. Если рецензент сомневается — defer.

6. **`tone` берём из контекста.** Если рецензия не указала, смотрим на пакет (там обычно есть подсказка importance_note про news/analysis/column) или на signal source — лабораторный анонс чаще news, инфраструктурный сдвиг — analysis, тематическая рамка — column.

7. **`signal_id` — числовой PK из pack_items**, не строка `SIG-N`. CLI получит SIG-id из дисплейного формата `SIG-N` через lookup в `pack_items.display_id`.

## 6. Анти-паттерны

### Антипаттерн 1 — пересказ рецензии в `reason`
Плохо:
```json
{ "signal_id": 142, "action": "write", "reason": "владелец пишет, что это важно для рынка ИИ" }
```
Хорошо:
```json
{ "signal_id": 142, "action": "write", "thesis": "Партнёрство OpenAI–SoftBank переводит ИИ в инфраструктурный режим — теперь решает не модель, а доступ к энергии и стройке.", "reason": "explicit write directive in review, paragraph 2" }
```

### Антипаттерн 2 — попытка «улучшить» формулировку владельца
Если рецензент написал угловато, не сглаживай. Дословное `must_include` лучше литературного перефразирования.

### Антипаттерн 3 — обнаружение «подразумеваемого»
Не вычитываешь между строк. Если рецензия не упомянула сигнал — `keep_context`, не `archive`. Архив — только при явной формулировке «это слабый» / «не наша тема» / «забыть».

### Антипаттерн 4 — `combine` без явного указания
Не объединяешь сигналы по своей инициативе, даже если они тематически близки. `combine` — только при явном упоминании в рецензии.

## 7. Пример

### Пакет (фрагмент)

```markdown
## SIG-1 — Anthropic подписал многогигаваттное соглашение с AWS
Source: Anthropic News (authority: 9/10)
...

## SIG-2 — OpenAI запустил GPT-5.4-cyber как режим доверенного доступа
Source: OpenAI Blog (authority: 10/10)
...

## SIG-3 — В Калифорнии законопроект о доступе к compute для лабораторий
Source: California Legislature (authority: 8/10)
...
```

### Рецензия

```markdown
SIG-1 и SIG-2 — оба про инфраструктурный поворот, объединить в analysis с тезисом
"Лаборатории больше не продают модель, они продают режим допуска к ней". 
Якорь — SIG-2, он сильнее как новость.

SIG-3 — отложить, законопроект ещё далёк от голосования, вернёмся когда будут чтения.
```

### Выход (`actions.json`)

```json
[
  {
    "signal_id": 41,
    "action": "combine",
    "combine_with": ["SIG-2", "SIG-1"],
    "thesis": "Лаборатории больше не продают модель, они продают режим допуска к ней",
    "tone": "analysis",
    "reason": "explicit combine directive, anchor SIG-2"
  },
  {
    "signal_id": 42,
    "action": "combine",
    "combine_with": ["SIG-2", "SIG-1"],
    "thesis": "Лаборатории больше не продают модель, они продают режим допуска к ней",
    "tone": "analysis",
    "reason": "explicit combine directive, anchor SIG-2 (this is anchor)"
  },
  {
    "signal_id": 43,
    "action": "defer",
    "defer_until": null,
    "reason": "explicit defer — review says 'wait for legislative readings'"
  }
]
```

(Заметь: `combine` создаёт **один** article_job на якоре SIG-2, поэтому SIG-1 и SIG-2 оба имеют `combine_with` для трассировки в БД, но job будет один. CLI это разбирает.)

## 8. Валидация (Zod-схема в engine)

В Phase 3 `engine/src/schemas/review-action.ts` будет содержать Zod-схему. Валидация обязательна перед сохранением:

- `signal_id` существует в pack_items данного пакета.
- `action` ∈ enum.
- `combine_with` — массив существующих SIG-id.
- `defer_until` — валидный ISO date или null.
- `reason` непустой.
- `thesis` обязателен для `action: "write"` ИЛИ `reason` содержит явный маркер `"clarification_needed"`.

При fail валидации — interpreter возвращает контекст, и интерпретация перезапускается.

## 9. Связанные документы

- [.claude/agents/review-interpreter.md](../.claude/agents/review-interpreter.md) — промпт интерпретатора.
- [.claude/skills/interpret-review/SKILL.md](../.claude/skills/interpret-review/SKILL.md) — скилл оркестрации.
- [docs/editorial-rules.md](editorial-rules.md) — общие редакционные правила.
- [docs/EXEC_PLAN.md](EXEC_PLAN.md) — раздел про FSM и контракты.
