import { SITE_QUERY } from './queries'
import { useLiveQuery, type LiveStatus } from './useLiveQuery'
import type { SitePayload } from './types'

export type { LiveStatus }

/** The global chrome + home page payload. */
export function useLiveContent() {
  return useLiveQuery<SitePayload>(SITE_QUERY)
}
