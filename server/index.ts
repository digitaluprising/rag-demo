import { env } from './env.ts'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { checkOllamaHealth } from './lib/ollama.ts'
import { checkSupabaseHealth } from './lib/supabase.ts'
import { ingestRoutes } from './routes/ingest.ts'

/** API port; must match Vite dev proxy target in vite.config.ts */
const port = Number(process.env.PORT) || 8787

const app = new Hono()

app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
)

app.get('/api', (c) =>
  c.json({
    ok: true,
    service: 'rag-demo-api',
    embeddingModel: env.ollamaEmbeddingModel,
    chatModel: env.ollamaChatModel,
    embeddingDim: env.embeddingDim,
  }),
)

app.route('/api/ingest', ingestRoutes)

app.get('/api/health', async (c) => {
  const [ollama, supabase] = await Promise.all([checkOllamaHealth(), checkSupabaseHealth()])
  const ok = ollama.ok && supabase.ok
  return c.json(
    {
      ok,
      ollama: { ok: ollama.ok, error: ollama.error },
      supabase: { ok: supabase.ok, error: supabase.error },
    },
    ok ? 200 : 503,
  )
})

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.info(
      `[server] listening on http://localhost:${info.port} (embed=${env.ollamaEmbeddingModel}, chat=${env.ollamaChatModel})`,
    )
  },
)
