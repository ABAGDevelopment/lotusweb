import { renderToString } from 'react-dom/server'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { AppProviders } from './src/App'
import { buildRoutes, EXPECTED_PATHS } from './src/routes'

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

console.error = realError

if (failures.length > 0) {
  console.log(`\n${failures.length} route(s) failed to render`)
  process.exit(1)
}
console.log(`\nall ${EXPECTED_PATHS.length} routes render`)
