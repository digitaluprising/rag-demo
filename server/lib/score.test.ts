import { describe, expect, it } from 'vitest'
import { distanceToScore } from './score.ts'

describe('distanceToScore', () => {
  it('maps 0 to 1 (best match)', () => {
    expect(distanceToScore(0)).toBe(1)
  })

  it('maps 2 to 0 (worst match)', () => {
    expect(distanceToScore(2)).toBe(0)
  })

  it('maps 1 to 0.5', () => {
    expect(distanceToScore(1)).toBe(0.5)
  })

  it('clamps out-of-range values into [0, 2] before scoring', () => {
    expect(distanceToScore(-1)).toBe(1)
    expect(distanceToScore(3)).toBe(0)
  })
})
