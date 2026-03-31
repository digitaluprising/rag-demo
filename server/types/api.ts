/** Response body for `POST /api/ingest`. */
export type IngestResponse = {
  documents: IngestDocumentSummary[]
  /** Present when one or more inputs failed (e.g. multipart batch). */
  errors?: IngestItemError[]
}

export type IngestDocumentSummary = {
  id: string
  chunkCount: number
  title: string | null
  filename: string | null
  sourceType: 'paste' | 'txt' | 'markdown' | 'pdf'
}

export type IngestItemError = {
  /** Empty when the failed item was JSON body rather than a file. */
  filename: string
  message: string
}

/** `POST /api/chat` request body. */
export type ChatRequest = {
  message: string
  top_k?: number
  temperature?: number
}

/** One retrieved passage for the UI / explainability panel. */
export type RetrievedChunk = {
  chunk_id: string
  document_id: string
  content: string
  chunk_index: number
  document_title: string | null
  document_filename: string | null
}

/** `POST /api/chat` success body. */
export type ChatResponse = {
  answer: string
  retrieved_chunks: RetrievedChunk[]
  /** Similarity scores in [0, 1], aligned with `retrieved_chunks` (higher is better). */
  scores: number[]
  /** Concatenated context block shown in the explainability panel. */
  context_preview: string
}

/** Structured error for failed API calls. */
export type ApiErrorBody = {
  error: {
    code: string
    message: string
  }
}
