import { useId, useState } from 'react'
import type { ChatResponse } from '@/lib/api'
import { Body, Label } from '@/components/typography'

export type ExplainabilityPanelProps = {
  lastResponse: ChatResponse | null
}

function snippet(text: string, max = 200): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

export function ExplainabilityPanel({ lastResponse }: ExplainabilityPanelProps) {
  const detailsId = useId()
  const [previewOpen, setPreviewOpen] = useState(false)

  if (!lastResponse) {
    return (
      <div className="space-y-2">
        <Body color="muted" className="text-left text-sm">
          <span className="font-medium text-foreground">Nothing to show yet.</span> Ingest text or files
          in the first column, then ask a question in Chat. After each reply, retrieved passages,
          similarity scores, and the context block sent to the model appear here.
        </Body>
      </div>
    )
  }

  const { retrieved_chunks: chunks, scores, context_preview: contextPreview, answer } = lastResponse

  return (
    <div className="space-y-3">
      {chunks.length === 0 ? (
        <div className="space-y-2 rounded-md border border-border bg-muted/15 p-3">
          <Label as="div" className="text-left">
            No ranked passages
          </Label>
          <Body color="muted" className="text-left text-xs">
            The model still returned an answer below—either nothing was in the corpus yet, or nothing
            matched strongly enough. Try ingesting more text or rephrasing your question.
          </Body>
          <Body color="secondary" className="text-left text-xs italic">
            {snippet(answer, 240)}
          </Body>
        </div>
      ) : (
        <ul className="space-y-3">
          {chunks.map((chunk, i) => {
            const score = scores[i]
            const label =
              chunk.document_title?.trim() ||
              chunk.document_filename?.trim() ||
              'Untitled source'
            return (
              <li
                key={chunk.chunk_id}
                className="rounded-md border border-border bg-muted/20 p-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Label as="span" className="max-w-[min(100%,12rem)] truncate text-left">
                    {label}
                  </Label>
                  <span className="shrink-0 font-mono text-[0.7rem] text-muted-foreground">
                    {typeof score === 'number' ? score.toFixed(3) : '—'}
                  </span>
                </div>
                <Body as="div" color="muted" className="mt-2 text-left text-xs leading-relaxed">
                  {snippet(chunk.content, 320)}
                </Body>
              </li>
            )
          })}
        </ul>
      )}

      {contextPreview ? (
        <div className="rounded-md border border-border">
          <button
            type="button"
            id={`${detailsId}-summary`}
            aria-expanded={previewOpen}
            aria-controls={`${detailsId}-panel`}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium hover:bg-muted/30"
            onClick={() => setPreviewOpen((o) => !o)}
          >
            Context preview
            <span className="text-muted-foreground" aria-hidden>
              {previewOpen ? '−' : '+'}
            </span>
          </button>
          {previewOpen ? (
            <div id={`${detailsId}-panel`} className="border-t border-border px-3 py-2">
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
                {contextPreview}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
