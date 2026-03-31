import { type FormEvent, useState } from 'react'
import type { ChatMessage, ChatPhase } from './useChat.ts'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ui/conversation'
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message'
import { ShimmeringText } from '@/components/ui/shimmering-text'
import { Button } from '@/components/ui/button'
import { Body } from '@/components/typography'
import { ArrowUp } from 'lucide-react'
import reactLogo from '@/assets/react.svg'
import viteLogo from '@/assets/vite.svg'
export type ChatPanelProps = {
  messages: ChatMessage[]
  phase: ChatPhase
  error: string | null
  send: (raw: string) => Promise<void>
}

export function ChatPanel({ messages, phase, error, send }: ChatPanelProps) {
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
                description="Add some text in the Ingest panel, then ask a question here."
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
        className="shrink-0 border-t border-border p-3"
      >
        {error ? (
          <div className="mb-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-2">
            <Body as="div" color="muted" className="text-left text-xs">
              {error}
            </Body>
          </div>
        ) : null}
        <div className="flex items-end gap-2">
          <textarea
            className="min-h-[72px] flex-1 resize-y rounded-md border border-border bg-background px-3 py-2 text-sm"
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
          <Button
            type="submit"
            size="icon"
            disabled={busy || !draft.trim()}
            aria-label="Send message"
            title="Send message"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
