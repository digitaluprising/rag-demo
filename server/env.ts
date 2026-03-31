import { config } from 'dotenv'

config()

function requireEnv(name: string): string {
  const raw = process.env[name]
  if (raw === undefined || String(raw).trim() === '') {
    throw new Error(
      `[env] Missing required environment variable: ${name}. Copy .env.example to .env and set it.`,
    )
  }
  return String(raw).trim()
}

function optionalInt(name: string): number | undefined {
  const raw = process.env[name]?.trim()
  if (raw === undefined || raw === '') return undefined
  const n = Number(raw)
  if (!Number.isFinite(n)) {
    throw new Error(`[env] ${name} must be a number, got: ${raw}`)
  }
  return Math.trunc(n)
}

const supabaseUrl = requireEnv('SUPABASE_URL')
try {
  // Fail fast on typo'd URL in dev
  new URL(supabaseUrl)
} catch {
  throw new Error('[env] SUPABASE_URL must be a valid absolute URL')
}

export const env = {
  supabaseUrl,
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  ollamaHost: process.env.OLLAMA_HOST?.trim() || 'http://127.0.0.1:11434',
  ollamaEmbeddingModel: process.env.OLLAMA_EMBEDDING_MODEL?.trim() || 'nomic-embed-text',
  ollamaChatModel: process.env.OLLAMA_CHAT_MODEL?.trim() || 'llama3.2',
  embeddingDim: optionalInt('EMBEDDING_DIM') ?? 768,
  chunkSize: optionalInt('CHUNK_SIZE'),
  chunkOverlap: optionalInt('CHUNK_OVERLAP'),
}
