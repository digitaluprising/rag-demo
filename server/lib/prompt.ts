import type { OllamaChatMessage } from './ollama.ts'

export const RAG_SYSTEM_PROMPT =
  'You are a helpful assistant in a learning demo. Answer using only the provided context excerpts. If the context is insufficient, say so clearly and avoid inventing facts. Use concise, clear language.'

export type RagContextChunk = {
  chunk_id: string
  content: string
  chunk_index: number
  document_title: string | null
  document_filename: string | null
}

/** Build Ollama messages and a context string for the explainability panel. */
export function buildRagChatInput(
  userMessage: string,
  chunks: RagContextChunk[],
): { messages: OllamaChatMessage[]; contextPreview: string } {
  const blockParts = chunks.map((c, i) => {
    const label =
      c.document_title != null && c.document_title !== ''
        ? ` (${c.document_title})`
        : c.document_filename != null && c.document_filename !== ''
          ? ` (${c.document_filename})`
          : ''
    return `[${i + 1}]${label}\n${c.content}`
  })
  const contextBlock = blockParts.join('\n\n---\n\n')
  const contextPreview = contextBlock

  const userContent = `Context excerpts:\n\n${contextBlock}\n\n---\n\nQuestion:\n${userMessage}`

  return {
    messages: [
      { role: 'system', content: RAG_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    contextPreview,
  }
}
