---
version: 1
name: Zara Mobile Catalog
description: Design contract for the Napptilus Tech Labs Zara Web Challenge. Tokens, typography, layout and UI rules for humans and coding agents.
source:
  figma: https://www.figma.com/design/Nuic7ePgOfUQ0hcBrUUQrb/Labs---Zara-Web-Challenge--Smartphones-
  extraction: MCP Figma (medidas y frames del archivo del reto)
  tokens: src/scss/_variables.scss
  deliveryScreenshots: public/entrega/screenshots/
---

# Zara Mobile Catalog — DESIGN.md

Contrato visual del Napptilus Tech Labs Zara Web Challenge. **Generado a partir del Figma del reto
usando MCP Figma** (extracción de frames, medidas, gaps y tipografía) y consolidado como referencia
del repositorio.

Read this before changing UI. The app should follow the Figma challenge — a minimal
product catalog, not a generic ecommerce template.

## Agent preflight

Before writing or reviewing UI, read:

- This file (layout numbers from the challenge Figma via MCP Figma extraction).
- `AGENTS.md`.
- `src/scss/_variables.scss` and `src/scss/_mixins.scss`.
- Delivery captures in `public/entrega/screenshots/` when checking visual fidelity.

## Non-negotiables

- Font stack: `var(--font-family-base)`.
- Palette: `--color-text-primary`, `--color-bg-primary`, greys from the color tokens and product
  imagery. No marketing accents, gradients or drop shadows on product surfaces.
- Square/rectangular surfaces. Product grid uses `--color-text-primary` borders, not rounded cards.
- BEM + CSS Modules. Access classes as `styles['block__element']`.
- Use only tokens from `_variables.scss` via `var(--…)`. Do not add parallel names (`--ink`,
  `--surface`, `--mbst-*`, etc.).
- Motion: prefer `transform` and `opacity`; respect `prefers-reduced-motion`.
- Runtime data comes from the challenge API. Do not hardcode product lists in UI.

## Tokens

Canonical source: `:root` in `src/scss/_variables.scss`. Reference tokens only through
`var(--token-name)`.

### Colors

| Token                      | Value     | Use                                          |
| -------------------------- | --------- | -------------------------------------------- |
| `--color-text-primary`     | `#000000` | Body copy, strong borders, primary actions   |
| `--color-text-secondary`   | `#79736d` | Brand, metadata, empty states                |
| `--color-text-placeholder` | `#aaaaaa` | Search placeholder                           |
| `--color-bg-primary`       | `#ffffff` | Page and component surfaces                  |
| `--color-border`           | `#cccccc` | Neutral rules, swatch outlines, scroll track |
| `--color-bg-disabled`      | `#f3f2f2` | Disabled buttons, image fallback             |
| `--color-text-disabled`    | `#c2bfbc` | Disabled button label                        |
| `--color-error`            | `#df0000` | Errors, remove actions                       |

### Typography

| Token                | Value                          | Use                                   |
| -------------------- | ------------------------------ | ------------------------------------- |
| `--font-family-base` | `Helvetica, Arial, sans-serif` | Global stack                          |
| `--font-size-xs`     | `0.625rem`                     | Card brand (mobile)                   |
| `--font-size-sm`     | `0.75rem`                      | Labels, metadata, buttons, cart lines |
| `--font-size-base`   | `0.875rem`                     | Body default, selector copy (desktop) |
| `--font-size-md`     | `1rem`                         | Search input, error/empty copy        |
| `--font-size-lg`     | `1.25rem`                      | Section headings, cart title (mobile) |
| `--font-size-xl`     | `1.5rem`                       | Hero title, cart title (desktop)      |

### Font weights

| Token                    | Value | Use                        |
| ------------------------ | ----- | -------------------------- |
| `--font-weight-thin`     | `300` | Default UI copy (dominant) |
| `--font-weight-regular`  | `400` | Rare emphasis              |
| `--font-weight-medium`   | `500` | Cart totals                |
| `--font-weight-semibold` | `600` | Reserved                   |
| `--font-weight-bold`     | `700` | Reserved                   |

### Z-index

| Token            | Value | Use                                   |
| ---------------- | ----- | ------------------------------------- |
| `--z-negative-2` | `-2`  | Stacking below base                   |
| `--z-negative-1` | `-1`  | Stacking below base                   |
| `--z-base`       | `0`   | Default; selected storage border lift |
| `--z-card`       | `1`   | Product cards, images, similar grid   |
| `--z-sticky`     | `10`  | Header                                |
| `--z-dropdown`   | `20`  | Reserved                              |
| `--z-modal`      | `30`  | Reserved                              |
| `--z-toast`      | `40`  | Reserved                              |

### Layout

| Token / mixin                    | Value               | Use                          |
| -------------------------------- | ------------------- | ---------------------------- |
| `--max-width`                    | `1200px`            | Detail and cart content rail |
| `@include breakpoint('mobile')`  | `min-width: 393px`  | Mobile-first step            |
| `@include breakpoint('tablet')`  | `min-width: 768px`  | Tablet step                  |
| `@include breakpoint('desktop')` | `min-width: 1024px` | Desktop step                 |

Typical pairings in components:

- Headings: `--font-size-lg` / `--font-size-xl` + `--font-weight-thin`.
- Metadata: `--font-size-sm` + `--font-weight-thin` + `--color-text-secondary`.
- Primary borders: `0.5px solid var(--color-text-primary)`.
- Neutral borders: `1px solid var(--color-border)`.
- Disabled CTA: `--color-bg-disabled` + `--color-text-disabled`.

## Layout (structure)

- Mobile-first breakpoints via `@include breakpoint('mobile' | 'tablet' | 'desktop')` in
  `src/scss/_mixins.scss`.
- Catalog grid: bordered cells, negative margins to collapse shared seams
  (`ProductCard.module.scss`).
- Detail: hero + configurator + specs + similar products within `var(--max-width)`.
- Header: logo left, cart link right — no nav menu or promo bar. Sticky with `var(--z-sticky)`.

## Copy (canonical)

| Control            | Copy                                              |
| ------------------ | ------------------------------------------------- |
| Search placeholder | `Search for a smartphone...`                      |
| Result count       | `{n} result` / `{n} results`                      |
| Add to cart        | Disabled until color **and** storage are selected |
| Cart heading       | `Cart ({count})`                                  |
| Continue shopping  | `Continue shopping`                               |

## Components (code map)

| Surface              | Location                                                |
| -------------------- | ------------------------------------------------------- |
| Header               | `src/shared/components/Header/`                         |
| Search               | `src/features/catalog/components/SearchBar/`            |
| Product grid         | `src/features/catalog/components/ProductList/`          |
| Product card         | `src/features/catalog/components/ProductCard/`          |
| Detail hero + config | `src/features/product-detail/components/ProductDetail/` |
| Color / storage      | `ColorSelector/`, `StorageSelector/`                    |
| Specs                | `SpecsTable/`                                           |
| Similar products     | `SimilarProducts/`                                      |
| Cart                 | `src/features/cart/components/CartView/`                |

## URL-driven UI state

| Param       | Route            | Effect                                                               |
| ----------- | ---------------- | -------------------------------------------------------------------- |
| `?search=`  | `/`              | Catalog filter (API-backed, debounced); Next router navigation       |
| `?color=`   | `/products/[id]` | Selected color → hero image; `history.replaceState` (no RSC refetch) |
| `?storage=` | `/products/[id]` | Selected capacity → price; `history.replaceState` (no RSC refetch)   |

Cart state lives in `localStorage`, not query params.

## Images

- Product images use `next/image` through `buildProxyUrl` → `/api/images` (Sharp).
- Hero/catalog images: transparent-friendly treatment; no aggressive upscale.
- Meaningful `alt` on every product image.

## Motion

- Catalog: FLIP reorder when search results change (`useFlipAnimation`, `shared/lib/flip.ts`).
- Catalog ↔ detail: View Transition API where supported (`next.config.ts` experimental flag).
- Color change: opacity swap across preloaded layers (`ProductDetailHero`).
- Keep durations short; do not block interaction.

## Figma reference frames

From the challenge file (Labs — Zara Web Challenge — Smartphones):

- Desktop frame: ~1920×1080, ~100 px gutters, ~80 px header.
- Mobile frame: ~393×852, ~16 px gutters.
- Detail rail: ~1200 px centered content on desktop.

When in doubt, compare against the Figma link above and the screenshots in
`public/entrega/screenshots/`.
