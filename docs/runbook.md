# Runbook — рабочие сценарии редакции

> Что делать, когда что-то происходит. Реальный, а не идеальный пайплайн: пока engine CLI — заглушки (`pnpm scqr collect|pack|...` отвечают «stub, lands in Phase 3»), редактор работает руками. Этот документ — правда о текущем состоянии, не план.

---

## 1. Пришли свежие сигналы (типичный день)

**Кто инициирует:** владелец присылает сигналы — урлы, фрагменты текста, наблюдения, или просит Claude самому обойти 3-5 источников.

**Что делает Claude:**

1. **Открыть рабочую папку для пакета:** `mkdir -p .scqr/packs/`. Имя пакета: `2026-04-25-evening.md` (по дате + slot).
2. **Собрать сырые сигналы.** Если URL'ы — открыть каждый через WebFetch, получить заголовок + первый абзац + источник. Если текст — нормализовать.
3. **Написать пакет** в формате:
   ```markdown
   # Пакет сигналов — 2026-04-25 (evening)

   Всего сигналов: N. Подсветил важность жирным.

   ## 1. Заголовок сигнала
   - **Источник:** [имя](url) · 2026-04-25
   - **Суть:** одна фраза.
   - **Почему важно:** одна фраза. Связь с прошлыми материалами (если есть).
   - **Кандидат на:** новость / аналитика / колонка / архив.

   ## 2. ...
   ```
4. **Положить пакет в `.scqr/packs/<date>-<slot>.md`** и открыть путь владельцу.

**Что делает владелец:** читает, пишет рецензию в `.scqr/reviews/<date>-<slot>.md` свободным текстом. Решения по сигналам в любом стиле — «1 — пиши новостью с акцентом на X», «2 — отложить», «3 — серия», и т.п.

---

## 2. Получена рецензия — производство статьи

**Что делает Claude:**

1. **Прочитать рецензию.** Разложить по сигналам: для каждого — `action ∈ {write, defer, archive, keep_context, series}`, `thesis`, `must_include`, `tone`. Сохранить в `.scqr/reviews/<date>-<slot>.actions.json` для истории.
2. **Для каждого `write`:**
   1. Создать рабочую папку `.scqr/jobs/<job-id>/` (id = `<date>-<slug>`).
   2. Положить `input.json`: `{ thesis, must_include, must_avoid, tone, signal_url, evidence_urls[], style_hints }`.
   3. **Глубокий research.** Открыть `signal_url` + первоисточники. Собрать факты, цифры, имена, даты. Если факт сомнителен — пометить `[НУЖНА ПРОВЕРКА]`, не писать.
   4. **Draft → `.scqr/jobs/<id>/draft.md`.** Структура из `docs/style-guide.md`. 200+ слов для analysis, 700+ для column. Никакой жёлтой подачи (см. `docs/editorial-rules.md`).
   5. **Edit → `edited.md`.** Удалить лишние слова, выровнять ритм, проверить, что тезис проходит сквозь весь текст.
   6. **Factcheck → `factcheck.json`.** `{ status: pass|fail, issues: [{claim, sources, status}] }`. Любой `fail` — стоп, чинить.
   7. **Frontmatter.** Использовать `site/scripts/create-post.mjs` как шаблон или вручную, опираясь на любую существующую статью (например `2026-04-24-criticgpt-kritik-dlya-modeley.md`). Поля-каркас:
      ```yaml
      title:
      description:        # ≤ 160 chars, для SEO/OG
      deck:               # обычно совпадает с description
      scqrVerdict:        # короткий «вывод SCQR» в правый рейл
      pubDate:            # ISO с временем
      articleType:        # news | analysis | column | illustration
      stage: ready
      status: ready
      rubrics: []         # из {trajectories, generations, automations, innovations, illusions, russia, regulations, theories, tendencies}
      rubricLabels: []    # русские названия в том же порядке
      topics: []
      storyCluster:       # опционально, slug
      sourceNote:         # 1-2 фразы об источниках
      readingTime:        # минуты, целое
      publicUrl: /<slug>/
      heroAlt:
      heroStyle:          # см. site/src/data/editorial-image-styles.js
      heroSource: generated | user-supplied
      heroImage: ../../assets/editorial/<file>.svg или .png
      ```
   8. **Сохранить статью.** **Сейчас CLI-команда `scqr article:save` — заглушка**, поэтому пишем напрямую в `site/src/content/posts/<slug>.md`. После того как Phase 3 будет реализована, маршрут поменяется.
   9. **Visual brief** в `.scqr/visual-queue/<slug>.md`. Описание сцены для Codex-operator (не генерим картинку — только бриф).
3. **Валидация.**
   - `pnpm --filter site exec node scripts/validate-content.mjs` — должно быть 0 errors.
   - `pnpm --filter site build` — 290+ страниц, без ошибок.
4. **Git.**
   - `git checkout -b article/<slug>`
   - `git add site/src/content/posts/<slug>.md` (+ `site/src/assets/editorial/...` если есть)
   - `git commit -m "post: <slug>"` (тело по `docs/style-guide.md`)
   - `git push origin article/<slug>`
   - PR открывает владелец вручную (gh CLI не установлен).
5. **Vercel.** Preview соберётся автоматически на feature-ветке. После merge в `main` — production deploy.

---

## 3. Конфликт версий контента

Если build падает с ошибкой Astro content collection — открыть `site/src/content.config.ts` и сверить frontmatter с zod-схемой. Чаще всего:
- лишнее поле, которого нет в схеме
- `pubDate` не в ISO
- `rubrics` содержит slug не из allow-list

---

## 4. Codex-operator не сгенерил обложку вовремя

Можно опубликовать с временным placeholder из `site/public/blog-placeholder-*.jpg`, тогда `heroSource: placeholder`. Когда обложка готова — отдельный коммит + replace.

---

## 5. Сломалась прода

Проверить:
1. `git log --oneline origin/main -3` — последние коммиты.
2. `pnpm --filter site build` локально — воспроизводится?
3. Vercel logs — `vercel logs --token ...` (или через дашборд).
4. Если build падает — откатить последний коммит: `git revert <sha>`, push.

---

## 6. «Сегодня будут новые сигналы» — статус-чеклист

- [ ] `pnpm scqr doctor` — всё зелёное (✅ 25 апр.)
- [ ] Прод-сайт открывается — [scqr.ru](https://scqr.ru) (Vercel auto-deploy после merge в main)
- [ ] Валидатор контента работает корректно (✅ парсер CRLF починен)
- [ ] Существующие 65 статей валидны — 0 errors
- [ ] Рабочие папки `.scqr/{packs,reviews,jobs,visual-queue}/` созданы

---

## 7. Чего избегать

- **Не писать в `site/src/content/posts/` без валидации.** Astro content collection схема жёсткая.
- **Не `git push --force` ни на одну ветку.**
- **Не комитить ключи API в коде.** `.env` в `.gitignore`.
- **Не выпускать колонку без `scqrVerdict`.** Это правый рейл статьи — он будет пуст.
