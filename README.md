# Zara Mobile Catalog

A web application to browse, search and manage a catalog of mobile phones, built for the
Zara Challenge. It covers a phone listing with real-time search, a phone detail view with
color/storage selectors, and a persistent shopping cart.

> Status: project scaffold + tooling + ported domain layer (API, cart, UI states). The
> detail and cart **pages** are the next features to build on top of this foundation.

## Stack

- **Next.js** (App Router) — chosen because image optimization and SEO matter for a product catalog.
- **React** with **TypeScript** (strict mode).
- **Sass** with **BEM** + **CSS Modules** for scoped, maintainable styles.
- **Context API** for shared cart state.
- **Axios** through an isolated API layer; the API key never reaches the browser.
- **Jest** + **React Testing Library** for testing (BDD Given-When-Then).
- **ESLint**, **Prettier**, **Stylelint**, **Husky** + **lint-staged** for code quality.
- **GitHub Actions** CI and **SonarCloud** static analysis.

## Requirements

- Node.js `>= 20`
- npm `>= 10`

## Installation

```bash
npm install
```

## Environment variables

Copy the example file and fill in the credentials from the challenge documentation:

```bash
cp .env.example .env.local
```

```env
# Server-side only — never expose to the browser (no NEXT_PUBLIC_ prefix).
API_BASE_URL=https://prueba-tecnica-api-tienda-moviles.onrender.com
API_KEY=your-api-key
```

## Development mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Assets are served unminified for fast
iteration.

## Production mode

```bash
npm run build
npm run start
```

The production build serves optimized, bundled and minified assets.

## Quality scripts

| Script                  | Description                         |
| ----------------------- | ----------------------------------- |
| `npm run lint`          | ESLint over the codebase            |
| `npm run lint:fix`      | ESLint with autofix                 |
| `npm run lint:styles`   | Stylelint over `src/**/*.scss`      |
| `npm run format`        | Prettier write                      |
| `npm run format:check`  | Prettier check (used in CI)         |
| `npm run typecheck`     | `tsc --noEmit` strict type checking |
| `npm run test`          | Jest test suite                     |
| `npm run test:coverage` | Jest with coverage report (lcov)    |

Before delivery, the following must pass:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

## Project architecture

```
src/
├── app/                # App Router: layout, page, error/loading/not-found
├── components/         # UI components (one folder per component + its .module.scss + test)
│   └── UI/             # Reusable primitives: Loader, EmptyState, ErrorState, icons
├── constants/          # Routes, endpoints, limits, storage keys
├── context/cart/       # CartContext + typed reducer (localStorage persistence)
├── lib/                # cartStorage: safe localStorage access
├── scss/               # Global styles: design tokens, reset, mixins
├── services/           # Axios client + phones service (isolated API layer)
├── types/              # Domain types (Phone, PhoneDetail, CartItem, ...)
├── utils/              # Small pure helpers (buildKey)
└── __mocks__/          # axios mock + fixtures for tests
```

### Key technical decisions

- **TypeScript (strict).** API responses are modelled as domain types in `src/types` and
  reused across services, context, components and fixtures. No `any`.
- **Isolated API layer.** `apiClient` configures `baseURL` and the `x-api-key` header in one
  place from server-side env vars; services call it instead of using `axios` directly.
- **Cart state.** Context API + a reducer with discriminated-union actions. Items are keyed
  by `id + color + storage`, so the same phone in different configs is a separate line.
- **Cart persistence.** `localStorage`, hydrated only after mount to stay SSR-safe; access is
  wrapped so private mode / quota errors degrade gracefully.
- **Styling.** Sass + BEM + CSS Modules; design tokens as CSS variables; mobile-first.
- **SEO.** Next.js metadata, semantic HTML, one `h1` per page, descriptive `alt` text.
- **Accessibility.** Real buttons/links, `aria-label`s, real `disabled`, visible focus,
  state never communicated by color alone; console free of errors/warnings.
- **Image optimization.** `next/image` with configured remote patterns.
- **TanStack Query was intentionally not added** — current data-fetching needs are simple.

## Testing

Tests use Jest + React Testing Library and follow a BDD **Given-When-Then / And** structure.
The network layer (`axios`) is mocked in `src/__mocks__/axios.ts` with fixtures from
`src/__mocks__/phones.fixtures.ts`; mocks are typed via `jest.mocked()`.

```bash
npm run test
npm run test:coverage
```

## Continuous integration

`.github/workflows/ci.yml` runs on every push and PR to `main`:

1. **Quality** — install, ESLint, Stylelint, Prettier check, typecheck, tests with coverage, build.
2. **SonarCloud** — static analysis using the coverage report.

### SonarCloud setup

1. Create a project at [sonarcloud.io](https://sonarcloud.io) and note your organization and project key.
2. Set them in [`sonar-project.properties`](./sonar-project.properties).
3. Add the `SONAR_TOKEN` (and `API_KEY` for the build step) as repository secrets in GitHub.

## Deployment

The app deploys to any Node host or to **Vercel**:

1. Import the repository in Vercel.
2. Set `API_BASE_URL` and `API_KEY` as environment variables.
3. Deploy — Vercel runs `npm run build` and serves the optimized output.
