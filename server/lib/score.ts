/**
 * Map pgvector cosine **distance** (`<=>`) to a stable similarity **score** in [0, 1].
 * Cosine distance is in [0, 2] for unit-length vectors (0 = identical, 2 = opposite).
 */
export function distanceToScore(distance: number): number {
  const d = Math.max(0, Math.min(2, distance))
  return 1 - d / 2
}
