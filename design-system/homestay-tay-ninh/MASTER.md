# Design System v4 "Hồ Xanh"

Generated with the ui-ux-pro-max skill (styles: Bento Box Grid + soft Glassmorphism; palette: emerald + ocean blue on airy mint).

## Palette (semantic tokens in `globals.css` `@theme`)
| Token | Hex | Use |
|---|---|---|
| brand / strong / tint / wash | #0A7D5C / #065C44 / #BDEEDD / #DEF7EE | CTA, links, prices, accents |
| leaf / strong / soft | #1767B0 / #0F4C88 / #DBEAFA | ocean-blue secondary accent, icons, eyebrows |
| bark / soft | #062C33 / #0C4048 | deep teal dark panels, footer |
| gold | #FFC94A | highlight on dark panels only |
| sand / cream | #EDF8F5 / #FBFFFE | page background / cards |
| line / line-soft | #B6D9D1 / #D6EBE6 | borders |

## Typography
Plus Jakarta Sans (headings, weight 800, tight tracking, Vietnamese subset) + Be Vietnam Pro (body).
Accent words in `.display` use an emerald→ocean gradient (`.italic` / `em` inside `.display`).

## Shapes and motion
Rounded frames (`.arch` 32px, `.arch-lg` 56px with a 160px lower-left corner), pill buttons, glass chips
(`backdrop-blur-xl`, white/25) on the hero image, soft mint/blue mesh background, scroll reveal, ken-burns hero.

## Anti-patterns
No raw hex in components, no emoji icons, no hover-only affordances, keep contrast >= 4.5:1, respect reduced motion.
