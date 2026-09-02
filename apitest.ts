import handler from './api/test-drive'

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

  console.log(bad ? `\n${bad} FAILURES` : '\nboth invocation styles respond correctly')
  process.exit(bad ? 1 : 0)

}

main()
