# Terra & Leaf – Design System (MASTER)

Source of truth for every screen. Built with the `ui-ux-pro-max` skill (`.claude/skills/ui-ux-pro-max` in the TTDN workspace) on top of the BA palette.

## Direction

| Item | Decision | Source |
|---|---|---|
| Product type | Hotel / Hospitality, booking funnel | `--domain product "boutique hotel eco resort"` |
| Style | Nature Distilled: muted earth, terracotta, sand, soft shadows, warm photography | `--domain style "organic natural editorial"` |
| Landing pattern | Hero-centric + social proof, 3-step booking funnel | product + `--design-system` |
| Palette | BA Terra & Leaf (kept; the generic travel blue from `--design-system` does not fit the brand) | BA document §6 |
| Typography | Playfair Display (headings, has Vietnamese subset) + Be Vietnam Pro (body) | `--domain typography "elegant serif warm hospitality"`; Libre Caslon Text was dropped because it has no Vietnamese subset, so diacritics fell back to Georgia |
| Icons | lucide-react SVG, never emoji or text glyphs (♡ ★ ✓) | skill rule §4 |

## Tokens (`src/app/globals.css` → `@theme`)

| Token | Value | Use |
|---|---|---|
| `brand` / `brand-strong` | #9a4029 / #7b2914 | Primary CTA, links, price |
| `brand-tint` / `brand-wash` | #ffdad2 / #fdf1ec | Selection, soft highlight |
| `leaf` / `leaf-strong` / `leaf-soft` | #466550 / #2f4d3a / #e8f0eb | Secondary actions, success, portal header |
| `ink` / `ink-soft` / `ink-muted` | #1c1c19 / #3f3530 / #56423d | Text hierarchy |
| `muted` / `subtle` | #6f6158 / #7a645d | Secondary text (≥ 4.5:1 on sand) |
| `sand` / `sand-deep` | #fdf9f4 / #f3ede6 | Page background, chips |
| `line` / `line-soft` | #dcc0ba / #e8e1d5 | Borders |
| `warn(-soft)`, `danger(-soft)` | #7a4a12 / #fff3d6, #93000a / #ffdad6 | Status |
| `shadow-card`, `shadow-lift`, `shadow-cta` | layered warm shadows | Resting / hover / CTA |
| Radius | 12px controls, 16px cards, 20px search panel | BA |

Rule: components use token classes (`text-brand`, `bg-sand`, `border-line-soft`). Raw hex and arbitrary `shadow-[…rgba…]` are not allowed.

## Components (`@layer components`)

`btn-primary`, `btn-secondary`, `btn-ghost` (min 44px, 180ms ease-out, active scale), `card`, `field` (visible label, hover/focus states, `aria-invalid`), `check-row` (checked state via `:has`), `badge` + `badge-green|sand|red`, `search-panel`, `skeleton-shimmer`, `animate-fade-up`.
Shared React pieces in `src/components/customer-ui.tsx`: `AppTopBar` (mobile menu for every visitor, role label in Vietnamese), `SiteFooter`, `PageShell`, `PortalHero` (Admin/Staff header), `Stepper`, `HomestayCard`, `BookingCard`.

## Accessibility & motion checklist

- [x] Skip link to `#main` on every page
- [x] Global `:focus-visible` ring (2px brand, offset 2px)
- [x] Touch targets ≥ 44px; `cursor: pointer` on interactive elements
- [x] Text contrast ≥ 4.5:1 (muted/subtle tokens darkened)
- [x] `prefers-reduced-motion` disables animation and smooth scroll
- [x] Decorative icons `aria-hidden`; images have `alt`; lazy-loaded card images
- [x] No horizontal scroll at 375px
