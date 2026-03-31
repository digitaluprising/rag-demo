import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetText = vi.fn()
const mockDestroy = vi.fn()

vi.mock('pdf-parse', () => ({
  PDFParse: class {
    constructor() {}
    async getText(params?: unknown) {
      return mockGetText(params)
    }
    async destroy() {
      return mockDestroy()
    }
  },
}))

import { DEFAULT_PDF_MAX_BYTES, pdfBufferToText, PdfTooLargeError } from './pdf.ts'

describe('pdfBufferToText', () => {
  beforeEach(() => {
    mockGetText.mockReset()
    mockDestroy.mockReset()
    mockGetText.mockResolvedValue({
      text: '  Hello PDF\n',
      pages: [],
      total: 1,
    })
    mockDestroy.mockResolvedValue(undefined)
  })

  it('throws PdfTooLargeError when buffer exceeds maxBytes', async () => {
    const buf = Buffer.alloc(DEFAULT_PDF_MAX_BYTES + 1)
    await expect(pdfBufferToText(buf, { maxBytes: DEFAULT_PDF_MAX_BYTES })).rejects.toThrow(
      PdfTooLargeError,
    )
    expect(mockGetText).not.toHaveBeenCalled()
  })

  it('calls getText with first N pages and returns trimmed text', async () => {
    const buf = Buffer.from('%PDF-1.4 minimal')
    const text = await pdfBufferToText(buf, { maxBytes: 100_000, maxPages: 25 })
    expect(text).toBe('Hello PDF')
    expect(mockGetText).toHaveBeenCalledWith({ first: 25 })
    expect(mockDestroy).toHaveBeenCalled()
  })
})
