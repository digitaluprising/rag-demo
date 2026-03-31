/** Default chunk length (characters). */
export const DEFAULT_CHUNK_SIZE = 800

/** Overlap between consecutive chunks (characters). */
export const DEFAULT_CHUNK_OVERLAP = 100

function assertChunkParams(chunkSize: number, overlap: number): void {
  if (!Number.isFinite(chunkSize) || chunkSize < 1) {
    throw new Error('chunkSize must be a finite number >= 1')
  }
  if (!Number.isFinite(overlap) || overlap < 0 || overlap >= chunkSize) {
    throw new Error('overlap must be a finite number >= 0 and strictly less than chunkSize')
  }
}

/** Sliding-window chunks; trims input first. Optional `options` override defaults (e.g. tests). */
export function chunkText(
  input: string,
  options?: { chunkSize?: number; overlap?: number },
): string[] {
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE
  const overlap = options?.overlap ?? DEFAULT_CHUNK_OVERLAP
  assertChunkParams(chunkSize, overlap)

  const text = input.trim()
  if (text.length === 0) return []

  const step = chunkSize - overlap
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const piece = text.slice(start, end)
    if (piece.length > 0) chunks.push(piece)
    if (end >= text.length) break
    start += step
  }

  return chunks
}
