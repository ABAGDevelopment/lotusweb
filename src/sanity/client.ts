import { createClient, type SanityClient } from '@sanity/client'

export const projectId = (import.meta.env.SANITY_PROJECT_ID ?? '').trim()
export const dataset = (import.meta.env.SANITY_DATASET ?? 'production').trim()
export const apiVersion = (import.meta.env.SANITY_API_VERSION ?? '2024-10-01').trim()

/**
 * The CDN caches responses for up to a minute, which would delay published
 * changes reaching the browser. Live updates are the whole point here, so the
 * default is CDN off. Set SANITY_USE_CDN=true if you would rather trade
 * instant freshness for cheaper reads.
 */
const useCdn = String(import.meta.env.SANITY_USE_CDN ?? 'false') === 'true'

export const isSanityConfigured = projectId.length > 0

/**
 * `createClient` throws on an empty projectId, so during first-time setup we
 * hand back null and let the UI render the setup screen instead of crashing.
 */
export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn,
      perspective: 'published',
      stega: false,
    })
  : null
