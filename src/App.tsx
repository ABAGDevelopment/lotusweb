import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { ContentProvider, useSite } from '@/sanity/ContentProvider'
import { DEFAULT_LOCALE, isLocale } from '@/i18n/LocaleProvider'
import { buildRoutes } from '@/routes'
import type { Locale } from '@/sanity/types'

function AppRoutes() {
  const site = useSite()
  const configured = site?.settings?.defaultLocale
  const defaultLocale: Locale = isLocale(configured) ? configured : DEFAULT_LOCALE
  return useRoutes(buildRoutes(defaultLocale))
}

/**
 * Everything above the router. Exported so the render smoke test composes the
 * app exactly as production does — a test that builds its own provider stack
 * passes while the real tree is broken.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ContentProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </ContentProvider>
  )
}

const App = () => (
  <AppProviders>
    <Toaster />
    <Sonner />
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRoutes />
    </BrowserRouter>
  </AppProviders>
)

export default App
