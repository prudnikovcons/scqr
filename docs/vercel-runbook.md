# SCQR Vercel Runbook

> Updated 2026-04-25 после workspace-реструктуризации. Корень репозитория — `D:\CODEX\gitscqr\scqr\`, Astro-сайт переехал в `site/` подпапку.

## Цель

Стабильный Git-connected деплой Astro-сайта на Vercel из подпапки `site/` нового pnpm-workspace.

## Текущая модель деплоя

- Фреймворк: Astro static site
- Источник контента: `site/src/content/posts/*.md`
- Хостинг: Vercel project, привязанный к `https://github.com/prudnikovcons/scqr.git`
- Релиз-цепочка: локальные изменения → коммит → push в `main` → Vercel автоматически собирает

## Vercel project settings (после реструктуризации)

| Поле | Значение |
|---|---|
| Framework Preset | Astro |
| Root Directory | `site` |
| Build Command | `pnpm --filter site build` (или `astro build` если root=site) |
| Install Command | `pnpm install --frozen-lockfile` |
| Output Directory | `dist` (внутри site/) |
| Node Version | 22.x |
| Package Manager | pnpm 10 |

**Важно**: Root Directory нужно поменять с `/` (или `scqr`) на `site` — иначе Vercel не найдёт `package.json` и `astro.config.mjs`.

## Локальные команды

```bash
cd D:\CODEX\gitscqr\scqr
pnpm install                 # установка всех зависимостей workspace
pnpm --filter site build     # production-сборка в site/dist
pnpm --filter site preview   # локальный preview сборки
pnpm --filter site dev       # dev-сервер (http://localhost:4321)
pnpm check                   # astro check
```

Скрипт импорта контента из WordPress (`D:\CODEX\SCQR`):

```bash
pnpm --filter site exec node scripts/import-scqr-content.mjs
# или
cd site && node scripts/import-scqr-content.mjs
```

## Первая настройка Vercel после реструктуризации

1. Войти в дашборд: `https://vercel.com/<team>/scqr`.
2. Settings → General → Root Directory → изменить на `site` → Save.
3. Settings → General → Build & Development Settings:
   - Framework: Astro (уже)
   - Build Command: оставить override `pnpm --filter site build` или просто `astro build`
   - Install Command: `pnpm install --frozen-lockfile`
   - Output Directory: `dist`
4. Settings → General → Node.js Version → 22.x.
5. Trigger preview deploy на текущей ветке `chore/workspace-restructure`. Проверить, что preview ссылка отрисовывает главную и одну статью.
6. Только после успешного preview — мёрж ветки в `main`. Vercel автоматически перенесёт production-домен.

## Чек-лист перед релизом

1. На локальной машине: `pnpm --filter site build` без ошибок.
2. `pnpm scqr doctor` зелёный.
3. Просмотр изменённых маршрутов в `site/dist/`.
4. Push на feature-ветку → Vercel preview deploy.
5. Проверить главную, одну рубрику, одну статью на preview-URL.
6. Мёрж в `main` через PR (автоматический prod-деплой).

## Известные ограничения

- `gh` CLI не установлен в текущем окружении — PR открывается через GitHub UI вручную.
- Vercel CLI (`npx vercel`) требует одноразовой авторизации владельцем (`vercel login`) перед первым `vercel pull`/`vercel deploy` локально.
- Скрипты в `site/scripts/*.mjs` используют относительные пути (`./src/content/posts/...`) — запускать только из `site/` директории.

## Разделение обязанностей

- **Codex/Claude Code** — готовит код, статьи, метаданные, ветки и коммиты.
- **Владелец** — открывает PR, делает one-time `vercel login` при необходимости, управляет доменом и DNS.
- После первичной привязки — релизы идут автоматически через push в `main`.
