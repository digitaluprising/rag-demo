export type IngestDocumentSummary = {
  id: string
  chunkCount: number
  title: string | null
  filename: string | null
  sourceType: 'paste' | 'txt' | 'markdown' | 'pdf'
}

export type IngestItemError = {
  filename: string
  message: string
}

export type IngestResponse = {
  documents: IngestDocumentSummary[]
  errors?: IngestItemError[]
}

export type RetrievedChunk = {
  chunk_id: string
  document_id: string
  content: string
  chunk_index: number
  document_title: string | null
  document_filename: string | null
}

export type ChatResponse = {
  answer: string
  retrieved_chunks: RetrievedChunk[]
  scores: number[]
  context_preview: string
}

export type ChatRequest = {
  message: string
  top_k?: number
  temperature?: number
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function baseUrl(): string {
  const raw = import.meta.env.VITE_API_URL?.trim()
  return raw ? raw.replace(/\/+$/, '') : ''
}

function apiUrl(path: string): string {
  const base = baseUrl()
  return base ? `${base}${path}` : path
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  try {
    return await res.json()
  } catch {
    return null
  }
}

function extractApiError(body: unknown): { message: string; code?: string } | null {
  if (typeof body !== 'object' || body === null) return null

  // { error: { code, message } } style
  if ('error' in body) {
    const err = (body as { error?: unknown }).error
    if (typeof err === 'object' && err !== null) {
      const message = (err as { message?: unknown }).message
      const code = (err as { code?: unknown }).code
      if (typeof message === 'string') {
        return { message, code: typeof code === 'string' ? code : undefined }
      }
    }
  }

  // { errors: [{ message }] } style
  if ('errors' in body) {
    const maybeErrors = (body as { errors?: unknown }).errors
    if (Array.isArray(maybeErrors) && maybeErrors.length > 0) {
      const first = maybeErrors[0] as { message?: unknown }
      if (typeof first?.message === 'string') {
        return { message: first.message }
      }
    }
  }

  return null
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), init)
  const body = await parseJsonSafe(response)
  if (!response.ok) {
    const parsed = extractApiError(body)
    throw new ApiError(
      parsed?.message ?? `Request failed (${response.status})`,
      response.status,
      parsed?.code,
    )
  }
  return body as T
}

export async function ingestText(input: {
  text: string
  title?: string
}): Promise<IngestResponse> {
  return requestJson<IngestResponse>('/api/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function ingestFiles(input: {
  files: File[]
  title?: string
}): Promise<IngestResponse> {
  const form = new FormData()
  if (input.title?.trim()) form.append('title', input.title.trim())
  for (const file of input.files) form.append('files', file)
  return requestJson<IngestResponse>('/api/ingest', {
    method: 'POST',
    body: form,
  })
}

export async function postChat(input: ChatRequest): Promise<ChatResponse> {
  return requestJson<ChatResponse>('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}
