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

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2024-10-01',
  useCdn: false,
})

const MAX = { name: 120, email: 200, phone: 40, model: 80, date: 40, message: 2000 }

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
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

  const doc = {
    _type: 'testDriveEnquiry',
    fullName: clean(body.fullName, MAX.name),
    email: clean(body.email, MAX.email),
    phone: clean(body.phone, MAX.phone),
    model: clean(body.model, MAX.model),
    preferredDate: clean(body.preferredDate, MAX.date),
    message: clean(body.message, MAX.message),
    locale: clean(body.locale, 8) || 'en',
    // Trusted server clock — never the value the client claims.
    submittedAt: new Date().toISOString(),
  }

  // Server-side validation: the browser checks are for UX, not for trust.
  if (!doc.fullName || !doc.email || !doc.phone || !doc.model) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doc.email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 })
  }

  try {
    const created = await client.create(doc)
    return Response.json({ ok: true, id: created._id }, { status: 201 })
  } catch (error) {
    console.error('[test-drive] failed to record enquiry', error)
    // Never leak token or dataset details to the client.
    return Response.json({ error: 'Could not record enquiry' }, { status: 502 })
  }
}
