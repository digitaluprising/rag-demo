import { Body, Headline, Label } from '@/components/typography'
import { ChatPanel } from '@/features/chat/ChatPanel'
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
              Ask questions — scroll inside this column only
            </Label>
          </div>
          <div className="app-chat-body">
            <ChatPanel />
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
