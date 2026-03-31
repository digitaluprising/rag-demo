import { PDFParse } from 'pdf-parse'

/** Maximum PDF file size accepted for MVP (bytes). */
export const DEFAULT_PDF_MAX_BYTES = 10 * 1024 * 1024

/** Maximum number of pages to extract text from (first N pages). */
export const DEFAULT_PDF_MAX_PAGES = 50

export class PdfTooLargeError extends Error {
  override readonly name = 'PdfTooLargeError'
  readonly maxBytes: number

  constructor(maxBytes: number) {
    super(`PDF exceeds maximum size (${maxBytes} bytes)`)
    this.maxBytes = maxBytes
  }
}

export type PdfBufferToTextOptions = {
  maxBytes?: number
  maxPages?: number
}

/**
 * Extract plain text from a PDF buffer. Enforces size and page limits before parsing.
 */
export async function pdfBufferToText(
  buffer: Buffer,
  options?: PdfBufferToTextOptions,
): Promise<string> {
  const maxBytes = options?.maxBytes ?? DEFAULT_PDF_MAX_BYTES
  const maxPages = options?.maxPages ?? DEFAULT_PDF_MAX_PAGES

  if (buffer.length > maxBytes) {
    throw new PdfTooLargeError(maxBytes)
  }

  const data = new Uint8Array(buffer)
  const parser = new PDFParse({ data })

  try {
    const result = await parser.getText({ first: maxPages })
    return result.text.trim()
  } finally {
    await parser.destroy()
  }
}
