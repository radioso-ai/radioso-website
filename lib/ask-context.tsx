'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'

import { fetchAnswer } from './agent'
import { track } from './analytics'
import type { AgentAnswerData } from './agent'

/** One question and its (eventual) answer. `answer` is null while the ask is in flight. */
export type Asked = { question: string; answer: AgentAnswerData | null }

/**
 * Where the newest answer came from, for the header badge. `seed` until a visitor's own
 * question has been answered: the opener is canned, so nothing claims "live" yet. Then
 * `live` for an answer from the API, `demo` for one served by the stub.
 */
export type AnswerSource = 'seed' | 'live' | 'demo'

/**
 * Why the launcher last opened. `restore` is the session carrying an open launcher across
 * a page load: the visitor didn't just act, so focus stays where it is.
 */
export type OpenReason = 'button' | 'ask' | 'restore'

type AskState = {
  question: string
  setQuestion: (q: string) => void
  /** Full conversation history, oldest first. The last entry may still be in flight. */
  transcript: Asked[]
  pending: boolean
  /** Partial answer rendered live while the stream is in flight; null otherwise. */
  streaming: AgentAnswerData | null
  answerSource: AnswerSource
  error: string | null
  /** Ask the live agent. Opens the launcher first, from wherever on the site it's called. */
  ask: (q: string) => Promise<void>
  /** Whether the chat launcher's panel is open. */
  open: boolean
  openReason: OpenReason | null
  openLauncher: (reason: Exclude<OpenReason, 'restore'>) => void
  closeLauncher: (via: 'button' | 'header' | 'escape') => void
  inputRef: RefObject<HTMLInputElement | null>
}

/**
 * The launcher chip that trips the live agent's `talk-to-the-team` routine. Shared so
 * the leads demo's "Talk to the team" button asks the exact same thing.
 */
export const TALK_TO_THE_TEAM = 'Shut up and take my money! 💸'

/** The launcher stays open across pages for the rest of the visit, never longer. */
const OPEN_KEY = 'radioso_launcher_open'

function rememberOpen(open: boolean) {
  try {
    window.sessionStorage.setItem(OPEN_KEY, open ? '1' : '0')
  } catch {
    // Storage unavailable (private mode): the launcher just starts closed on the next page.
  }
}

const Ctx = createContext<AskState | null>(null)

export function AskProvider({ children }: { children: ReactNode }) {
  const [question, setQuestion] = useState('')
  const [transcript, setTranscript] = useState<Asked[]>([])
  const [pending, setPending] = useState(false)
  const [streaming, setStreaming] = useState<AgentAnswerData | null>(null)
  const [answerSource, setAnswerSource] = useState<AnswerSource>('seed')
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [openReason, setOpenReason] = useState<OpenReason | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  // Read by `ask`, which must not re-create itself every time the panel toggles.
  const openRef = useRef(false)

  // Session storage is invisible to the server render, so the launcher always ships
  // closed and reopens here if this visit had it open.
  useEffect(() => {
    let restored = false
    try {
      restored = window.sessionStorage.getItem(OPEN_KEY) === '1'
    } catch {
      // Storage unavailable: start closed.
    }
    if (!restored) return
    openRef.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true)
    setOpenReason('restore')
  }, [])

  const openLauncher = useCallback((reason: Exclude<OpenReason, 'restore'>) => {
    if (openRef.current) return
    openRef.current = true
    setOpen(true)
    setOpenReason(reason)
    rememberOpen(true)
    track('launcher_open', { source: reason })
  }, [])

  const closeLauncher = useCallback((via: 'button' | 'header' | 'escape') => {
    if (!openRef.current) return
    openRef.current = false
    setOpen(false)
    rememberOpen(false)
    track('launcher_close', { via })
  }, [])

  const ask = useCallback(
    async (q: string) => {
      const trimmed = q.trim()
      if (!trimmed || pending) return
      openLauncher('ask')
      if (trimmed === TALK_TO_THE_TEAM) track('hero_talk_to_team')
      setPending(true)
      setError(null)
      setStreaming(null)
      // Append the new question as an in-flight entry, keeping prior history.
      // The launcher scrolls the new entry into view once it has rendered.
      setTranscript((prev) => [...prev, { question: trimmed, answer: null }])
      setQuestion('')

      try {
        const data = await fetchAnswer(trimmed, {
          onChunk: (partialBody) => setStreaming({ body: partialBody, sources: [] }),
        })
        setAnswerSource(data.fallback === true ? 'demo' : 'live')
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
    [pending, openLauncher],
  )

  return (
    <Ctx.Provider
      value={{
        question,
        setQuestion,
        transcript,
        pending,
        streaming,
        answerSource,
        error,
        ask,
        open,
        openReason,
        openLauncher,
        closeLauncher,
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
