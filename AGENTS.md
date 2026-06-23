<!-- BEGIN:nextjs-agent-rules -->

# Zara Mobile Catalog — project conventions

Contract for reviewers, contributors and coding agents working on the **Napptilus Tech Labs**
**Zara Web Challenge** deliverable.

| Resource             | Location                                                  |
| -------------------- | --------------------------------------------------------- |
| Live app             | https://zara-mobile-challenge.vercel.app/                 |
| Delivery summary     | https://zara-mobile-challenge.vercel.app/entrega          |
| Setup & architecture | [README.md](./README.md) · [README.es.md](./README.es.md) |
| Visual contract      | [DESIGN.md](./DESIGN.md)                                  |

This file explains the non-negotiable rules behind the codebase: stack, architecture, API,
testing, accessibility and styling. Read it together with the README when reviewing or extending
the project.

---

# Next.js note (maintainers)

This project uses a modern version of Next.js (App Router) with potential breaking
changes in APIs, conventions and file structure.

Before writing or changing Next.js-specific code, read the relevant guide inside:

```txt
node_modules/next/dist/docs/
```

Do not assume old Pages Router patterns unless explicitly required. Heed deprecation notices.

---

# Agent Rules

## 1. Project context

This project is a technical challenge for **Napptilus Tech Labs** — the **Zara Web Challenge**:
a mobile phone catalog application based on the Zara Challenge specification.

The application must support:

- A phone listing experience (first 20 products, grid layout, real-time search, results counter).
- A phone detail experience (large image, color/storage selectors, price update, technical specs, "Add to cart" validation).
- A shopping cart experience (persistent via `localStorage`, individual removal, total price).
- Real-time search using the API.
- Responsive, accessible and SEO-friendly UI.
- Image optimization, testing, development/production modes and a clear README.

The project uses:

- Next.js with App Router.
- React.
- **TypeScript** (strict mode).
- Sass with BEM methodology and CSS Modules.
- Context API for shared application state.
- Axios for API requests, through an isolated API layer.
- `next/image` for optimized product images.
- Jest and React Testing Library for testing.

This project uses TypeScript. Use:

```txt
.ts
.tsx
.scss
.module.scss
```

Do not introduce `.js`/`.jsx` source files (config files such as `jest.config.js`
are the only exception).

---

## 2. Architecture principles

Keep the project scalable and easy to evolve. Prioritize clear separation of
responsibilities, small focused components, reusable UI pieces, isolated API logic,
predictable state, maintainable styling, accessible markup, SEO-friendly pages and
testable behavior.

Avoid: large multi-responsibility components, duplicated logic, hardcoded credentials,
unnecessary dependencies, deeply nested JSX, non-semantic markup, client components when
server components are enough, and overly rigid structure.

Keep related files close when it improves maintainability. Prefer names that explain intent.

Layout:

```txt
src/
├── app/                 Routes, layout, route handlers
├── features/            catalog, product-detail, cart
├── shared/              UI, services, hooks, types, lib
├── scss/                tokens, reset, globals
└── test-utils/          MSW handlers, fixtures
```

Delivery summary for reviewers lives at `public/entrega/` (served at `/entrega` in production).
Visual tokens and UI rules live in `DESIGN.md` at the repo root.

---

## 3. Next.js rules

Use the App Router. Use server components by default. Only add `'use client'` when the
component needs browser-side behavior (state, effects, event handlers, context consumers,
`localStorage`, browser APIs). Use route handlers when the client must trigger requests that
require private credentials. Never expose private environment variables to the browser.

---

## 4. TypeScript rules

Write clear, strict, well-typed TypeScript.

- `strict` mode is on. Do not disable it or weaken it per-file.
- **Never use `any`.** Prefer precise types, `unknown` with narrowing, or generics.
- Model the API responses as domain types in `src/shared/types` and reuse them everywhere
  (services, context, components, fixtures).
- Type component props with an explicit `interface`/`type`. Reuse domain types for props
  when a component renders a domain entity (e.g. `ProductCardProps = Phone`).
- Use discriminated unions for reducer actions so each branch is exhaustively checked.
- Prefer `import type { ... }` for type-only imports.
- Avoid unnecessary abstractions and overly clever types. Validate assumptions when dealing
  with external API data.

---

## 5. Styling rules

Use Sass with BEM naming and CSS Modules for component styles. Global styles are limited to
reset/base, CSS variables (design tokens), typography defaults and global layout primitives.

The required font family is:

```scss
font-family: Helvetica, Arial, sans-serif;
```

Use mobile-first responsive styles and CSS variables for colors, spacing, typography,
borders and transitions. Avoid Tailwind, Styled Components, inline styles in final UI, and
element-name-only selectors.

Access BEM classes from CSS Modules safely:

```tsx
className={styles['product-card__image-wrapper']}
```

---

## 6. API rules

Use Axios through a reusable API layer (`src/shared/services`), never call external endpoints
directly from UI components.

The external API requires the `x-api-key` header. **The key must never reach the browser.**
Do not use `NEXT_PUBLIC_API_KEY`. Use server-side `API_BASE_URL` and `API_KEY`.

- **Base URL:** `https://prueba-tecnica-api-tienda-moviles.onrender.com/`
- **Header:** `x-api-key: <API_KEY>`
- **Endpoints:**
  - `GET /products` → array of phones (`id`, `brand`, `name`, `basePrice`, `imageUrl`). Accepts `?search=...`.
  - `GET /products/:id` → detailed spec (color options, storage options, specifications, similar products).

Requests that need credentials run on the server or through a route handler. Handle errors
gracefully; the UI must provide loading, error and empty states.

---

## 7. Data fetching rules

Do not add TanStack Query unless caching/invalidation/retries justify it. Prefer server
components for initial data, route handlers for protected client-triggered requests, and
`useState`/`useEffect` for simple client interactions. Debounce real-time search (~300ms).
Search filters via the API, not only locally.

Shareable UI state belongs in the URL: catalog search in `?search=`, product color in
`?color=` and storage in `?storage=` on the detail route.

---

## 8. Image and performance rules

Use `next/image` for product images with meaningful `alt` text and responsive sizing.
Use `priority` only for above-the-fold images. Configure remote domains via
`images.remotePatterns`. Product images may be proxied and optimized server-side through
`/api/images` (Sharp pipeline); never expose `API_KEY` to the browser for raw assets.
Avoid unnecessary client JS and repeated fetching.

---

## 9. Cart rules

Use Context API for shared cart state. Persist with `localStorage`. Do not read
`localStorage` during server rendering — hydrate browser-only state safely after mount.
Cart items are uniquely identified by the selected configuration (product + color + storage),
not only by product id. The cart allows viewing items, viewing selected options, removing
individual items, seeing the total and continuing shopping. Keep cart logic separate from UI.

---

## 10. Product detail rules

Must include: name, brand, large image, color and storage selectors, dynamic image on color
change, dynamic price on storage change, technical specs, add-to-cart action and a similar
products section. The add-to-cart action stays `disabled` until color and storage are both
selected. Selected state must be conveyed beyond color alone.

---

## 11. SEO rules

Use Next.js metadata. Each page has one clear `h1`, meaningful title/description, semantic
HTML and correct heading hierarchy. Build dynamic metadata for detail pages, e.g.
`iPhone 15 Pro - Apple | Mobile Catalog`. Use `<main>`, `<section>`, `<article>`, `<header>`,
`<nav>`, `<footer>` over generic `div`s.

---

## 12. Accessibility rules

Accessibility is a core requirement. Use semantic HTML and one `h1` per page; labels for
controls and real buttons for actions; links only for navigation (no clickable `div`s);
`aria-label` on icon-only controls; meaningful `alt`; the real `disabled` attribute; visible
focus and working keyboard navigation; sufficient contrast; clear loading/error/empty states
not signalled by color alone. The browser console must stay free of errors and warnings.

---

## 13. Testing rules

Use Jest and React Testing Library. Tests focus on user-facing behavior and follow the
**Given-When-Then / And** BDD structure in every `describe`/`it`.

- Do not mock business logic or services. Intercept HTTP with **MSW** in
  `src/test-utils/msw/` using fixtures from `src/test-utils/fixtures/products.fixtures.ts`.
- Simulate `localStorage` for cart persistence, additions and removals.
- Type mocks with `jest.mocked(...)` instead of casting to `any`.
- Add Playwright specs in `e2e/` for listing, detail and cart flows.

Before delivery these must pass:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e -- --project=chromium
```

---

## 14. Development, production and deployment

Development: `npm run dev`. Production: `npm run build && npm run start` (optimized, bundled,
minified assets). The app must be free of console errors/warnings in both modes.

Environment variables (server-side only, never `NEXT_PUBLIC_`):

```env
API_BASE_URL=
API_KEY=
```

---

## 15. Documentation deliverables

The README explains how to run the project and the main technical decisions. Together with
this file and `DESIGN.md`, they form the documentation package for the technical challenge:

- **README** — setup, architecture, quality pipeline, deployment.
- **AGENTS.md** (this file) — coding conventions, API rules, testing and accessibility contract.
- **DESIGN.md** — visual contract generated from the challenge Figma via MCP Figma: tokens, typography, layout and copy.
- **`/entrega`** — reviewer-facing summary with embedded demo and screenshots.

State clearly that Next.js was chosen for image optimization and SEO, that TypeScript is used
in strict mode, that Sass+BEM keeps styles maintainable, that Context API holds shared cart state,
that `localStorage` persists the cart, that Axios runs through an isolated layer, and that
accessibility and SEO are core requirements.

---

## 16. Coding style & documentation

- Let types document the data; do not duplicate type information in JSDoc. Add short JSDoc
  only to explain the **why** of non-trivial logic or public helpers.
- Do not write comments that restate what the code does.
- Prioritize descriptive names for functions and variables.
- Keep the logic flow clean and modular; avoid noise.

<!-- END:nextjs-agent-rules -->
