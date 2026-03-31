import { Headline } from '@/components/typography'
import { ChatPanel } from '@/features/chat/ChatPanel'
import { useChat } from '@/features/chat/useChat'
import { ExplainabilityPanel } from '@/features/explain/ExplainabilityPanel'
import { IngestPanel } from '@/features/ingest/IngestPanel'

import './App.css'

function App() {
  const { messages, phase, error, lastResponse, send } = useChat()

  return (
    <div className="app-root">
      <div className="app-shell">
        <section className="app-panel app-ingest" aria-label="Ingest">
          <div className="app-panel-header">
            <Headline as="h2" className="m-0 text-left">
              Ingest
            </Headline>
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
          </div>
          <div className="app-chat-body">
            <ChatPanel messages={messages} phase={phase} error={error} send={send} />
          </div>
        </section>

        <section className="app-panel app-sources" aria-label="Sources">
          <div className="app-panel-header">
            <Headline as="h2" className="m-0 text-left">
              Sources
            </Headline>
          </div>
          <div className="app-panel-body">
            <ExplainabilityPanel lastResponse={lastResponse} />
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
