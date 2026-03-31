import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ui/conversation'
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message'
import { ShimmeringText } from '@/components/ui/shimmering-text'
import { Body, Headline, Label } from '@/components/typography'
import { IngestPanel } from '@/features/ingest/IngestPanel'

import './App.css'

function App() {
  return (
    <div className="app-root">
      <div className="app-shell">
        <section className="app-panel app-ingest" aria-label="Ingest">
          <div className="app-panel-header">
            <Headline as="h2" className="m-0 text-left">
              Ingest
            </Headline>
            <Label className="mt-1 block text-left">Paste text or upload files</Label>
          </div>
          <div className="app-panel-body">
            <IngestPanel />
          </div>
        </section>

        <section className="app-panel app-chat" aria-label="Chat">
          <div className="app-panel-header">
            <Headline as="h2" className="m-0 text-left">
              Chat
            </Headline>
            <Label className="mt-1 block text-left">
              Static demo — scroll inside this column only
            </Label>
          </div>
          <div className="app-chat-body">
            <Conversation className="min-h-0 flex-1">
              <ConversationContent className="px-4 py-4">
                <div className="mx-auto max-w-2xl space-y-8">
                  <div>
                    <Label className="mb-2 block text-left">Empty state</Label>
                    <div className="h-44 overflow-hidden rounded-lg border border-border bg-muted/20">
                      <ConversationEmptyState
                        title="No messages yet"
                        description="Ingest documents, then ask a grounded question."
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block text-left">Sample messages</Label>
                    <div className="space-y-1">
                      <Message from="user">
                        <MessageAvatar name="You" src={reactLogo} />
                        <MessageContent>
                          What is retrieval-augmented generation?
                        </MessageContent>
                      </Message>
                      <Message from="assistant">
                        <MessageAvatar name="AI" src={viteLogo} />
                        <MessageContent>
                          RAG combines a retriever (your document index) with a
                          generator (the model), so answers stay tied to sources you
                          ingested.
                        </MessageContent>
                      </Message>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-border pt-4">
                    <Label className="mb-1 block text-left">Loading phases</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <ShimmeringText
                        className="text-sm"
                        duration={2.5}
                        text="Retrieving sources…"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ShimmeringText duration={2.5} text="Generating answer…" />
                    </div>
                  </div>
                </div>
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>
        </section>

        <section className="app-panel app-sources" aria-label="Sources">
          <div className="app-panel-header">
            <Headline as="h2" className="m-0 text-left">
              Sources
            </Headline>
            <Label className="mt-1 block text-left">Explainability (soon)</Label>
          </div>
          <div className="app-panel-body">
            <Body color="muted" className="text-left">
              Retrieved chunks and scores will show here after the chat API is wired
              up.
            </Body>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
