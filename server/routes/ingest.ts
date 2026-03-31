import { bodyLimit } from 'hono/body-limit'
import { Hono } from 'hono'
import { env } from '../env.ts'
import { chunkText, DEFAULT_CHUNK_OVERLAP, DEFAULT_CHUNK_SIZE } from '../lib/chunk.ts'
import { embed } from '../lib/ollama.ts'
import { pdfBufferToText, PdfTooLargeError } from '../lib/pdf.ts'
import { supabaseAdmin } from '../lib/supabase.ts'
import type { IngestDocumentSummary, IngestItemError, IngestResponse } from '../types/api.ts'

const MAX_BODY_BYTES = 11 * 1024 * 1024

function normalizeText(input: string): string {
  return input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
}

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  return String(e)
}

function extensionSourceType(
  name: string,
): 'txt' | 'markdown' | 'pdf' | null {
  const lower = name.toLowerCase()
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'markdown'
  if (lower.endsWith('.txt')) return 'txt'
  return null
}

function collectFiles(form: Record<string, unknown>): File[] {
  const out: File[] = []
  for (const v of Object.values(form)) {
    if (v instanceof File) out.push(v)
    else if (Array.isArray(v)) {
      for (const x of v) {
        if (x instanceof File) out.push(x)
      }
    }
  }
  return out
}

async function ingestPlainText(params: {
  text: string
  title: string | null
  filename: string | null
  sourceType: 'paste' | 'txt' | 'markdown' | 'pdf'
}): Promise<{ id: string; chunkCount: number }> {
  const normalized = normalizeText(params.text)
  if (!normalized) {
    throw new Error('No text content after normalization')
  }

  const chunkSize = env.chunkSize ?? DEFAULT_CHUNK_SIZE
  const overlap = env.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP
  const pieces = chunkText(normalized, { chunkSize, overlap })
  if (pieces.length === 0) {
    throw new Error('No chunks produced from text')
  }

  const { data: doc, error: docErr } = await supabaseAdmin
    .from('documents')
    .insert({
      title: params.title,
      filename: params.filename,
      source_type: params.sourceType,
      metadata: {},
    })
    .select('id')
    .single()

  if (docErr || !doc) {
    throw new Error(docErr?.message ?? 'Failed to insert document')
  }

  const docId = doc.id as string
  const chunkRows: {
    document_id: string
    content: string
    chunk_index: number
    embedding: number[]
  }[] = []

  for (let i = 0; i < pieces.length; i++) {
    const vec = await embed(pieces[i])
    if (vec.length !== env.embeddingDim) {
      await supabaseAdmin.from('documents').delete().eq('id', docId)
      throw new Error(
        `Embedding dimension mismatch: expected ${env.embeddingDim}, got ${vec.length}`,
      )
    }
    chunkRows.push({
      document_id: docId,
      content: pieces[i],
      chunk_index: i,
      embedding: vec,
    })
  }

  const { error: chunkErr } = await supabaseAdmin.from('chunks').insert(chunkRows)
  if (chunkErr) {
    await supabaseAdmin.from('documents').delete().eq('id', docId)
    throw new Error(chunkErr.message)
  }

  return { id: docId, chunkCount: pieces.length }
}

export const ingestRoutes = new Hono()

ingestRoutes.post(
  '/',
  bodyLimit({
    maxSize: MAX_BODY_BYTES,
    onError: (c) => c.json({ documents: [], errors: [{ filename: '', message: 'Request body too large' }] }, 413),
  }),
  async (c) => {
    const documents: IngestDocumentSummary[] = []
    const errors: IngestItemError[] = []
    const contentType = c.req.header('content-type') ?? ''

    if (contentType.includes('application/json')) {
      let body: unknown
      try {
        body = await c.req.json()
      } catch {
        return c.json({ documents: [], errors: [{ filename: '', message: 'Invalid JSON' }] }, 400)
      }
      const rec = body as { text?: unknown; title?: unknown }
      const text = typeof rec.text === 'string' ? rec.text : ''
      const title = typeof rec.title === 'string' ? rec.title : null
      if (!text.trim()) {
        return c.json(
          { documents: [], errors: [{ filename: '', message: 'Missing or empty "text"' }] },
          400,
        )
      }
      try {
        const result = await ingestPlainText({
          text,
          title,
          filename: null,
          sourceType: 'paste',
        })
        documents.push({
          id: result.id,
          chunkCount: result.chunkCount,
          title,
          filename: null,
          sourceType: 'paste',
        })
      } catch (e) {
        return c.json(
          { documents: [], errors: [{ filename: '', message: errMessage(e) }] },
          500,
        )
      }
      const res: IngestResponse = { documents }
      return c.json(res, 200)
    }

    if (contentType.includes('multipart/form-data')) {
      let form: Record<string, unknown>
      try {
        form = (await c.req.parseBody({ all: true })) as Record<string, unknown>
      } catch (e) {
        return c.json(
          { documents: [], errors: [{ filename: '', message: errMessage(e) }] },
          400,
        )
      }
      const titleField = form['title']
      const defaultTitle = typeof titleField === 'string' ? titleField : null
      const files = collectFiles(form)
      if (files.length === 0) {
        return c.json(
          { documents: [], errors: [{ filename: '', message: 'No file field found' }] },
          400,
        )
      }

      for (const file of files) {
        const name = file.name || 'upload'
        try {
          const st = extensionSourceType(name)
          if (!st) {
            errors.push({
              filename: name,
              message: 'Unsupported file type (use .txt, .md, or .pdf)',
            })
            continue
          }
          let text: string
          if (st === 'pdf') {
            const buf = Buffer.from(await file.arrayBuffer())
            text = await pdfBufferToText(buf)
          } else {
            text = await file.text()
          }
          const displayTitle = defaultTitle ?? name
          const result = await ingestPlainText({
            text,
            title: displayTitle,
            filename: name,
            sourceType: st,
          })
          documents.push({
            id: result.id,
            chunkCount: result.chunkCount,
            title: displayTitle,
            filename: name,
            sourceType: st,
          })
        } catch (e) {
          const msg =
            e instanceof PdfTooLargeError
              ? `PDF too large (max ${e.maxBytes} bytes)`
              : errMessage(e)
          errors.push({ filename: name, message: msg })
        }
      }

      const res: IngestResponse = {
        documents,
        errors: errors.length > 0 ? errors : undefined,
      }
      if (documents.length === 0 && errors.length > 0) {
        return c.json(res, 400)
      }
      return c.json(res, 200)
    }

    return c.json(
      { documents: [], errors: [{ filename: '', message: 'Unsupported Content-Type' }] },
      415,
    )
  },
)
