import { bodyLimit } from 'hono/body-limit'
import { Hono } from 'hono'
import { env } from '../env.ts'
import { embed, chat as ollamaChat, OllamaHttpError } from '../lib/ollama.ts'
import { buildRagChatInput } from '../lib/prompt.ts'
import { distanceToScore } from '../lib/score.ts'
import { supabaseAdmin } from '../lib/supabase.ts'
import type { ApiErrorBody, ChatResponse, RetrievedChunk } from '../types/api.ts'

const MAX_BODY_BYTES = 256 * 1024
const DEFAULT_TOP_K = 5
const MAX_TOP_K = 30

function jsonError(c: { json: (b: unknown, s: number) => Response }, code: string, message: string, status: number) {
  const body: ApiErrorBody = { error: { code, message } }
  return c.json(body, status)
}

type MatchChunkRow = {
  chunk_id: string
  document_id: string
  content: string
  chunk_index: number
  distance: number
  document_title: string | null
  document_filename: string | null
}

export const chatRoutes = new Hono()

chatRoutes.post(
  '/',
  bodyLimit({
    maxSize: MAX_BODY_BYTES,
    onError: (c) => jsonError(c, 'PAYLOAD_TOO_LARGE', 'Request body too large', 413),
  }),
  async (c) => {
    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return jsonError(c, 'BAD_JSON', 'Invalid JSON body', 400)
    }

    const rec = body as { message?: unknown; top_k?: unknown; temperature?: unknown }
    if (typeof rec.message !== 'string' || rec.message.trim() === '') {
      return jsonError(c, 'VALIDATION', 'Missing or empty "message"', 400)
    }

    let topK = DEFAULT_TOP_K
    if (rec.top_k !== undefined && rec.top_k !== null) {
      const n = Number(rec.top_k)
      if (!Number.isFinite(n) || n < 1) {
        return jsonError(c, 'VALIDATION', '"top_k" must be a number >= 1', 400)
      }
      topK = Math.min(Math.trunc(n), MAX_TOP_K)
    }

    let temperature: number | undefined
    if (rec.temperature !== undefined && rec.temperature !== null) {
      const t = Number(rec.temperature)
      if (!Number.isFinite(t) || t < 0 || t > 2) {
        return jsonError(c, 'VALIDATION', '"temperature" must be between 0 and 2', 400)
      }
      temperature = t
    }

    const userMessage = rec.message.trim()

    const { count: chunkCount, error: countErr } = await supabaseAdmin
      .from('chunks')
      .select('*', { count: 'exact', head: true })

    if (countErr) {
      return jsonError(c, 'DATABASE', 'Could not read chunk index', 503)
    }

    if (chunkCount === 0) {
      const res: ChatResponse = {
        answer:
          'There are no ingested documents yet. Add text or files via ingest, then ask again.',
        retrieved_chunks: [],
        scores: [],
        context_preview: '',
      }
      return c.json(res, 200)
    }

    let queryEmbedding: number[]
    try {
      queryEmbedding = await embed(userMessage)
    } catch (e) {
      if (e instanceof OllamaHttpError) {
        return jsonError(c, 'OLLAMA', e.message, 502)
      }
      return jsonError(c, 'EMBED', errMessage(e), 500)
    }

    if (queryEmbedding.length !== env.embeddingDim) {
      return jsonError(
        c,
        'EMBED_DIM',
        `Embedding dimension mismatch: expected ${env.embeddingDim}, got ${queryEmbedding.length}`,
        502,
      )
    }

    const { data: rows, error: rpcErr } = await supabaseAdmin.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      match_count: topK,
    })

    if (rpcErr) {
      return jsonError(c, 'DATABASE', rpcErr.message, 503)
    }

    const matched = (rows ?? []) as MatchChunkRow[]

    if (matched.length === 0) {
      const res: ChatResponse = {
        answer:
          'No matching passages were found in the corpus. Try rephrasing or ingesting more relevant documents.',
        retrieved_chunks: [],
        scores: [],
        context_preview: '',
      }
      return c.json(res, 200)
    }

    const retrieved: RetrievedChunk[] = matched.map((r) => ({
      chunk_id: r.chunk_id,
      document_id: r.document_id,
      content: r.content,
      chunk_index: r.chunk_index,
      document_title: r.document_title,
      document_filename: r.document_filename,
    }))

    const scores = matched.map((r) => distanceToScore(Number(r.distance)))

    const ragChunks = matched.map((r) => ({
      chunk_id: r.chunk_id,
      content: r.content,
      chunk_index: r.chunk_index,
      document_title: r.document_title,
      document_filename: r.document_filename,
    }))

    const { messages, contextPreview } = buildRagChatInput(userMessage, ragChunks)

    let answer: string
    try {
      answer = await ollamaChat(messages, temperature !== undefined ? { temperature } : undefined)
    } catch (e) {
      if (e instanceof OllamaHttpError) {
        return jsonError(c, 'OLLAMA', e.message, 502)
      }
      return jsonError(c, 'CHAT', errMessage(e), 500)
    }

    const res: ChatResponse = {
      answer: answer.trim(),
      retrieved_chunks: retrieved,
      scores,
      context_preview: contextPreview,
    }
    return c.json(res, 200)
  },
)

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  return String(e)
}
