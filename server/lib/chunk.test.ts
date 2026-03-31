import { describe, expect, it } from 'vitest'
import {
  chunkText,
  DEFAULT_CHUNK_OVERLAP,
  DEFAULT_CHUNK_SIZE,
} from './chunk.ts'

describe('chunkText', () => {
  it('returns [] for empty or whitespace-only input', () => {
    expect(chunkText('')).toEqual([])
    expect(chunkText('   \n\t  ')).toEqual([])
  })

  it('returns a single chunk when text fits in one window', () => {
    expect(chunkText('hello', { chunkSize: 10, overlap: 2 })).toEqual(['hello'])
  })

  it('splits longer text into multiple chunks with configured size', () => {
    const text = 'abcdefghij'
    const chunks = chunkText(text, { chunkSize: 4, overlap: 0 })
    expect(chunks).toEqual(['abcd', 'efgh', 'ij'])
  })

  it('applies overlap so adjacent chunks share a suffix/prefix region', () => {
    const text = 'abcdefghij'
    const chunks = chunkText(text, { chunkSize: 4, overlap: 2 })
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks[0]).toBe('abcd')
    expect(chunks[1]).toBe('cdef')
    expect(chunks[2]).toBe('efgh')
    expect(chunks[3]).toBe('ghij')
  })

  it('uses default constants when options omitted', () => {
    const pad = 'x'.repeat(DEFAULT_CHUNK_SIZE + 50)
    const chunks = chunkText(pad)
    expect(chunks.length).toBeGreaterThanOrEqual(2)
    expect(chunks[0].length).toBe(DEFAULT_CHUNK_SIZE)
    expect(chunks[1].length).toBeGreaterThan(0)
    expect(chunks[1].slice(0, DEFAULT_CHUNK_OVERLAP)).toBe(
      chunks[0].slice(-DEFAULT_CHUNK_OVERLAP),
    )
  })

  it('throws when overlap is invalid', () => {
    expect(() => chunkText('a', { chunkSize: 4, overlap: 4 })).toThrow(/overlap/)
    expect(() => chunkText('a', { chunkSize: 4, overlap: -1 })).toThrow(/overlap/)
  })

  it('throws when chunkSize is invalid', () => {
    expect(() => chunkText('a', { chunkSize: 0, overlap: 0 })).toThrow(/chunkSize/)
  })
})
