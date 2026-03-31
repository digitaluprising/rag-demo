import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Body, Label } from '@/components/typography'
import { ingestFiles, ingestText, type IngestResponse } from '@/lib/api'

const ACCEPTED_FILES = '.txt,.md,.markdown,.pdf'

export function IngestPanel() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<IngestResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hasInput = useMemo(() => text.trim().length > 0 || files.length > 0, [text, files.length])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasInput || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const res =
        files.length > 0
          ? await ingestFiles({ title, files })
          : await ingestText({ title, text })
      setResult(res)
      if (res.documents.length > 0) {
        setText('')
        setFiles([])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsSubmitting(false)
    }
  }

  const [showTitle, setShowTitle] = useState(false)

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {showTitle ? (
        <div className="space-y-2">
          <label htmlFor="ingest-title" className="block text-left">
            <Label as="span">Title</Label>
          </label>
          <input
            id="ingest-title"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="e.g. Product notes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      ) : (
        <button
          type="button"
          className="text-left text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => setShowTitle(true)}
        >
          + Add title
        </button>
      )}

      <div className="space-y-2">
        <label htmlFor="ingest-text" className="block text-left">
          <Label as="span">Paste text</Label>
        </label>
        <textarea
          id="ingest-text"
          className="h-40 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Paste notes, docs, or excerpts to ingest..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="ingest-files" className="block text-left">
          <Label as="span">Upload files (.txt, .md, .pdf)</Label>
        </label>
        <input
          id="ingest-files"
          type="file"
          accept={ACCEPTED_FILES}
          multiple
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length > 0 ? (
          <Body as="div" color="muted" className="text-left text-xs">
            Selected: {files.map((f) => f.name).join(', ')}
          </Body>
        ) : null}
      </div>

      <Button type="submit" disabled={!hasInput || isSubmitting} className="w-full">
        {isSubmitting ? 'Ingesting…' : 'Ingest'}
      </Button>

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2">
          <Body as="div" color="danger" className="text-left text-sm">
            {error}
          </Body>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-2 rounded-md border border-border bg-muted/20 px-3 py-3">
          <Body as="div" color="primary" className="text-left text-sm">
            Ingested {result.documents.length} document
            {result.documents.length === 1 ? '' : 's'}.
          </Body>
          {result.documents.map((doc) => (
            <Body key={doc.id} as="div" color="muted" className="text-left text-xs">
              {doc.filename ?? doc.title ?? 'untitled'} - {doc.chunkCount} chunks
            </Body>
          ))}
          {result.errors?.length ? (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-2">
              {result.errors.map((entry, i) => (
                <Body key={`${entry.filename}-${i}`} as="div" color="muted" className="text-left text-xs">
                  {entry.filename || 'request'}: {entry.message}
                </Body>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}

