import { renderToString } from 'react-dom/server'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { AppProviders } from './src/App'
import { buildRoutes } from './src/routes'
import CmsLink from './src/components/common/CmsLink'
import { LocaleProvider } from './src/i18n/LocaleProvider'
import type { Locale } from './src/sanity/types'

const realError = console.error
console.error = (...a: unknown[]) => {
  if (typeof a[0] === 'string' && a[0].includes('useLayoutEffect does nothing')) return
  realError(...a)
}

/** Render a CmsLink at a given URL and pull the href the browser would follow. */
function hrefFor(cmsHref: string, locale: Locale, atPath: string): string {
  const routes = [
    {
      path: locale === 'en' ? '/' : `/${locale}`,
      element: (
        <LocaleProvider locale={locale} defaultLocale="en">
          <CmsLink link={{ label: { en: 'x', ar: 'x' }, href: cmsHref }} />
        </LocaleProvider>
      ),
      children: [{ path: '*', element: null }],
    },
  ]
  const router = createMemoryRouter(routes, { initialEntries: [atPath] })
  const html = renderToString(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  const m = html.match(/href="([^"]*)"/)
  return m ? m[1] : '(no link rendered)'
}

let bad = 0
const expect = (label: string, got: string, want: string) => {
  const ok = got === want
  if (!ok) bad++
  console.log(`  ${ok ? '\u2713' : '\u2717'} ${label.padEnd(52)} ${got}${ok ? '' : `   (expected ${want})`}`)
}

console.log('Nav anchors from the HOME page:')
expect('#range  @ /', hrefFor('#range', 'en', '/'), '/#range')
expect('#offers @ /', hrefFor('#offers', 'en', '/'), '/#offers')

console.log('Nav anchors from a VEHICLE page (the reported bug):')
expect('#range   @ /vehicles/emira', hrefFor('#range', 'en', '/vehicles/emira'), '/#range')
expect('#service @ /vehicles/emira', hrefFor('#service', 'en', '/vehicles/emira'), '/#service')
expect('#story   @ /test-drive', hrefFor('#story', 'en', '/test-drive'), '/#story')

console.log('Arabic keeps its locale prefix:')
// '/ar/#range' — the trailing slash is harmless: React Router matches '/ar/'
// to the same route as '/ar' (asserted separately in the route test).
expect('#range  @ /ar/vehicles/emira', hrefFor('#range', 'ar', '/ar/vehicles/emira'), '/ar/#range')
expect('#offers @ /ar', hrefFor('#offers', 'ar', '/ar'), '/ar/#offers')

console.log('Non-anchor links unaffected:')
expect('/vehicles/emeya @ /', hrefFor('/vehicles/emeya', 'en', '/'), '/vehicles/emeya')
expect('https://x.com   @ /', hrefFor('https://x.com', 'en', '/'), 'https://x.com')

console.error = realError
console.log(bad ? `\n${bad} FAILURES` : '\nall navigation assertions passed')
process.exit(bad ? 1 : 0)
