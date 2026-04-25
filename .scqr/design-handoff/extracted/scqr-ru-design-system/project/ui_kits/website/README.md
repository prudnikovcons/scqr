# SCQR.RU — Website UI Kit

A high-fidelity recreation of the SCQR.RU homepage. Built from the supplied homepage mockup PNG; no codebase or Figma was provided, so component implementations are cosmetic-only (props, no real data layer).

## Files

- `index.html` — full homepage in one view. Loads React + Babel and assembles every component below into the production-style layout.
- `TopNav.jsx` — sticky top navigation with logo, search, subscribe CTA, mascot avatar, and the section link row.
- `HeroFeature.jsx` — the "ГЛАВНОЕ" feature: tag pill + headline + lede + meta + mascot illustration on a soft gradient.
- `HeroSubgrid.jsx` — four secondary article cards underneath the hero (Google / dev / Midjourney / Microsoft Copilot).
- `MiniFeed.jsx` — sidebar "Лента новостей" with timestamped items, rubric eyebrows, and 56-square brand thumbnails.
- `NewsletterBanner.jsx` — the violet-50 strip with mascot, three feature points, and CTA.
- `PopularSection.jsx` — "Популярное" left card + three-row video list.
- `EventsCard.jsx` — sidebar events list with date blocks and tag pills.
- `RubricsGrid.jsx` — 3×2 grid of rubric tiles using Lucide icons in violet chips.
- `PodcastCard.jsx` — gradient podcast card for SCQR Talk.
- `Footer.jsx` — link columns, social icons, and the waving-mascot send-off.

## How to read this kit

Open `index.html`. The layout, copy, and every detail (timestamps, view counts, event dates, rubric subtitles) come from the original homepage mockup — adjust by editing the JSX literals at the top of each component file. All components consume the tokens in `../../colors_and_type.css`; no inline colour values.
