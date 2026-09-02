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

const App = () => (
  <ContentProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </ContentProvider>
)

export default App
