import type { Plugin, ViteDevServer } from 'vite'

/**
 * Serves `apps/web/api/*.ts` during `npm run dev`.
 *
 * Vite's dev server does not run serverless functions, so without this the
 * form POSTs to /api/test-drive and gets Vite's HTML fallback — a confusing
 * "Unexpected token '<'" instead of a saved enquiry. In production Vercel
 * serves the same file; this only fills the local gap, and loads the very
 * same module so the two cannot diverge.
 */
export function devApiPlugin(): Plugin {
  return {
    name: 'lotus-dev-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const route = req.url.split('?')[0].replace(/\/$/, '')
        const modulePath = `.${route}.ts`

        try {
          const mod = await server.ssrLoadModule(modulePath)
          const handler = mod.default as (r: Request) => Promise<Response>
          if (typeof handler !== 'function') return next()

          const body = await new Promise<string>((resolve, reject) => {
            const chunks: Buffer[] = []
            req.on('data', (c) => chunks.push(c as Buffer))
            req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
            req.on('error', reject)
          })

          const request = new Request(`http://localhost${req.url}`, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: ['GET', 'HEAD'].includes(req.method ?? '') ? undefined : body,
          })

          const response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(await response.text())
        } catch (error) {
          // Surface the real cause instead of falling through to the SPA,
          // which would return HTML and produce a misleading parse error.
          console.error(`[dev-api] ${route} failed:`, error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
              hint: 'Set SANITY_PROJECT_ID, SANITY_DATASET and SANITY_WRITE_TOKEN in apps/web/.env',
            }),
          )
        }
      })
    },
  }
}
