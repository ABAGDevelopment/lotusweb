import { createContext, useContext, useEffect, useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Locale, LocaleString } from '@/sanity/types'

export const LOCALES: Locale[] = ['en', 'ar']
export const RTL_LOCALES: Locale[] = ['ar']
export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as string[]).includes(value)
}

export type Translate = (value?: LocaleString | null, fallback?: string) => string

interface LocaleContextValue {
  locale: Locale
  dir: 'ltr' | 'rtl'
  isRtl: boolean
  /** Resolve a localised field, falling back to the other locale then to ''. */
  t: Translate
  /** Path for the same page in another locale. */
  pathFor: (locale: Locale) => string
  /** Prefix an app path with the current locale, e.g. '/vehicles/emira'. */
  localePath: (path: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  locale,
  defaultLocale = DEFAULT_LOCALE,
  children,
}: {
  locale: Locale
  /** The language served at `/`. Comes from Site Settings. */
  defaultLocale?: Locale
  /** Omit when used as a router layout route — child routes render instead. */
  children?: ReactNode
}) {
  const value = useMemo<LocaleContextValue>(() => {
    const isRtl = RTL_LOCALES.includes(locale)

    const t: Translate = (field, fallback = '') => {
      if (!field) return fallback
      const primary = field[locale]
      if (typeof primary === 'string' && primary.trim() !== '') return primary
      // Fall back to any other locale so a half-translated document still
      // renders something rather than a blank space.
      for (const candidate of LOCALES) {
        const alt = field[candidate]
        if (typeof alt === 'string' && alt.trim() !== '') return alt
      }
      return fallback
    }

    return {
      locale,
      dir: isRtl ? 'rtl' : 'ltr',
      isRtl,
      t,
      pathFor: (target: Locale) => (target === defaultLocale ? '/' : `/${target}`),
      localePath: (path: string) => {
        const clean = path.startsWith('/') ? path : `/${path}`
        return locale === defaultLocale ? clean : `/${locale}${clean}`
      },
    }
  }, [locale, defaultLocale])

  useEffect(() => {
    const html = document.documentElement
    html.lang = locale
    html.dir = value.dir
    html.dataset.locale = locale
  }, [locale, value.dir])

  return (
    <LocaleContext.Provider value={value}>{children ?? <Outlet />}</LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>')
  return ctx
}
