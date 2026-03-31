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
