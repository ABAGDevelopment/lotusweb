/**
 * Lets one Web-style handler, (Request) => Response, run on both runtimes.
 * Vercel's Node runtime calls (req, res) and ignores a returned Response, so
 * a Web-only handler there never ends the response and the browser hangs.
 * The Vite dev bridge and apitest call the Web style directly.
 *
 * `_lib` is underscore-prefixed so Vercel does not deploy it as a function.
 * Same pattern as api/test-drive.ts, which predates this file.
 */

type WebHandler = (request: Request) => Promise<Response>

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

const BODY_READ_TIMEOUT_MS = 5_000

function isNodeResponse(value: unknown): value is NodeLikeResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as NodeLikeResponse).end === 'function' &&
    typeof (value as NodeLikeResponse).setHeader === 'function'
  )
}

/** Vercel already parses JSON bodies; otherwise read the stream, never forever. */
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

export function adapt(webHandler: WebHandler, name: string) {
  return async function handler(a: Request | NodeLikeRequest, b?: unknown): Promise<Response | void> {
    if (!isNodeResponse(b)) return webHandler(a as Request)

    const req = a as NodeLikeRequest
    const res = b
    try {
      const method = (req.method ?? 'POST').toUpperCase()
      const headers = new Headers()
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') headers.set(key, value)
        else if (Array.isArray(value)) headers.set(key, value.join(', '))
      }
      // The body may have been parsed and re-serialised; its length changed.
      headers.delete('content-length')
      const request = new Request(`https://local${req.url ?? `/api/${name}`}`, {
        method,
        headers,
        body: ['GET', 'HEAD'].includes(method) ? undefined : await readNodeBody(req),
      })
      const response = await webHandler(request)
      res.statusCode = response.status
      response.headers.forEach((value, key) => res.setHeader(key, value))
      res.end(await response.text())
    } catch (error) {
      // Always end the response. Log the error type only: never the body.
      console.error(`[${name}] handler failed:`, error instanceof Error ? error.name : 'unknown')
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Internal error' }))
    }
  }
}
