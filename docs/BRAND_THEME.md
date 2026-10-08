# Belancer Game brand palette

Source: the user-provided Belancer Web UI & UX Kit 2026 PDF. Exact flat colors were sampled from the original embedded mockup images, rather than compressed screenshots. The PDF's marketplace content is reference material; this update applies its palette to the existing game product.

`src/theme.css` is the single color-token source. `src/styles.css` and game artwork consume semantic variables; browser theme metadata uses the deep teal color.

| Token | Color | Use |
| --- | --- | --- |
| Ink | `#101615` | Text and lime-button labels |
| Deep teal | `#0B3D3A` | Hero, logo tile, active tabs, selected game cells |
| Teal | `#1F7A70` | Links, focus rings, symbols |
| Lime | `#D2F53C` | Primary actions and hero accents |
| Mint | `#9ED8CF` | Hero copy, artwork and matched pairs |
| Warm canvas | `#F6F3EE` | App background |
| Surface | `#FFFFFF` | Cards, panels and fields |
| Soft teal | `#EEF8F6` | Highlighted rows, success states, banners |
| Neutral | `#EFEBE4` | Unselected game cells |
| Hairline | `#E3DED6` | Borders and separators |
| Muted text | `#5E5A53` | Body copy and metadata |
| Clay | `#C2532D` | Speed-game artwork |
| Danger | `#B42318` / `#FEEDEB` | Destructive actions and errors |
| Warning | `#8A5C00` / `#FFF4D6` | Reserved warning tokens |

Coverage includes homepage/catalog, all five games, authentication, settings, challenges, progress, leaderboard, policy pages and all admin sections. Game artwork has paired background/foreground tokens. Primary actions use lime with an ink border; secondary actions use white with deep teal text. Selected and matched cells retain different states. Focus rings include textareas and summaries. Existing accessible game labels and pressed states are preserved.

Validation: TypeScript/Vite build and six existing game tests passed. Browser visual checks covered desktop/mobile homepage, practice Memory Grid selection, progress/login navigation and admin Games. Narrow homepage had equal content and viewport width (no horizontal overflow). Main color-pair contrast ratios: primary 14.70, body 16.53, muted 6.19, teal links 5.15, clay artwork 4.60, hero copy 7.56 and error text 5.80. This is color-pair verification, not a complete accessibility audit of every state.

No dependency, API or database migration change is required. Pull frontend main and restart Vite.
