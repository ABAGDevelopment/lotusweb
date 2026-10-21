/**
 * POST /api/offer-enquiry: records an enquiry from an offer page in Sanity.
 *
 * Checks, in order: method and content type, a per-IP rate limit, body size,
 * the honeypot, that the offer is published and live today, then the
 * visitor's answers against the same zod schema the form uses.
 *
 * Enquiries are created as `offerEnquiry.<uuid>`. Both datasets are public,
 * and Sanity only keeps documents whose ID contains a dot private, so this
 * keeps names, emails and phone numbers out of the public API.
 *
 * Nothing here logs request bodies or field values: only error types.
 *
 * Server-side environment variables (never bundled into the site):
 *   SANITY_PROJECT_ID, SANITY_DATASET
 *   SANITY_WRITE_TOKEN — Editor role (SANITY_API_WRITE_TOKEN also works)
 *
 * Relative imports carry .js: package.json is "type": "module", and Node's
 * ESM loader on Vercel does not guess extensions.
 */

import { randomUUID } from 'node:crypto'
import { createClient } from '@sanity/client'
import { adapt } from './_lib/adapter.js'
import {
  LIVE_OFFER,
  dubaiToday,
  enquiryMetaSchema,
  fieldErrors,
  offerEnquirySchema,
  type EnquirySource,
} from '../src/lib/offerEnquiry.js'

const MAX_BODY_CHARS = 10_000
export const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 }

export interface LiveOffer {
  _id: string
  title: string
  /** English names: what the form submits and the schema accepts. */
  models: string[]
}

export interface OfferEnquiryDoc {
  _id: string
  _type: 'offerEnquiry'
  status: 'new'
  offer: { _type: 'reference'; _ref: string; _weak: true }
  offerTitle: string
  fullName: string
  email: string
  phone: string
  model?: string
  contactMethod: string
  consent: true
  locale: string
  source: EnquirySource
  submittedAt: string
}

/** Where enquiries go. Swappable so the handler can be tested without Sanity. */
export interface EnquiryStore {
  findLiveOffer(id: string, today: string): Promise<LiveOffer | null>
  create(doc: OfferEnquiryDoc): Promise<void>
}

class ConfigError extends Error {
  name = 'ConfigError'
}

/** Built per request: a module-level client would throw before any response on missing env. */
function sanityClient() {
  const projectId = process.env.SANITY_PROJECT_ID
  const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN
  if (!projectId) throw new ConfigError('SANITY_PROJECT_ID is not set')
  if (!token) throw new ConfigError('SANITY_WRITE_TOKEN is not set')
  return createClient({
    projectId,
    dataset: process.env.SANITY_DATASET || 'production',
    token,
    apiVersion: '2024-10-01',
    useCdn: false,
    // With a token the default would include drafts: only published offers count.
    perspective: 'published',
  })
}

export const sanityStore: EnquiryStore = {
  findLiveOffer: (id, today) =>
    sanityClient().fetch<LiveOffer | null>(
      `*[${LIVE_OFFER} && _id == $id][0]{ _id, "title": coalesce(title.en, ""), "models": coalesce(modelOptions[defined(en)].en, []) }`,
      { id, today },
    ),
  create: async (doc) => {
    await sanityClient().create(doc)
  },
}

// ponytail: per-instance memory, so a cold start or a second instance starts
// a fresh count. Move to Vercel KV / Upstash if spam gets through.
const hits = new Map<string, number[]>()

export function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5_000) {
    for (const [k, times] of hits) if (now - times[times.length - 1] >= RATE_LIMIT.windowMs) hits.delete(k)
  }
  return recent.length > RATE_LIMIT.max
}

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

function logFailure(stage: string, error: unknown) {
  const name = error instanceof Error ? error.name : 'unknown'
  const status = (error as { statusCode?: number })?.statusCode
  // Config messages name env vars only; any other message could echo data.
  const detail = error instanceof ConfigError ? error.message : status ? `HTTP ${status}` : ''
  console.error(`[offer-enquiry] ${stage} failed: ${name} ${detail}`.trim())
}

export function createHandler(store: EnquiryStore, clock = () => new Date()) {
  return async function webHandler(request: Request): Promise<Response> {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
    // JSON-only also means a cross-site browser POST needs a CORS preflight, which this never grants.
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return json({ error: 'Expected application/json' }, 415)
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
    if (isRateLimited(ip)) {
      return json({ error: 'Too many requests' }, 429, { 'Retry-After': String(RATE_LIMIT.windowMs / 1000) })
    }

    const raw = await request.text()
    if (raw.length > MAX_BODY_CHARS) return json({ error: 'Request too large' }, 413)

    let body: Record<string, unknown>
    try {
      const parsed: unknown = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new TypeError()
      body = parsed as Record<string, unknown>
    } catch {
      return json({ error: 'Invalid JSON' }, 400)
    }

    // People never see the honeypot; bots fill it. Answer as if it worked so they do not adapt.
    if (typeof body.website === 'string' && body.website.trim() !== '') return json({ ok: true }, 201)

    const meta = enquiryMetaSchema.safeParse(body)
    if (!meta.success) return json({ error: 'Unknown offer' }, 400)

    const now = clock()
    let offer: LiveOffer | null
    try {
      offer = await store.findLiveOffer(meta.data.offerId, dubaiToday(now))
    } catch (error) {
      logFailure('offer lookup', error)
      return json({ error: 'Could not record enquiry' }, 502)
    }
    if (!offer) return json({ error: 'Offer not available' }, 404)

    const fields = offerEnquirySchema(offer.models).safeParse(body)
    if (!fields.success) return json({ error: 'Invalid fields', fields: fieldErrors(fields.error) }, 400)

    const doc: OfferEnquiryDoc = {
      _id: `offerEnquiry.${randomUUID()}`,
      _type: 'offerEnquiry',
      status: 'new',
      offer: { _type: 'reference', _ref: offer._id, _weak: true },
      offerTitle: offer.title,
      fullName: fields.data.fullName,
      email: fields.data.email,
      phone: fields.data.phone,
      model: fields.data.model || undefined,
      contactMethod: fields.data.contactMethod,
      consent: true,
      locale: meta.data.locale,
      source: meta.data.source,
      // The server's clock, never one the browser claims.
      submittedAt: now.toISOString(),
    }

    try {
      await store.create(doc)
    } catch (error) {
      logFailure('create', error)
      return json({ error: 'Could not record enquiry' }, 502)
    }
    return json({ ok: true }, 201)
  }
}

export default adapt(createHandler(sanityStore), 'offer-enquiry')
