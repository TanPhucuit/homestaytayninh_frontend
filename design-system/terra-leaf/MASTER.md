# Terra & Leaf v2 – Design System (MASTER)

Source of truth for every screen. Built with the `ui-ux-pro-max` skill (`.claude/skills/ui-ux-pro-max` in the TTDN workspace).

## Direction: "Cinematic nature luxury"

| Item | Decision | Skill source |
|---|---|---|
| Page pattern | Search-first hero (Marketplace / Directory), categories, featured listings, trust, CTA | `--domain landing "hotel booking hero search"` |
| Storytelling | Full-bleed photo hero with slow Ken Burns zoom, dark forest chapters, scroll reveal | `--domain style "immersive parallax storytelling"` |
| Layout accents | Bento grid for destinations, asymmetric image collage | `--domain style "bento grid"` |
| Typography | Editorial serif display (Playfair Display, italic accents) + Be Vietnam Pro body; both have Vietnamese subsets | `--domain typography "elegant serif warm hospitality"`, `--domain style "editorial luxury magazine"` |
| Material | Glass only on navigation chips, hero stats and the search bar wrapper | `--domain style "liquid glass"`: "apply sparingly to navigation and controls" |
| Dials | variance 8, motion 7, density 3 (bold, animated, spacious) | `--design-system --variance 8 --motion 7 --density 3` |
| Rejected | Brutalism and navy/blue palette suggested at high variance: wrong mood for a nature homestay brand | — |

## Tokens (`src/app/globals.css` → `@theme`)

| Token | Value | Use |
|---|---|---|
| `forest` / `forest-soft` | #10261d / #1c3a2e | Dark chapters, footer, portal headers, summary headers |
| `brand` / `brand-strong` | #b0482b / #8a3520 | Primary CTA, prices, italic accents |
| `gold` / `gold-soft` | #c9a35a / #f4ead6 | Stars, focus ring, eyebrow on dark, highlights |
| `leaf` / `leaf-strong` / `leaf-soft` | #2f5d47 / #173a2d / #e6efe9 | Secondary accents, success, chips |
| `ink` → `subtle` | #161512 → #766c62 | Text hierarchy (all ≥ 4.5:1 on cream/sand) |
| `cream` / `sand` / `sand-deep` | #fbf8f3 / #f7f2ea / #ede5d8 | Backgrounds |
| `line` / `line-soft` | #d9cdbd / #e9e1d4 | Borders |
| Radius | 14px controls, 24–32px cards and media, pill buttons | |
| Shadows | `shadow-card`, `shadow-lift`, `shadow-cta`, `shadow-glass` | Rest / hover / CTA / glass |

Rule: components use token classes only; no raw hex, no arbitrary `rgba` shadows.

## Motion

| Effect | Where | Implementation |
|---|---|---|
| Scroll reveal (fade + rise, staggered via `--reveal-delay`) | Section headings, cards, grids | `.reveal` + `RevealObserver` (IntersectionObserver). Hidden only when `html.js` is set, so content never disappears without JS |
| Ken Burns zoom | Hero and login images | `.ken-burns` (24s) |
| Marquee | Destination ticker under hero | `.marquee`, pauses on hover |
| Hover zoom / lift / arrow rotate | Cards, bento tiles, stat tiles | `.hover-zoom`, `group-hover:` utilities |
| Button light sweep | `.btn-primary` | `::after` gradient |
| Header transparent → solid | Home page | `HeaderFrame` (client) toggles `data-solid` on scroll |
| Floating badges, pulse ring | Intro stat, map pin, payment status | `float-soft`, `animate-ping` |

All motion is disabled under `prefers-reduced-motion`.

## Components

`AppTopBar` (overlay mode for hero pages), `SiteFooter` (forest), `PageBanner` (cream with soft colour blobs), `PageShell`, `PortalHero` (forest), `StatTile`, `HomestayCard` (image-led 5:6 card, glass type chip, price and CTA over image), `Stepper`, `BookingCard`; CSS classes `btn-primary|secondary|ghost|light`, `card`, `field`, `check-row`, `badge*`, `glass`, `eyebrow(-light)`, `display`, `container-page`, `section`.

## Accessibility checklist

- [x] Skip link to `#main`; gold `:focus-visible` ring everywhere
- [x] Touch targets ≥ 44px; pill buttons min 46px
- [x] Text contrast ≥ 4.5:1; white text on images sits on ≥ 60% forest gradient
- [x] Decorative images and icons `aria-hidden`; content images have `alt`
- [x] Reduced motion respected; reveal never hides content without JS
- [x] Demo login (public password) only rendered outside production
