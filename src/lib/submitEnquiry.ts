export interface EnquiryPayload {
  fullName: string
  email: string
  phone: string
  model: string
  location: string
  preferredDate: string
  message: string
  country: string
  marketingConsent: boolean
  locale: string
}

/**
 * Where submissions go.
 *
 * The browser must never hold a Sanity write token — it would let anyone
 * rewrite the entire dataset. So the form POSTs to your own endpoint, which
 * holds the token server-side. `apps/web/api/test-drive.ts` is a working
 * Vercel/Netlify function that writes a `testDriveEnquiry` document; point
 * ENQUIRY_ENDPOINT at it, or at Formspree, Zapier, or your CRM.
 */
const ENDPOINT = (import.meta.env.ENQUIRY_ENDPOINT ?? '').trim()

/** Vercel functions time out around 10s; allow a little headroom. */
const TIMEOUT_MS = 20_000

export async function submitEnquiry(payload: EnquiryPayload): Promise<void> {
  if (!ENDPOINT) {
    if (import.meta.env.DEV) {
      // Without an endpoint the form would silently pretend to work, which is
      // the failure mode that hides broken forms in production. Be loud in dev.
      console.warn(
        '[lotus] ENQUIRY_ENDPOINT is not set — the enquiry was NOT sent anywhere.\n' +
          'Payload that would have been submitted:',
        payload,
      )
      return
    }
    throw new Error('Enquiry endpoint is not configured (ENQUIRY_ENDPOINT).')
  }

  // Without a timeout a stalled endpoint leaves the button spinning forever
  // with nothing to tell the user. Fail loudly instead.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(
        `The server did not respond within ${TIMEOUT_MS / 1000}s. Please try again, or call the showroom.`,
      )
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    // An HTML body means the request hit the SPA fallback rather than the
    // function — usually a missing /api exclusion in vercel.json.
    const looksLikeHtml = detail.trimStart().startsWith('<')
    throw new Error(
      looksLikeHtml
        ? `Submission failed (${response.status}): the endpoint returned HTML, not JSON. Check that ${ENDPOINT} is deployed as a function.`
        : `Submission failed (${response.status}). ${detail}`.trim(),
    )
  }
}
