'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'

import { fetchAnswer, PRERENDERED, type AgentAnswerData } from './agent'

/** One question and its (eventual) answer. `answer` is null while the ask is in flight. */
export type Asked = { question: string; answer: AgentAnswerData | null }

type AskState = {
  question: string
  setQuestion: (q: string) => void
  /** Full conversation history, oldest first. The last entry may still be in flight. */
  transcript: Asked[]
  pending: boolean
  /** Partial answer rendered live while the stream is in flight; null otherwise. */
  streaming: AgentAnswerData | null
  error: string | null
  ask: (q: string) => Promise<void>
  /** Populate the input box with text and move focus to it. */
  populateInput: (q: string) => void
  answerRef: RefObject<HTMLDivElement | null>
  inputRef: RefObject<HTMLInputElement | null>
}

const SEED: Asked = { question: 'What is Radioso?', answer: PRERENDERED.whatIsRadioso }

const Ctx = createContext<AskState | null>(null)

export function AskProvider({ children }: { children: ReactNode }) {
  const [question, setQuestion] = useState('')
  const [transcript, setTranscript] = useState<Asked[]>([SEED])
  const [pending, setPending] = useState(false)
  const [streaming, setStreaming] = useState<AgentAnswerData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const answerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const ask = useCallback(
    async (q: string) => {
      const trimmed = q.trim()
      if (!trimmed || pending) return
      setPending(true)
      setError(null)
      setStreaming(null)
      // Append the new question as an in-flight entry, keeping prior history.
      // AskHero scrolls the new entry into view once it has rendered.
      setTranscript((prev) => [...prev, { question: trimmed, answer: null }])
      setQuestion('')

      try {
        const data = await fetchAnswer(trimmed, {
          onChunk: (partialBody) => setStreaming({ body: partialBody, sources: [] }),
        })
        setTranscript((prev) =>
          prev.map((item, i) =>
            i === prev.length - 1 ? { question: trimmed, answer: data } : item,
          ),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
        // Drop the in-flight entry so history stays clean; the error renders separately.
        setTranscript((prev) => prev.slice(0, -1))
      } finally {
        setPending(false)
        setStreaming(null)
      }
    },
    [pending],
  )

  const populateInput = useCallback((q: string) => {
    setQuestion(q)
    const input = inputRef.current
    if (!input) return
    input.focus({ preventScroll: true })
    requestAnimationFrame(() => {
      const len = input.value.length
      try {
        input.setSelectionRange(len, len)
      } catch {
        // setSelectionRange isn't supported on every input type; safe to ignore.
      }
    })
  }, [])

  return (
    <Ctx.Provider
      value={{
        question,
        setQuestion,
        transcript,
        pending,
        streaming,
        error,
        ask,
        populateInput,
        answerRef,
        inputRef,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAsk() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAsk must be used inside AskProvider')
  return ctx
}
