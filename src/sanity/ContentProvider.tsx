import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useLiveContent, type LiveStatus } from './useLiveContent'
import type { SitePayload } from './types'

interface ContentContextValue {
  content: SitePayload | null
  loading: boolean
  error: Error | null
  status: LiveStatus
  lastUpdated: Date | null
  refresh: () => void
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const { data, loading, error, status, lastUpdated, refresh } = useLiveContent()
  const value: ContentContextValue = {
    content: data,
    loading,
    error,
    status,
    lastUpdated,
    refresh,
  }
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}

/** Convenience accessors used by the section components. */
export function useSite() {
  return useContent().content
}
