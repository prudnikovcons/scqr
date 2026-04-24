---
name: brief-cover
description: Используй после factcheck для формирования cover brief — описание обложки для Codex-operator. Claude Code не генерирует растровые изображения сам. Триггер — статус job=briefing (часть briefing-фазы) или явный запрос «сделай бриф обложки».
---

# brief-cover

## Когда срабатывает
- article_job в статусе `briefing`.

## Вход
- `.scqr/jobs/<job-id>/edited.md`
- `.scqr/jobs/<job-id>/input.json`
- `docs/editorial-image-system.md`
- `docs/editorial-designer-operating-model.md`
- `site/src/data/editorial-image-styles.js` (enum)
- `site/src/assets/editorial/` — соседи на главной

## Шаги
1. Спавнишь `visual-briefer` через Task tool.
2. visual-briefer пишет `.scqr/jobs/<job-id>/visual-brief.md` (см. формат в .claude/agents/visual-briefer.md).
3. Копируешь в очередь: `pnpm scqr brief:save <slug> .scqr/jobs/<job-id>/visual-brief.md` → `.scqr/visual-queue/<slug>.md`.

## Жёсткие правила
- heroAlt не «редакционная обложка SCQR», а конкретное описание сцены.
- heroStyle берёшь только из enum в editorial-image-styles.js.
- Не используешь `legacy` стили для wave-1/2 материалов на первой полосе.

## Выход
- `.scqr/jobs/<job-id>/visual-brief.md`.
- `.scqr/visual-queue/<slug>.md` (для Codex-operator).

## Что дальше
Codex-operator (отдельная сессия или automation) подхватит из `.scqr/visual-queue/`, сгенерирует через gpt-image-1.5 и положит в `site/src/assets/editorial/<slug>-hero.svg|png`.
