# SOURCES_RESEARCH — кандидаты на добавление в реестр

Документ сформирован source-scout 2026-04-26. Все источники добавлены в БД как `active=false` с `notes='pending_review'`. **Активировать может только владелец** командой:

```bash
# Пример активации источника id=4 (Google DeepMind)
# Пока нет команды activate — делаем через deactivate+add или прямой SQL
# TODO: добавить pnpm scqr sources activate <id> в следующем цикле
```

Для активации сейчас: найти строку в таблице `sources` через `.scqr/data.db` (SQLite) и обновить `active=1`. Или проверить, нужен ли новый CLI-хелпер.

---

## Кандидаты (9 источников)

| ID | Название | Категория | RSS | Score | Язык | Статус |
|---|---|---|---|---|---|---|
| 4 | Google DeepMind Blog | research-blogs | ✅ | 9 | en | pending_review |
| 5 | Microsoft Research Blog | research-blogs | ✅ | 8 | en | pending_review |
| 6 | NVIDIA Technical Blog | infra | ✅ (Atom) | 8 | en | pending_review |
| 7 | AWS Machine Learning Blog | infra | ✅ | 8 | en | pending_review |
| 8 | Meta AI Blog | research-blogs | ❌ (html) | 9 | en | pending_review |
| 9 | Mistral AI News | research-blogs | ❌ (html) | 8 | en | pending_review |
| 10 | Habr / Искусственный интеллект | ru-market | ✅ | 7 | ru | pending_review |
| 11 | NIST News (AI) | regulators | ✅ | 8 | en | pending_review |
| 12 | EU AI Office (EC Digital Strategy) | regulators | ❌ (regulator) | 9 | en | pending_review |

---

## Детальные обоснования

### 4 — Google DeepMind Blog
**URL:** https://deepmind.google/blog/  
**RSS:** https://deepmind.google/blog/rss.xml ✅  
**Обоснование:** Первоисточник исследований Google DeepMind — Gemini, AlphaFold, AlphaCode. Один из самых авторитетных блогов в мире AI. RSS валидирован: feed title "Google DeepMind News", последние публикации апрель 2026.  
**Рекомендация:** Активировать немедленно.

### 5 — Microsoft Research Blog
**URL:** https://www.microsoft.com/en-us/research/blog/  
**RSS:** https://www.microsoft.com/en-us/research/feed/ ✅  
**Обоснование:** Официальный блог Microsoft Research. LLM, AI safety, foundational research. Фид подтверждён. Менее частый (~biweekly), но высокое качество.  
**Рекомендация:** Активировать.

### 6 — NVIDIA Technical Blog
**URL:** https://developer.nvidia.com/blog/  
**RSS:** https://developer.nvidia.com/blog/feed/ ✅ (Atom)  
**Обоснование:** Первоисточник по GPU-инфраструктуре, CUDA, TensorRT, inference optimization. Высокая частота. Важен для категории infra.  
**Рекомендация:** Активировать.

### 7 — AWS Machine Learning Blog
**URL:** https://aws.amazon.com/blogs/machine-learning/  
**RSS:** https://aws.amazon.com/blogs/machine-learning/feed/ ✅  
**Обоснование:** Официальный ML-блог Amazon. Облачный AI/ML, SageMaker, Bedrock. Высокая частота. Может генерировать много шума — следить за quality на ретро.  
**Рекомендация:** Активировать, но мониторить качество (score 8 можно снизить до 7 если шума много).

### 8 — Meta AI Blog
**URL:** https://ai.meta.com/blog/  
**RSS:** ❌ не найден  
**Обоснование:** FAIR + продуктовые исследования Meta (Llama, PyTorch). Очень высокая авторитетность. Требует HTML-коллектор.  
**Рекомендация:** Активировать — HTML-коллектор в engine работает. Периодически проверять структуру страницы.

### 9 — Mistral AI News
**URL:** https://mistral.ai/news  
**RSS:** ❌ не найден  
**Обоснование:** Официальные новости Mistral AI (ведущая европейская лаборатория). Менее частые публикации, но высокое качество.  
**Рекомендация:** Активировать с типом html.

### 10 — Habr / Искусственный интеллект
**URL:** https://habr.com/ru/hubs/artificial_intelligence/articles/  
**RSS:** https://habr.com/ru/rss/hubs/artificial_intelligence/articles/ ✅  
**Обоснование:** Лучший консолидирующий ru-market источник. Публикуют корпоративные блоги Яндекс, Сбер, VK, российские исследователи. Высокая частота (~10+ статей/день), нужен строгий quality-filter на этапе рецензии.  
**Рекомендация:** Активировать, но score=7 (есть шум). Владелец решает на ретро.

### 11 — NIST News (AI)
**URL:** https://www.nist.gov/news-events/news  
**RSS:** https://www.nist.gov/news-events/news/rss.xml ✅  
**Обоснование:** Официальные новости NIST. AI Agent Standards Initiative, AI Risk Management Framework. Регулярно — AI-сигналы несколько раз в месяц. Важен для категории regulators.  
**Рекомендация:** Активировать.

### 12 — EU AI Office (EC Digital Strategy)
**URL:** https://digital-strategy.ec.europa.eu/en/policies/ai-office  
**RSS:** ❌ (нет нативного RSS)  
**Обоснование:** Официальный регулятор EU AI Act. Очень важен. Альтернатива: использовать EC Press Corner RSS для digital-категории: `https://ec.europa.eu/commission/presscorner/api/rss?parea=PR-DIGITAL&lang=en`.  
**Рекомендация:** Активировать как `regulator` тип. Возможно, при следующем source-scout заменить URL на EC Press Corner RSS и тип на `rss`.

---

## Не включены (и почему)

| Кандидат | Причина |
|---|---|
| xAI (x.ai/news) | Страница вернула 403, RSS нет — ненадёжный источник |
| NVIDIA Blog (general) | Дубль NVIDIA Technical Blog, те же публикации |
| Reddit (r/MachineLearning) | Исключён по правилам source-policy (форум) |

---

## Ещё не исследованы (следующий source-scout)

По итогам первого прогона охвачены только research-blogs, infra, regulators (частично), ru-market (частично). На следующем source-scout нужно добавить:

- **asia-ai**: ByteDance Research, Zhipu AI, PFN (Japan)
- **chip-vendors**: AMD AI Blog, Intel AI Blog, Qualcomm AI
- **industry**: Salesforce AI Research, IBM Research AI, Databricks Blog
- **ru-market**: Яндекс Research отдельно (если появится отдельный RSS), AI Journal Russia

Цель: 70-90 активных источников (сейчас после апрува будет ~12, нужно ещё ~60).
