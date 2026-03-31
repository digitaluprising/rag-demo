import { describe, expect, it } from 'vitest'
import { sanitizeForPostgresText } from './text.ts'

describe('sanitizeForPostgresText', () => {
  it('removes NUL bytes', () => {
    expect(sanitizeForPostgresText('a\u0000b')).toBe('ab')
  })

  it('replaces lone surrogate with replacement char', () => {
    const loneHigh = '\uD800'
    expect(sanitizeForPostgresText(`x${loneHigh}y`)).toBe('x\uFFFDy')
  })

  it('preserves valid surrogate pairs', () => {
    const s = '\uD83D\uDE00'
    expect(sanitizeForPostgresText(s)).toBe(s)
  })
})
