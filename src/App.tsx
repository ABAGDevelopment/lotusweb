import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import VehicleDetail from '@/pages/VehicleDetail'
import TestDrive from '@/pages/TestDrive'
import ThankYou from '@/pages/ThankYou'
import { ContentProvider, useSite } from '@/sanity/ContentProvider'
import { DEFAULT_LOCALE, LOCALES, LocaleProvider, isLocale } from '@/i18n/LocaleProvider'
import type { Locale } from '@/sanity/types'

/**
 * Routing
 *
 *   /                          home, in the default language
 *   /vehicles/:slug            vehicle detail
 *   /test-drive                enquiry form
 *   /test-drive/thank-you      confirmation
 *   /ar/...                    the same tree in Arabic
 *
 * The default language lives at the root and every other language gets a
 * prefix. Which one is the default comes from Site Settings, so the tree is
 * built rather than hardcoded.
 */
function pages() {
  return (
    <>
      <Route index element={<Index />} />
      <Route path="vehicles/:slug" element={<VehicleDetail />} />
      <Route path="test-drive" element={<TestDrive />} />
      <Route path="test-drive/thank-you" element={<ThankYou />} />
      <Route path="*" element={<NotFound />} />
    </>
  )
}

function LocaleShell({ locale, defaultLocale }: { locale: Locale; defaultLocale: Locale }) {
  return <LocaleProvider locale={locale} defaultLocale={defaultLocale} />
}

function AppRoutes() {
  const site = useSite()
  const configured = site?.settings?.defaultLocale
  const defaultLocale: Locale = isLocale(configured) ? configured : DEFAULT_LOCALE
  const others = LOCALES.filter((l) => l !== defaultLocale)

  return (
    <Routes>
      {/* Default language at the root */}
      <Route
        path="/"
        element={<LocaleShell locale={defaultLocale} defaultLocale={defaultLocale} />}
      >
        {pages()}
      </Route>

      {/* Prefixed languages */}
      {others.map((locale) => (
        <Route
          key={locale}
          path={`/${locale}`}
          element={<LocaleShell locale={locale} defaultLocale={defaultLocale} />}
        >
          {pages()}
        </Route>
      ))}

      {/* The default language's own prefix is a duplicate of the root. */}
      <Route path={`/${defaultLocale}`} element={<Navigate to="/" replace />} />
    </Routes>
  )
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
