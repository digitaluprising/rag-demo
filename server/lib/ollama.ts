import { env } from '../env.ts'

export type OllamaChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class OllamaHttpError extends Error {
  override readonly name = 'OllamaHttpError'
  readonly status: number
  readonly responseBody?: string

  constructor(message: string, status: number, responseBody?: string) {
    super(message)
    this.status = status
    this.responseBody = responseBody
  }
}

const TAGS_TIMEOUT_MS = 8_000
const EMBED_TIMEOUT_MS = 120_000
const CHAT_TIMEOUT_MS = 180_000

function ollamaBaseUrl(): string {
  return env.ollamaHost.replace(/\/+$/, '')
}

/** Read body once. Truncate only for error excerpts (success bodies can be large — e.g. embedding vectors). */
async function readResponseText(
  res: Response,
  truncateForLog: boolean,
): Promise<string | undefined> {
  try {
    const text = await res.text()
    return truncateForLog ? text.slice(0, 2_000) : text
  } catch {
    return undefined
  }
}

/** True if the Ollama daemon responds to `/api/tags`. */
export async function checkOllamaHealth(): Promise<{ ok: boolean; error?: string }> {
  const url = `${ollamaBaseUrl()}/api/tags`
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(TAGS_TIMEOUT_MS),
    })
    if (!res.ok) {
      const body = await readResponseText(res, true)
      return { ok: false, error: `HTTP ${res.status}${body ? `: ${body}` : ''}` }
    }
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: msg }
  }
}

/** POST `/api/embeddings` — returns the embedding vector for one input string. */
export async function embed(text: string): Promise<number[]> {
  const url = `${ollamaBaseUrl()}/api/embeddings`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.ollamaEmbeddingModel,
      prompt: text,
    }),
    signal: AbortSignal.timeout(EMBED_TIMEOUT_MS),
  })

  const raw = await readResponseText(res, !res.ok)
  if (!res.ok) {
    throw new OllamaHttpError(
      `Ollama embeddings failed (${res.status})`,
      res.status,
      raw,
    )
  }

  let data: unknown
  try {
    data = JSON.parse(raw ?? '{}')
  } catch {
    throw new OllamaHttpError('Ollama embeddings: invalid JSON body', res.status, raw)
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    'embedding' in data &&
    Array.isArray((data as { embedding: unknown }).embedding)
  ) {
    return (data as { embedding: number[] }).embedding
  }

  throw new OllamaHttpError('Ollama embeddings: missing embedding array in response', res.status, raw)
}

/** POST `/api/chat` with `stream: false` — full assistant text in one response. */
export async function chat(
  messages: OllamaChatMessage[],
  options?: { temperature?: number },
): Promise<string> {
  const url = `${ollamaBaseUrl()}/api/chat`
  const body: Record<string, unknown> = {
    model: env.ollamaChatModel,
    messages,
    stream: false,
  }
  if (options?.temperature !== undefined) {
    body.options = { temperature: options.temperature }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
  })

  const raw = await readResponseText(res, !res.ok)
  if (!res.ok) {
    throw new OllamaHttpError(`Ollama chat failed (${res.status})`, res.status, raw)
  }

  let data: unknown
  try {
    data = JSON.parse(raw ?? '{}')
  } catch {
    throw new OllamaHttpError('Ollama chat: invalid JSON body', res.status, raw)
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as { message?: { content?: unknown } }).message?.content === 'string'
  ) {
    return (data as { message: { content: string } }).message.content
  }

  throw new OllamaHttpError('Ollama chat: missing message.content in response', res.status, raw)
}
