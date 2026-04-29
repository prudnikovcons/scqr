# Codex Inbox — формат задания

Сюда я (Claude) кладу задания на генерацию графики. Codex (твой Codex Desktop / Codex CLI) выполняет их и кладёт результат по указанному пути. Watcher в `review-server` проверяет инбокс каждые 30 секунд.

## Папки

- `codex-inbox/` — задания со статусом `pending`, ждут выполнения.
- `codex-done/` — выполненные задания (с обновлённым frontmatter).
- `codex-failed/` — задания, которые Codex не смог завершить.

## Формат файла

Каждое задание — один `.md` файл с YAML-frontmatter и markdown-телом.

```
---
type: cover                          # cover | mascot | illustration | infographic
slug: 2026-04-27-marketplace-...    # slug статьи (для type=cover) или имя ассета
target_path: D:\CODEX\gitscqr\scqr\site\src\assets\editorial\contributed\2026-04-27\<slug>.png
size: 1536x1024
priority: high                       # high | normal | low
status: pending                      # pending | in_progress | done | failed
created_at: 2026-04-29T18:00:00Z
---

# Полный промт для Codex

Здесь стиль, композиция, что нарисовать, какие цвета,
какие надписи на обложке, нужен ли маскот и в какой позе…

Заканчиваем явным указанием:
**Сохрани результат строго по пути:** `<target_path выше>`
```

## Workflow

1. Я кладу файл в `codex-inbox/` со статусом `pending`.
2. **Если задано `SCQR_CODEX_CMD` в `.env.local`** (например `codex exec --full-auto`):  
   review-server каждые 30 секунд берёт по одному `pending`, обновляет статус на `in_progress`, вызывает Codex CLI с телом задания, проверяет, что файл создан по `target_path`, переносит задание в `codex-done/`. Если для `type=cover` указан `slug` — автоматически подвязывает обложку к статье через `/api/article-codex-import`.
3. **Если CLI не настроен** — watcher оставляет задания в `pending`. Ты периодически открываешь Codex Desktop и одной командой говоришь:  
   ```
   Открой папку D:\CODEX\gitscqr\scqr\.scqr\codex-inbox\, возьми любое задание со статусом pending, выполни промт из тела, сохрани файл по target_path. После этого пометь у файла status: done, completed_at: <iso>, и я подтяну остальное автоматически.
   ```

## Что делает review-server при появлении файла

- `type: cover` + `slug`: копирует PNG в `site/public/editorial/og/<date>/<slug>.png`, прописывает `heroImage` в frontmatter статьи и `ogUrl` в sidecar. Обложка сразу появляется в `/editor` и `/queue`.
- `type: mascot`: ничего сверх перемещения в `done/` (просто сохраняем файл по нужному пути).
- `type: illustration` / `infographic`: то же самое — Codex просто кладёт файл, я (Claude) потом руками вписываю его в нужное место.
