import type { EnquirySource } from '@/lib/offerEnquiry'

/**
 * Campaign tags arrive on the landing page, but the visitor usually enquires
 * a few clicks later, after the SPA has dropped the query string. So the tags
 * and the outside referrer are kept for the browser session (the latest
 * campaign wins) and attached to enquiries.
 */

const KEY = 'lotus:source'

const PARAMS = {
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_term: 'utmTerm',
  utm_content: 'utmContent',
} as const

type Remembered = Omit<EnquirySource, 'page'>

export function rememberSource(): void {
  try {
    const params = new URLSearchParams(window.location.search)
    const found: Remembered = {}
    for (const [param, key] of Object.entries(PARAMS)) {
      const value = params.get(param)
      if (value) found[key] = value.slice(0, 200)
    }
    // Origin and path only: a referrer's query string can carry someone's data.
    const ref = document.referrer ? new URL(document.referrer) : null
    if (ref && ref.origin !== window.location.origin) found.referrer = `${ref.origin}${ref.pathname}`
    if (Object.keys(found).length) sessionStorage.setItem(KEY, JSON.stringify(found))
  } catch {
    // Storage blocked or a malformed referrer: enquiries simply go without source data.
  }
}

/** The remembered tags plus the page the enquiry is sent from. */
export function enquirySource(): EnquirySource {
  let remembered: Remembered = {}
  try {
    remembered = JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Remembered
  } catch {
    // As above.
  }
  return { ...remembered, page: window.location.pathname }
}
