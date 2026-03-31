import { useCallback, useRef, useState } from 'react'
import { ApiError, postChat, type ChatResponse } from '@/lib/api'

export type ChatPhase = 'idle' | 'retrieving' | 'generating'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const PHASE_TO_GENERATING_MS = 400

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [phase, setPhase] = useState<ChatPhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null)
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sendingRef = useRef(false)

  const clearPhaseTimer = useCallback(() => {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current)
      phaseTimerRef.current = null
    }
  }, [])

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || sendingRef.current) return
      sendingRef.current = true

      setError(null)
      clearPhaseTimer()

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
      }
      setMessages((prev) => [...prev, userMsg])
      setPhase('retrieving')

      phaseTimerRef.current = setTimeout(() => {
        setPhase('generating')
        phaseTimerRef.current = null
      }, PHASE_TO_GENERATING_MS)

      try {
        const res = await postChat({ message: text })
        clearPhaseTimer()
        setLastResponse(res)
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: res.answer,
          },
        ])
      } catch (e) {
        clearPhaseTimer()
        const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : String(e)
        setError(msg)
      } finally {
        clearPhaseTimer()
        setPhase('idle')
        sendingRef.current = false
      }
    },
    [clearPhaseTimer],
  )

  return { messages, phase, error, lastResponse, send }
}
