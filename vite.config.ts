import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

/**
 * Client environment variables carry no VITE_ prefix.
 *
 * Vite normally exposes only VITE_-prefixed variables to client code, as a
 * guard against bundling secrets. Dropping the prefix opts out of that guard,
 * so each variable is listed explicitly below rather than whitelisting a
 * prefix. Anything absent from this list — SANITY_WRITE_TOKEN above all —
 * cannot reach the browser bundle, which is the point.
 *
 * Do NOT switch this to `envPrefix: ['SANITY_']`: that would inline
 * SANITY_WRITE_TOKEN into public JavaScript, handing every visitor write
 * access to the dataset.
 */
const CLIENT_ENV_VARS = [
  'SANITY_PROJECT_ID',
  'SANITY_DATASET',
  'SANITY_API_VERSION',
  'SANITY_USE_CDN',
  'ENQUIRY_ENDPOINT',
] as const

export default defineConfig(({ mode }) => {
  // '' loads every key from .env files; process.env covers Vercel/CI, which
  // inject variables into the environment rather than into a file.
  const fileEnv = loadEnv(mode, process.cwd(), '')
  const resolved = { ...fileEnv, ...process.env }

  const define = Object.fromEntries(
    CLIENT_ENV_VARS.map((key) => [
      `import.meta.env.${key}`,
      JSON.stringify(resolved[key] ?? ''),
    ]),
  )

  return {
    base: process.env.BASE_PATH || '/',
    plugins: [react()],
    define,
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    server: { host: true, port: 5173 },
    preview: { port: 4173 },
    build: { outDir: 'dist', sourcemap: false },
  }
})