# HarvestMap

A seasonal directory of small farms, orchards and growers — sorted by what they’re harvesting *right now*. This repository is a working [Astro](https://astro.build) site that implements the **HarvestMap design system**: a warm, hand-drawn aesthetic with tasteful, capped whimsy.

> Built to demonstrate the design spec on a real website — home directory, farm detail, and a living style guide.

---

## Quick start

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # static build to ./dist
npm run preview  # preview the production build
```

Requires Node 18+ (developed on Node 24).

---

## Project structure

```
harvestmap/
├── public/
│   ├── favicon.svg
│   └── fonts/                 # (optional) self-hosted Sentient — see Fonts below
├── src/
│   ├── styles/
│   │   └── global.css         # ← the entire design system: tokens, components, motion
│   ├── layouts/
│   │   └── BaseLayout.astro    # <head>, font loading, no-flash theme, nav + footer
│   ├── components/
│   │   ├── Nav.astro  Footer.astro  Button.astro  SeasonBadge.astro
│   │   ├── FarmCard.astro  SearchBar.astro  SeasonalBanner.astro  EmptyState.astro
│   │   └── illustrations/      # 10 inline-SVG illustrations (6 static + 4 animated)
│   ├── data/
│   │   └── farms.json          # sample farm content
│   └── pages/
│       ├── index.astro         # directory home (hero, search + filters, season guide, CTA)
│       ├── style-guide.astro   # the living design-system documentation
│       └── farms/[slug].astro  # farm detail (getStaticPaths over farms.json)
└── astro.config.mjs
```

`src/styles/global.css` is the single source of truth. Every token, component class and animation lives there and is documented inline by section (1–19).

---

## Design system at a glance

**Palette (7 hues + 2 neutrals)** — cream `#FBF3E7`, clay `#C2602C`, peach `#F2A65A`, honey `#E6B450`, orchard `#34503A`, moss `#8A9A5B`, berry `#8C3A52`; ink `#2E2419`, bark `#6B5847`. Each has tint variants and dark-mode aliases. Seasons map to colour: spring→moss, summer→honey, autumn→clay, winter→berry, year-round→orchard.

**Type** — `Sentient` (display), `Figtree` (body/UI), `Gambarino` (whimsy only — accents & empty states, never body).

**Spacing** — 8px base scale (`--space-1` … `--space-10`). **Radius** — 5 tokens (sm/md/lg/xl/pill). **Shadows** — 5 warm, low-contrast tokens.

**Scattered Seed** — farm cards take a small, capped rotation (≤ 2°) via `:nth-child`, a season badge pins over the top edge, and hover straightens + lifts the card. Rotation is disabled below 768px and under reduced-motion.

**Animated line drawings** — `Mushrooms`, `Foragers`, `Birds` and `SwayingTrees` self-draw on load (via `pathLength="1"` + `stroke-dashoffset`) and keep a gentle idle loop (sway, flap/glide, bob). All motion is gated behind `@media (prefers-reduced-motion: no-preference)`.

---

## Fonts

For zero-config development the three families load from CDNs in `BaseLayout.astro`:

- **Figtree** — Google Fonts
- **Sentient** & **Gambarino** — [Fontshare](https://www.fontshare.com)

### Self-hosting Sentient (recommended for production)

1. Download the family from Fontshare and drop the `.woff2` files in `public/fonts/sentient/`.
2. Replace the Fontshare `<link>` in `BaseLayout.astro` with `@font-face` rules, e.g.:

   ```css
   @font-face {
     font-family: "Sentient";
     src: url("/fonts/sentient/Sentient-Medium.woff2") format("woff2");
     font-weight: 500; font-style: normal; font-display: swap;
   }
   ```
3. Repeat for the weights you use (400/500/700) and for Gambarino.

---

## Accessibility

- Body text meets WCAG AA on both cream and dark surfaces.
- Visible 3px focus rings (`:focus-visible`) on every interactive element; a skip link is the first focusable item.
- All motion, rotation and self-draw effects are removed under `prefers-reduced-motion: reduce`; line art renders fully drawn.
- Illustrations are `aria-hidden` unless passed a `label` prop.

---

## Notes

- Sample produce photography is loaded from Unsplash by URL for the demo. Swap the `image` fields in `src/data/farms.json` for your own assets (and consider moving them into `public/images/`).
- The site ships **zero client-side framework JS** — only small vanilla helpers for the theme toggle, mobile nav and directory filtering.

---

## Dev handoff checklist

- [ ] `npm install && npm run build` completes with no errors
- [ ] All three font families load (no FOUT to system fallback in production)
- [ ] Colour tokens verified in both light and dark themes
- [ ] Season → colour mapping correct on every badge
- [ ] Scattered Seed rotation visible on desktop, **off** below 768px
- [ ] Card hover straightens + lifts; pinned badge does not clip
- [ ] Self-draw illustrations animate once on load
- [ ] Trees sway / birds flap / mushrooms bob loop smoothly
- [ ] `prefers-reduced-motion: reduce` disables all motion (test in devtools)
- [ ] Keyboard focus order is logical; focus rings visible
- [ ] Skip link works and is the first tab stop
- [ ] Directory search + season filters filter cards; empty state appears at 0 results
- [ ] Images have meaningful `alt`; decorative SVGs are `aria-hidden`
- [ ] Layout holds at 360px, 768px, 1024px and 1440px widths
