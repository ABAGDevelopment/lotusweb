/**
 * Server-side endpoint that records a test-drive enquiry in Sanity.
 *
 * Deploy as a Vercel/Netlify function. Point VITE_ENQUIRY_ENDPOINT at it
 * (e.g. /api/test-drive).
 *
 * The write token lives here, never in the browser bundle. A Sanity write
 * token in client-side JavaScript lets anyone rewrite the whole dataset, so
 * the form deliberately cannot talk to Sanity directly.
 *
 * Required environment variables (server-side, NOT prefixed with VITE_):
 *   SANITY_PROJECT_ID
 *   SANITY_DATASET
 *   SANITY_WRITE_TOKEN   — Editor permissions
 */

import { createClient } from '@sanity/client'

/**
 * Built per request, not at module load. A top-level client throws on a
 * missing projectId before the handler runs, so every request — including
 * malformed ones that should get a 400 — failed with the same 500.
 */
function getClient() {
  const projectId = process.env.SANITY_PROJECT_ID
  const token = process.env.SANITY_WRITE_TOKEN
  if (!projectId) throw new Error('SANITY_PROJECT_ID is not set on the server')
  if (!token) throw new Error('SANITY_WRITE_TOKEN is not set on the server')
  return createClient({
    projectId,
    dataset: process.env.SANITY_DATASET || 'production',
    token,
    apiVersion: '2024-10-01',
    useCdn: false,
  })
}

const MAX = { name: 120, email: 200, phone: 40, model: 80, location: 120, date: 40, message: 2000 }

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export interface EnquiryDoc {
  _type: 'testDriveEnquiry'
  fullName: string
  email: string
  phone: string
  model: string
  location: string
  preferredDate: string
  message: string
  locale: string
  submittedAt: string
}

/**
 * Validate and normalise a submission. Pure — no client, no clock beyond
 * `now` — so the rules can be unit tested.
 */
export function buildEnquiry(
  body: Record<string, unknown>,
  now = new Date(),
): { doc: EnquiryDoc } | { error: string } {
  const doc: EnquiryDoc = {
    _type: 'testDriveEnquiry',
    fullName: clean(body.fullName, MAX.name),
    email: clean(body.email, MAX.email),
    phone: clean(body.phone, MAX.phone),
    model: clean(body.model, MAX.model),
    location: clean(body.location, MAX.location),
    preferredDate: clean(body.preferredDate, MAX.date),
    message: clean(body.message, MAX.message),
    locale: clean(body.locale, 8) || 'en',
    // Trusted server clock — never the value the client claims.
    submittedAt: now.toISOString(),
  }

  // Server-side validation: the browser checks are for UX, not for trust.
  if (!doc.fullName || !doc.email || !doc.phone || !doc.model || !doc.location) {
    return { error: 'Missing required fields' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doc.email)) {
    return { error: 'Invalid email' }
  }
  return { doc }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = buildEnquiry(body)
  if ('error' in result) {
    return Response.json({ error: result.error }, { status: 400 })
  }
  const { doc } = result

  try {
    const created = await getClient().create(doc)
    return Response.json({ ok: true, id: created._id }, { status: 201 })
  } catch (error) {
    console.error('[test-drive] failed to record enquiry', error)
    // Never leak token or dataset details to the client.
    return Response.json({ error: 'Could not record enquiry' }, { status: 502 })
  }
}
