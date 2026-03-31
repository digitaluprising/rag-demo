import { describe, expect, it } from 'vitest'
import { buildRagChatInput, RAG_SYSTEM_PROMPT } from './prompt.ts'

describe('buildRagChatInput', () => {
  it('builds system + user messages and a context preview', () => {
    const { messages, contextPreview } = buildRagChatInput('What is RAG?', [
      {
        chunk_id: 'a',
        content: 'RAG combines retrieval with generation.',
        chunk_index: 0,
        document_title: 'Notes',
        document_filename: null,
      },
    ])
    expect(messages).toHaveLength(2)
    expect(messages[0].role).toBe('system')
    expect(messages[0].content).toBe(RAG_SYSTEM_PROMPT)
    expect(messages[1].role).toBe('user')
    expect(messages[1].content).toContain('Context excerpts:')
    expect(messages[1].content).toContain('What is RAG?')
    expect(messages[1].content).toContain('[1] (Notes)')
    expect(contextPreview).toContain('[1] (Notes)')
    expect(contextPreview).toContain('RAG combines')
  })

  it('uses filename when title is empty', () => {
    const { messages } = buildRagChatInput('Q', [
      {
        chunk_id: 'b',
        content: 'body',
        chunk_index: 0,
        document_title: '',
        document_filename: 'doc.txt',
      },
    ])
    expect(messages[1].content).toContain('[1] (doc.txt)')
  })
})
