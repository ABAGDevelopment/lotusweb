/**
 * Server-side endpoint that records a test-drive enquiry in Sanity.
 *
 * Deploy as a Vercel/Netlify function. Point ENQUIRY_ENDPOINT at it
 * (e.g. /api/test-drive).
 *
 * Handles BOTH invocation styles. Vercel's Node runtime calls a function as
 * (req, res); the Web-standard style is (Request) => Response, which the Vite
 * dev bridge and edge runtimes use. A Web-only handler on the Node runtime
 * returns a Response that nothing reads and never ends the response, so the
 * request hangs until it times out — with no error to show the user.
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

/** Never wait forever for a request body. */
const BODY_READ_TIMEOUT_MS = 5_000

const MAX = { name: 120, email: 200, phone: 40, model: 80, location: 120, date: 40, message: 2000, country: 80 }

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
  country: string
  marketingConsent: boolean
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
    country: clean(body.country, MAX.country),
    marketingConsent: body.marketingConsent === true,
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

export async function webHandler(request: Request): Promise<Response> {
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

/* ------------------------------------------------------------------ */
/* Runtime adapter                                                     */
/* ------------------------------------------------------------------ */

interface NodeLikeRequest {
  method?: string
  url?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
  on(event: string, cb: (chunk?: unknown) => void): void
}

interface NodeLikeResponse {
  statusCode: number
  setHeader(name: string, value: string): void
  end(body?: string): void
}

function isNodeResponse(value: unknown): value is NodeLikeResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as NodeLikeResponse).end === 'function' &&
    typeof (value as NodeLikeResponse).setHeader === 'function'
  )
}

/**
 * Vercel's Node runtime already parses a JSON body; fall back to the stream.
 *
 * The stream read is guarded: a request whose 'end' never fires — a bodyless
 * GET, an aborted upload — would otherwise leave this promise pending and the
 * response never sent, which is a hang with no error for the caller.
 */
async function readNodeBody(req: NodeLikeRequest): Promise<string> {
  if (typeof req.body === 'string') return req.body
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body)
  if (['GET', 'HEAD'].includes((req.method ?? 'POST').toUpperCase())) return ''

  return new Promise<string>((resolve) => {
    const chunks: Buffer[] = []
    const done = (value: string) => {
      clearTimeout(guard)
      resolve(value)
    }
    const guard = setTimeout(() => done(''), BODY_READ_TIMEOUT_MS)
    req.on('data', (c) => chunks.push(c as Buffer))
    req.on('end', () => done(Buffer.concat(chunks).toString('utf8')))
    req.on('error', () => done(''))
  })
}

export default async function handler(
  a: Request | NodeLikeRequest,
  b?: unknown,
): Promise<Response | void> {
  // Web style: a single Request argument.
  if (!isNodeResponse(b)) {
    return webHandler(a as Request)
  }

  // Node style: (req, res). Adapt in, run the same logic, adapt out — so the
  // two runtimes can never behave differently.
  const req = a as NodeLikeRequest
  const res = b
  try {
    const raw = await readNodeBody(req)
    const request = new Request(`https://local${req.url ?? '/api/test-drive'}`, {
      method: req.method ?? 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: ['GET', 'HEAD'].includes((req.method ?? 'POST').toUpperCase()) ? undefined : raw,
    })
    const response = await webHandler(request)
    res.statusCode = response.status
    response.headers.forEach((value, key) => res.setHeader(key, value))
    res.end(await response.text())
  } catch (error) {
    // Always end the response. An unhandled throw here is what leaves the
    // browser spinning with no status.
    console.error('[test-drive] handler failed', error)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Internal error' }))
  }
}
