import handler from './api/test-drive'
import { createHandler, RATE_LIMIT, type EnquiryStore, type OfferEnquiryDoc } from './api/offer-enquiry'
import { adapt } from './api/_lib/adapter'
import { dubaiToday, fieldErrors, normalizeUaePhone, offerEnquirySchema } from './src/lib/offerEnquiry'

/**
 * Exercises BOTH invocation styles. The Vercel Node runtime uses (req, res);
 * a handler that only speaks the Web style silently never ends the response,
 * which is what left the browser hanging.
 */
interface Captured { status: number; body: string; ended: boolean }

function mockRes(): { res: Record<string, unknown>; out: Captured } {
  const out: Captured = { status: 0, body: '', ended: false }
  const res = {
    statusCode: 200,
    setHeader: () => undefined,
    end: (body?: string) => {
      out.status = (res as { statusCode: number }).statusCode
      out.body = body ?? ''
      out.ended = true
    },
  }
  return { res: res as unknown as Record<string, unknown>, out }
}

const VALID = {
  fullName: 'Ajay Singh', email: 'a@example.com', phone: '+971501234567',
  model: 'emira', location: 'Lotus Dubai', preferredDate: '2026-10-01', locale: 'en',
}

let bad = 0
const check = (label: string, ok: boolean, detail = '') => {
  if (!ok) bad++
  console.log(`  ${ok ? '\u2713' : '\u2717'} ${label.padEnd(48)} ${detail}`)
}

async function nodeStyle(body: unknown, method = 'POST') {
  const { res, out } = mockRes()
  // Mimic a real Node request: 'end' fires even with no body.
  const req = {
    method, url: '/api/test-drive', headers: {}, body,
    on: (event: string, cb: (chunk?: unknown) => void) => {
      if (event === 'end') setTimeout(() => cb(), 0)
    },
  }
  await Promise.race([
    handler(req as never, res as never),
    new Promise((_, rej) => setTimeout(() => rej(new Error('HUNG - never ended')), 5000)),
  ])
  return out
}

async function webStyle(body: unknown, method = 'POST') {
  const request = new Request('https://local/api/test-drive', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'GET' ? undefined : JSON.stringify(body),
  })
  const response = (await handler(request)) as Response
  return { status: response.status, body: await response.text(), ended: true }
}

async function main() {
  console.log('Node signature (what Vercel actually calls):')
  let r = await nodeStyle({ fullName: 'x' })
  check('missing fields -> 400, response ended', r.ended && r.status === 400, r.body.slice(0, 40))
  r = await nodeStyle({ ...VALID, email: 'nope' })
  check('invalid email -> 400, response ended', r.ended && r.status === 400, r.body.slice(0, 40))
  r = await nodeStyle(undefined, 'GET')
  check('GET -> 405, response ended', r.ended && r.status === 405, r.body.slice(0, 40))
  r = await nodeStyle(VALID)
  check('valid -> responds (not hung)', r.ended, `status ${r.status}`)

  console.log('Web signature (dev bridge / edge):')
  const w1 = await webStyle({ fullName: 'x' })
  check('missing fields -> 400', w1.status === 400, w1.body.slice(0, 40))
  const w2 = await webStyle(VALID)
  check('valid -> responds', typeof w2.status === 'number', `status ${w2.status}`)

  await offerEnquiryTests()

  console.log(bad ? `\n${bad} FAILURES` : '\nall API assertions passed')
  process.exit(bad ? 1 : 0)

}

main()

/* ------------------------------------------------------------------ */
/* Offer enquiries: the shared schema, then the handler on a fake store */
/* ------------------------------------------------------------------ */

const OFFER = { _id: 'offer-eletre-x', title: 'Eletre X', models: ['Eletre X', 'Eletre X S'] }

const ENQUIRY = {
  offerId: OFFER._id,
  locale: 'en',
  source: { utmSource: 'instagram', page: '/offers/eletre-x' },
  fullName: 'Layla Al Mansoori',
  email: 'layla@example.com',
  phone: '050 123 4567',
  model: 'Eletre X',
  contactMethod: 'whatsapp',
  consent: true,
  website: '',
}

function fakeStore(offer: typeof OFFER | null = OFFER, fail = false) {
  const created: OfferEnquiryDoc[] = []
  const store: EnquiryStore = {
    findLiveOffer: async (id) => (offer && id === offer._id ? offer : null),
    create: async (doc) => {
      if (fail) throw Object.assign(new Error(`rejected ${doc.email}`), { statusCode: 403 })
      created.push(doc)
    },
  }
  return { store, created }
}

let ipCounter = 0
async function post(store: EnquiryStore, body: unknown, init: { ip?: string; type?: string; method?: string } = {}) {
  const run = createHandler(store, () => new Date('2026-10-21T08:00:00Z'))
  const response = await run(
    new Request('https://local/api/offer-enquiry', {
      method: init.method ?? 'POST',
      headers: {
        'Content-Type': init.type ?? 'application/json',
        'x-forwarded-for': init.ip ?? `10.0.0.${++ipCounter}`,
      },
      body: (init.method ?? 'POST') === 'GET' ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )
  return { status: response.status, body: (await response.json().catch(() => ({}))) as Record<string, unknown> }
}

async function offerEnquiryTests() {
  console.log('Offer enquiry schema (shared by form and API):')
  const phones: [string, string | null][] = [
    ['050 123 4567', '+971501234567'],
    ['50-123-4567', '+971501234567'],
    ['+971 50 123 4567', '+971501234567'],
    ['00971501234567', '+971501234567'],
    ['(04) 123 4567', '+97141234567'],
    ['+971 050 123 4567', '+971501234567'],
    ['12345', null],
    ['+44 7700 900123', null],
    ['050 123 456a', null],
  ]
  for (const [input, want] of phones) {
    const got = normalizeUaePhone(input)
    check(`phone ${JSON.stringify(input)}`, got === want, String(got))
  }

  const schema = offerEnquirySchema(OFFER.models)
  const ok = schema.safeParse(ENQUIRY)
  check('valid enquiry parses', ok.success, ok.success ? ok.data.phone : '')
  const zwsp = String.fromCharCode(0x200b)
  const cleaned = schema.safeParse({ ...ENQUIRY, fullName: `  Layla${zwsp}\n  Al  Mansoori ` })
  check('name: invisible chars and spacing cleaned', cleaned.success && cleaned.data.fullName === 'Layla Al Mansoori')
  const arabic = schema.safeParse({ ...ENQUIRY, fullName: 'ليلى المنصوري' })
  check('name: Arabic accepted', arabic.success)
  const bad = schema.safeParse({
    ...ENQUIRY,
    fullName: '<script>',
    email: 'layla@',
    phone: '123',
    model: 'Emira',
    contactMethod: 'fax',
    consent: false,
  })
  const codes = bad.success ? {} : fieldErrors(bad.error)
  check(
    'bad fields -> one code each',
    JSON.stringify(codes) ===
      JSON.stringify({
        fullName: 'invalidName',
        email: 'invalidEmail',
        phone: 'invalidPhone',
        model: 'invalidOption',
        contactMethod: 'required',
        consent: 'consent',
      }),
    JSON.stringify(codes),
  )
  const empty = offerEnquirySchema([]).safeParse({ ...ENQUIRY, model: 'anything' })
  check('no model options -> model ignored', empty.success && empty.data.model === '')
  check('UAE date rolls over at 20:00 UTC', dubaiToday(new Date('2026-10-20T20:30:00Z')) === '2026-10-21')

  console.log('Offer enquiry handler:')
  let r = await post(fakeStore().store, ENQUIRY, { method: 'GET' })
  check('GET -> 405', r.status === 405)
  r = await post(fakeStore().store, 'fullName=x', { type: 'text/plain' })
  check('non-JSON content type -> 415', r.status === 415)
  r = await post(fakeStore().store, '{nope')
  check('malformed JSON -> 400', r.status === 400)

  const honey = fakeStore()
  r = await post(honey.store, { ...ENQUIRY, website: 'https://spam.example' })
  check('honeypot -> 201 but nothing stored', r.status === 201 && honey.created.length === 0)

  r = await post(fakeStore(null).store, ENQUIRY)
  check('offer not live -> 404', r.status === 404)
  r = await post(fakeStore().store, { ...ENQUIRY, offerId: 'drafts.offer-eletre-x' })
  check('draft / private offer id -> 400', r.status === 400)

  r = await post(fakeStore().store, { ...ENQUIRY, phone: '123', consent: false })
  check(
    'invalid fields -> 400 with codes',
    r.status === 400 && JSON.stringify(r.body.fields) === JSON.stringify({ phone: 'invalidPhone', consent: 'consent' }),
    JSON.stringify(r.body.fields),
  )

  const good = fakeStore()
  r = await post(good.store, ENQUIRY)
  const doc = good.created[0]
  check('valid -> 201 and one document', r.status === 201 && good.created.length === 1)
  check('doc id is private (dotted path)', /^offerEnquiry\.[0-9a-f-]{36}$/.test(doc?._id ?? ''), doc?._id)
  check(
    'doc links the offer, normalised, timestamped',
    doc?.offer._ref === OFFER._id &&
      doc.offer._weak === true &&
      doc.offerTitle === 'Eletre X' &&
      doc.phone === '+971501234567' &&
      doc.status === 'new' &&
      doc.submittedAt === '2026-10-21T08:00:00.000Z' &&
      doc.source.utmSource === 'instagram' &&
      !('website' in doc),
  )

  const logged: string[] = []
  const realLog = console.error
  console.error = (...args: unknown[]) => void logged.push(args.map(String).join(' '))
  r = await post(fakeStore(OFFER, true).store, ENQUIRY)
  console.error = realLog
  check('store failure -> 502', r.status === 502)
  check(
    'failure log has no PII',
    logged.length > 0 && logged.every((line) => !line.includes(ENQUIRY.email) && !line.includes('Layla')),
    logged.join(' | '),
  )

  const limited = fakeStore()
  const statuses: number[] = []
  for (let i = 0; i <= RATE_LIMIT.max; i++) statuses.push((await post(limited.store, ENQUIRY, { ip: '203.0.113.9' })).status)
  check(
    `rate limit: request ${RATE_LIMIT.max + 1} from one IP -> 429`,
    statuses.slice(0, -1).every((s) => s === 201) && statuses.at(-1) === 429,
    statuses.join(','),
  )

  const nodeRun = adapt(createHandler(fakeStore().store), 'offer-enquiry')
  const { res, out } = mockRes()
  const req = {
    method: 'POST',
    url: '/api/offer-enquiry',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.7' },
    body: ENQUIRY,
    on: () => undefined,
  }
  await nodeRun(req as never, res as never)
  check('Node signature: valid -> 201, response ended', out.ended && out.status === 201, out.body)
}
