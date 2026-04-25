---
name: scqr-ru-design
description: Use this skill to generate well-branded interfaces and assets for SCQR.RU — a Russian-language analytical AI news publication — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, mascot assets, and a website UI kit for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files (`colors_and_type.css`, `assets/`, `preview/`, `ui_kits/website/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

Critical SCQR.RU rules:
- Light theme only; paper-white surfaces with thin `#E6E8EC` borders. No glassmorphism, no gradients on full backgrounds.
- Brand accents: violet `#6C4DFF` (primary) and blue `#3AA0FF` (secondary). Soft tints `#F1EDFF` / `#EBF5FF` for banners.
- Typography: Manrope 700 for display/headings (tight tracking), Inter 400/500 for body, JetBrains Mono 500 for timestamps only.
- All UI strings in Russian. No emoji in body or headlines. Sentence-case headlines, UPPERCASE rubric pills.
- The white-and-graphite robot mascot in `assets/mascot/` is the **single** illustrative element. No abstract blobs, no AI-slop visuals.
- Tone: dispassionate analytical newsroom (RBC/CNews-flavour), not SaaS landing.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
