import { renderToString } from 'react-dom/server'
import { MemoryRouter, RouterProvider, createMemoryRouter } from 'react-router-dom'
import { AppProviders } from './src/App'
import { buildRoutes, EXPECTED_PATHS } from './src/routes'
import HeroSection from './src/components/Index/HeroSection'
import { LocaleProvider } from './src/i18n/LocaleProvider'
import type { HeroSectionData } from './src/sanity/types'

/**
 * Render smoke test.
 *
 * A type-check and a bundle prove nothing about whether the tree actually
 * mounts: a provider in the wrong place, a hook outside its context, or a
 * missing null guard all compile cleanly and fail on first paint. This renders
 * every route through the real provider stack and fails on any throw.
 *
 *   npm run smoke
 */

// SSR has no layout effects; the warning is expected and drowns the output.
const realError = console.error
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('useLayoutEffect does nothing')) return
  realError(...args)
}

const failures: string[] = []

for (const path of EXPECTED_PATHS) {
  try {
    const router = createMemoryRouter(buildRoutes('en'), { initialEntries: [path] })
    const html = renderToString(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    )
    if (html.trim().length === 0) throw new Error('rendered empty output')
    console.log(`  \u2713 ${path}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    failures.push(`${path}: ${message}`)
    console.log(`  \u2717 ${path}  ${message}`)
  }
}

// Routes render with no CMS data, so the hero's two modes are checked here:
// the single legacy hero until editors add slides, then the slides alone.
const renderHero = (data: HeroSectionData) =>
  renderToString(
    <MemoryRouter>
      <LocaleProvider locale="en">
        <HeroSection data={data} />
      </LocaleProvider>
    </MemoryRouter>,
  )
const legacyHero = renderHero({ headingTop: { en: 'Legacy' }, eyebrow: { en: 'Old sub-line' } })
const slidHero = renderHero({
  headingTop: { en: 'Legacy' },
  slides: [
    { _key: 'a', headingTop: { en: 'First slide' } },
    { _key: 'b', headingTop: { en: 'Second slide' }, textLink: { label: { en: 'View offer' }, href: '#offers' } },
  ],
})
if (!legacyHero.includes('Old sub-line') || legacyHero.includes('aria-label="Slide')) {
  failures.push('hero: legacy fallback broken')
} else if (
  slidHero.includes('Legacy') ||
  !['First slide', 'Second slide', 'View offer', 'aria-label="Slide 2"'].every((s) => slidHero.includes(s))
) {
  failures.push('hero: slides not rendered')
} else {
  console.log('  ✓ hero fallback + slides')
}

console.error = realError

if (failures.length > 0) {
  console.log(`\n${failures.length} route(s) failed to render`)
  process.exit(1)
}
console.log(`\nall ${EXPECTED_PATHS.length} routes render`)
