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

---

## Round 2 — Аналитики и инфлюэнсеры (2026-04-26)

Source-scout запущен повторно по запросу владельца: нужны авторитетные аналитики и инфлюэнсеры для цитат, прогнозов, подтверждения тезисов. Все добавлены как `active=false` (pending_review), ID 13–37.

### analysts-en (ID 13–28)

| ID | Название | Категория | Тип | Score | Обоснование |
|---|---|---|---|---|---|
| 13 | Import AI (Jack Clark) | analysts-en | rss | 9 | Сооснователь Anthropic. Еженедельный дайджест — первоисточник по AI safety/policy |
| 14 | Ahead of AI (Sebastian Raschka) | analysts-en | rss | 8 | Глубокий технический разбор LLM-архитектур |
| 15 | Interconnects (Nathan Lambert) | analysts-en | rss | 8 | Директор AI2 по alignment. Insider-взгляд на RLHF, preference learning |
| 16 | One Useful Thing (Ethan Mollick) | analysts-en | rss | 8 | Wharton профессор, практическое применение AI в работе |
| 17 | AI Snake Oil (Narayanan & Kapoor) | analysts-en | rss | 9 | Princeton CS. Критический взгляд на AI-хайп, fact-checking |
| 18 | Understanding AI (Timothy Lee) | analysts-en | rss | 7 | Бывший Ars Technica. Технические объяснения для широкой аудитории |
| 19 | SemiAnalysis (Dylan Patel) | analysts-en | rss | 10 | Лучший аналитик AI-инфраструктуры: чипы, датацентры, supply chain. **Обязательный** |
| 20 | Don't Worry About the Vase (Zvi Mowshowitz) | analysts-en | rss | 8 | Еженедельный AI-дайджест с оценками рисков. EA/rationalist угол |
| 21 | Simon Willison's Weblog | analysts-en | rss | 8 | Создатель Datasette. Тест новых моделей одним из первых |
| 22 | Benedict Evans | analysts-en | rss | 8 | Бывший a16z. Стратегический взгляд на AI как tech-тренд |
| 23 | The Gradient | analysts-en | rss | 7 | Академический AI-журнал от практиков |
| 24 | Stratechery (Ben Thompson) | analysts-en | rss | 9 | Топ-бизнес/стратегический взгляд на tech и AI. Aggregation Theory |
| 25 | Andrej Karpathy Blog | analysts-en | rss | 9 | Бывший директор AI Tesla, сооснователь OpenAI. Редкие, весомые посты |
| 26 | Lil'Log (Lilian Weng) | analysts-en | rss | 9 | Head of Safety OpenAI. Эталонные техобзоры (attention, agents, RLHF) |
| 27 | Marcus on AI (Gary Marcus) | analysts-en | rss | 8 | Критик LLM-хайпа. Когнитивная наука, contra-позиции |
| 28 | The Generalist (Mario Gabriele) | analysts-en | rss | 7 | Венчурный/бизнес-анализ AI-компаний. Глубокие профили стартапов |

### forecasters (ID 29–34)

| ID | Название | Категория | Тип | Score | Обоснование |
|---|---|---|---|---|---|
| 29 | Astral Codex Ten (Scott Alexander) | forecasters | rss | 8 | Rationalist-прогнозист. Prediction markets, AI futures. Культовый автор |
| 30 | Francois Chollet Substack | forecasters | rss | 8 | Создатель Keras. ARC-AGI benchmark. Измеримые прогнозы по AGI |
| 31 | Yoshua Bengio Blog | forecasters | html | 9 | Нобелевский лауреат. AI safety, регулирование, экзистенциальные риски |
| 32 | Epoch AI Research | forecasters | rss | 9 | Empirical AI: compute trends, scaling laws, AI timelines. **Лучший источник количественных прогнозов** |
| 33 | Dwarkesh Podcast | forecasters | rss | 8 | Длинные интервью с топ-исследователями. Инсайты, которых нет нигде |
| 34 | CSET Georgetown | forecasters | rss | 8 | AI policy, geopolitics, chip controls. Center for Security and Emerging Technology |

### analysts-zh / analysts-ja (ID 35–37)

| ID | Название | Категория | Тип | Lang | Score | Обоснование |
|---|---|---|---|---|---|---|
| 35 | Synced Review (机器之心 EN) | analysts-zh | rss | en | 7 | EN-мост к китайской AI-сцене: ByteDance, Baidu, Alibaba |
| 36 | Qbitai (量子位) | analysts-zh | html | zh | 8 | Ведущее ZH-медиа. Эксклюзивы из китайских лабораторий |
| 37 | Preferred Networks Tech Blog | analysts-ja | rss | en | 7 | Ведущая японская AI-компания (Chainer). EN-блог |

---

## Ещё не исследованы (следующий source-scout)

На третьем прогоне нужно добавить:

- **asia-ai deeper**: ByteDance Research отдельно, Zhipu AI (智谱AI), Samsung AI Research
- **chip-vendors**: AMD AI Blog, Intel AI Blog, Qualcomm AI
- **industry**: Salesforce AI Research, IBM Research AI, Databricks Blog, Hugging Face Blog
- **ru-market**: Яндекс Research (если появится отдельный RSS), AI Journal Russia, Skoltech AI
- **safety-orgs**: ARC Evals, Apollo Research, Redwood Research

Цель: 70-90 активных источников (после апрува round 1+2 будет ~34, нужно ещё ~40).
