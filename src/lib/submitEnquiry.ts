export interface EnquiryPayload {
  fullName: string
  email: string
  phone: string
  model: string
  preferredDate: string
  message: string
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

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Submission failed (${response.status}). ${detail}`.trim())
  }
}
