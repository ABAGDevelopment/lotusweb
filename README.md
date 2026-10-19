# Lotus UAE — website

Marketing site for Lotus UAE: a React single-page app whose content is managed in
[Sanity](https://www.sanity.io). English and Arabic (RTL), vehicle detail pages
with gallery and 360° view, and a test-drive booking form.

**Stack:** Vite 5 · React 18 · TypeScript · Tailwind CSS · React Router · Sanity client · Vercel

> The Sanity Studio (where editors change content) is **not** in this repo.

## Getting started

Requires Node 18+.

```sh
npm install
# create .env (see below)
npm run dev        # http://localhost:5173
```

### Environment variables

`.env` is git-ignored. Create it in the project root:

```sh
# Read by the browser (whitelisted in vite.config.ts)
SANITY_PROJECT_ID=rh6f9d38
SANITY_DATASET=production
SANITY_API_VERSION=2024-10-01
SANITY_USE_CDN=false              # true = cheaper reads, up to ~60s stale
ENQUIRY_ENDPOINT=/api/test-drive  # empty in dev = form logs to console, sends nothing

# Server only — used by api/test-drive.ts, never bundled
SANITY_WRITE_TOKEN=               # Sanity token with Editor permissions
```

Variables have no `VITE_` prefix. `vite.config.ts` passes exactly the names in
`CLIENT_ENV_VARS` to the browser. Never add `SANITY_WRITE_TOKEN` to that list, or
replace it with `envPrefix: ['SANITY_']` — that would publish the write token.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server, including `/api/*` functions |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built `dist/` at http://localhost:4173 |
| `npm run typecheck` | TypeScript only |
| `npm run smoke` | Render every route through the real providers; fails on any throw |
| `npm run navtest` | Check CMS links resolve correctly from every page and locale |
| `npm run apitest` | Check the test-drive API in both Node and Web invocation styles |
| `npm run verify` | All of the above, then build — run before pushing |

## How content gets on the page

```
Sanity ──── publish event ─────┐
  │ GROQ (queries.ts)          │
  ▼                            ▼
client.ts ──────────▶ useLiveQuery.ts   fetch, then refetch on every publish
                        ├─▶ ContentProvider ─▶ home page, nav, footer, <head>
                        └─▶ vehicle and test-drive pages (their own queries)

Components turn CMS fields into HTML with t() · <SanityImage> · <CmsLink>
```

- **`src/sanity/queries.ts`** — every GROQ query. `SITE_QUERY` fetches settings,
  navigation, the whole home page and the footer in one request.
- **`src/sanity/useLiveQuery.ts`** — fetches, then listens to Sanity. When a
  document is **published**, pages refetch within ~1s with no reload or deploy.
  Falls back to polling every 30s if the listener drops.
- **`src/sanity/ContentProvider.tsx`** — shares the site-wide payload via
  `useContent()` / `useSite()`.
- **`src/i18n/LocaleProvider.tsx`** — `t(field)` picks `en` or `ar` from a
  localised field, falling back to the other language when one is empty.
- **`src/components/common/SanityImage.tsx`** — responsive `srcset` and blur
  placeholder from the Sanity image CDN.
- **`src/components/common/CmsLink.tsx`** — renders any editor-entered link.
  Links to `/test-drive` open the booking modal instead of navigating.

Only **published** content is shown, locally and in production. Drafts saved in
the Studio never appear until someone clicks Publish — and then they appear on
the live site immediately.

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/vehicles/:slug` | Vehicle detail |
| `/test-drive` | Booking form |
| `/test-drive/thank-you` | Confirmation |

Every route also exists under `/ar` for Arabic. The language served at `/` comes
from **Site Settings → default locale** in Sanity.

## Test-drive form

`TestDriveForm` (3 steps: model → showroom & date → details) is used by both the
modal and the `/test-drive` page. It POSTs to `ENQUIRY_ENDPOINT`, and
`api/test-drive.ts` validates the data and creates a `testDriveEnquiry` document
in Sanity using `SANITY_WRITE_TOKEN`.

In development, `vite-dev-api.ts` serves the same function. **Submissions from
your local site are written to the real dataset** set in `.env`.

## Project structure

```
api/                 Serverless functions (Vercel) — test-drive.ts
public/              Fonts, favicons, logo
src/
  pages/             Route components
  components/
    Index/           Home page sections
    layout/          Navigation, Footer
    common/          CmsLink, SanityImage, SiteHead, Spin360, ZoomImage, …
    testdrive/       Booking modal and form
    ui/              shadcn/ui primitives
  sanity/            Client, queries, types, live-content hooks
  i18n/              Locale provider and fixed UI strings
  routes.tsx         Route table (built per default locale)
vite-dev-api.ts      Runs api/*.ts during `npm run dev`
smoke.tsx, navtest.tsx, apitest.ts   Test scripts
```

## Deployment

Configured for Vercel (`vercel.json`): all non-`/api` paths rewrite to
`index.html`, and `api/` is deployed as serverless functions. Set the
environment variables above in the Vercel project settings — `.env` is not
uploaded.

Content changes in Sanity go live on Publish and need no deploy. Code changes
need a new deploy.
