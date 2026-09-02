import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { client } from './client'
import { LISTEN_QUERY } from './queries'

export type LiveStatus = 'connecting' | 'live' | 'polling' | 'offline'

export interface LiveResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  status: LiveStatus
  lastUpdated: Date | null
  refresh: () => void
}

const REFETCH_DEBOUNCE_MS = 120
const POLL_INTERVAL_MS = 30_000

/**
 * Generic live-content hook. Any page built on this refetches automatically
 * when a document is published — the home page, vehicle detail pages, and the
 * test-drive page all share one listener.
 */
export function useLiveQuery<T>(
  query: string,
  params: Record<string, unknown> = {},
): LiveResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!!client)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<LiveStatus>('connecting')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const mounted = useRef(true)
  const inFlight = useRef(false)
  const queued = useRef(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Params are recreated each render; key the effects off their content.
  const paramsKey = JSON.stringify(params)

  const fetchContent = useCallback(async () => {
    if (!client) return
    if (inFlight.current) {
      queued.current = true
      return
    }
    inFlight.current = true
    try {
      const result = await client.fetch<T>(query, JSON.parse(paramsKey))
      if (!mounted.current) return
      setData(result)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      if (!mounted.current) return
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      inFlight.current = false
      if (!mounted.current) return
      setLoading(false)
      if (queued.current) {
        queued.current = false
        void fetchContent()
      }
    }
  }, [query, paramsKey])

  const scheduleRefetch = useCallback(() => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => void fetchContent(), REFETCH_DEBOUNCE_MS)
  }, [fetchContent])

  useEffect(() => {
    mounted.current = true
    if (!client) {
      setLoading(false)
      setStatus('offline')
    } else {
      setLoading(true)
      void fetchContent()
    }
    return () => {
      mounted.current = false
      if (debounce.current) clearTimeout(debounce.current)
    }
  }, [fetchContent])

  useEffect(() => {
    if (!client) return
    const sub = client
      .listen(
        LISTEN_QUERY,
        {},
        {
          visibility: 'query',
          includeResult: false,
          includePreviousRevision: false,
          events: ['welcome', 'mutation', 'reconnect'],
        },
      )
      .subscribe({
        next: (event) => {
          if (!mounted.current) return
          if (event.type === 'welcome') setStatus('live')
          else if (event.type === 'reconnect') {
            setStatus('connecting')
            scheduleRefetch()
          } else if (event.type === 'mutation') {
            setStatus('live')
            scheduleRefetch()
          }
        },
        error: (err: unknown) => {
          if (!mounted.current) return
          console.warn('[sanity] live channel error, falling back to polling', err)
          setStatus('polling')
        },
      })
    return () => sub.unsubscribe()
  }, [scheduleRefetch])

  useEffect(() => {
    if (!client || status === 'live') return
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') void fetchContent()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [status, fetchContent])

  useEffect(() => {
    if (!client) return
    const onVisible = () => {
      if (document.visibilityState === 'visible') scheduleRefetch()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onVisible)
    }
  }, [scheduleRefetch])

  const refresh = useCallback(() => void fetchContent(), [fetchContent])

  return useMemo(
    () => ({ data, loading, error, status, lastUpdated, refresh }),
    [data, loading, error, status, lastUpdated, refresh],
  )
}
