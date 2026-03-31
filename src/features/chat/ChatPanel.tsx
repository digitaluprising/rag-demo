import { type FormEvent, useState } from 'react'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ui/conversation'
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message'
import { ShimmeringText } from '@/components/ui/shimmering-text'
import { Button } from '@/components/ui/button'
import { Body, Label } from '@/components/typography'
import reactLogo from '@/assets/react.svg'
import viteLogo from '@/assets/vite.svg'
import { useChat } from './useChat.ts'

export function ChatPanel() {
  const { messages, phase, error, send } = useChat()
  const [draft, setDraft] = useState('')
  const busy = phase !== 'idle'

  function handleSend() {
    const text = draft.trim()
    if (!text || busy) return
    void send(text)
    setDraft('')
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="px-4 py-4">
          <div className="mx-auto max-w-2xl space-y-1">
            {messages.length === 0 && !busy ? (
              <ConversationEmptyState
                title="No messages yet"
                description="Ingest documents, then ask a grounded question."
              />
            ) : null}

            {messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageAvatar
                  name={m.role === 'user' ? 'You' : 'AI'}
                  src={m.role === 'user' ? reactLogo : viteLogo}
                />
                <MessageContent>{m.content}</MessageContent>
              </Message>
            ))}

            {busy ? (
              <Message from="assistant">
                <MessageAvatar name="AI" src={viteLogo} />
                <MessageContent>
                  <ShimmeringText
                    className="text-sm"
                    duration={2.5}
                    text={phase === 'retrieving' ? 'Retrieving sources…' : 'Generating answer…'}
                  />
                </MessageContent>
              </Message>
            ) : null}
          </div>
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 border-t border-border p-3"
      >
        {error ? (
          <div className="mb-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-2">
            <Body as="div" color="muted" className="text-left text-xs">
              {error}
            </Body>
          </div>
        ) : null}
        <Label as="div" className="mb-1 block text-left">
          Message
        </Label>
        <textarea
          className="mb-2 min-h-[72px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Ask a question about your ingested documents…"
          value={draft}
          disabled={busy}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <Button type="submit" className="w-full" disabled={busy || !draft.trim()}>
          {busy ? 'Working…' : 'Send'}
        </Button>
      </form>
    </div>
  )
}
