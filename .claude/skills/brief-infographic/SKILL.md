---
name: brief-infographic
description: Используй для подготовки SVG-инфографики (timeline, comparison, chain map). В отличие от обложек — Claude Code может писать SVG сам, потому что это код, а не растр. Триггер — writer/editor явно пометил в notes «нужен график X».
---

# brief-infographic

## Когда срабатывает
- В draft.notes.md или edit.notes.md упомянута необходимость SVG-схемы.
- Тип материала — analysis (где график осмыслен).

## Вход
- `.scqr/jobs/<job-id>/edited.md`
- `docs/editorial-image-system.md` (раздел про инфографику и сетку)
- Существующие графики в `site/public/editorial/graphics/` для проверки стиля и переиспользования.

## Шаги
1. Спавнишь `visual-briefer` с подзадачей `infographic`.
2. Если схема простая (timeline 3-5 точек, comparison 2 колонки, chain map 4-5 узлов) — visual-briefer пишет SVG-код прямо в visual-brief.md.
3. Если схема сложная — оставляет TODO с подробным описанием для дизайнера.
4. Готовый SVG валидируешь:
   - viewBox = 1200x675 (full-width) или 800x450 (inline);
   - шрифты — Atkinson или системные (без external @font-face);
   - цвета из палитры SCQR (серый #1F2937, акцент #C8102E или из existing assets);
   - alt-описание в `<title>` SVG.
5. Сохраняешь в `site/public/editorial/graphics/<article-slug>-<purpose>.svg` (НЕ коммитишь до апрува).
6. Вставляешь в edited.md ссылку:
   ```html
   <figure class="article-graphic">
     <img src="/editorial/graphics/<slug>-<purpose>.svg" alt="<описание>" />
     <figcaption><короткая подпись></figcaption>
   </figure>
   ```

## Жёсткие правила
- Не используешь external <foreignObject> или scripts в SVG (только статика).
- Каждая инфографика опирается на конкретное утверждение в тексте — не графика ради графики.
- Подписи на русском, размер шрифта ≥14px.

## Выход
- SVG-файл в `site/public/editorial/graphics/`.
- Обновлённый edited.md с figure-блоком.
