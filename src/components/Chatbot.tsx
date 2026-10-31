import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useChat } from '@ai-sdk/react'
import { Bot, MessageCircle, RotateCcw, Send, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const welcomeMessage: UIMessage = {
  id: 'portfolio-assistant-welcome',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: "Hi, I’m Noel’s AI Portfolio Assistant. I can answer from the information on this website: his undergraduate Mechanical Engineering background; customer service experience supporting Comcast and Xfinity; developing AI full-stack and automation skills; the Personal Portfolio Website prototype; and the AI Customer Support Automation concept. The Customer Service entry describes his experience, not a separate software product. I don’t have verified details about pricing, client results, or specific availability. What would you like to know?",
    },
  ],
}

const initialMessages = [welcomeMessage]

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [requestError, setRequestError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isBusy = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    messages: initialMessages,
    onError: () => setRequestError(true),
  })
  const { messages, sendMessage, status, setMessages, error, clearError } = isBusy
  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [isOpen, messages, status])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  function handleClearConversation() {
    if (isLoading) return
    setMessages(initialMessages)
    clearError()
    setRequestError(false)
    setInput('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return

    setInput('')
    setRequestError(false)
    clearError()

    try {
      await sendMessage({ text })
    } catch {
      setRequestError(true)
    }
  }

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          aria-label="AI Portfolio Assistant"
          aria-modal="false"
          className="mb-3 flex h-[min(36rem,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-[24rem] flex-col overflow-hidden rounded-3xl border border-[#cabfb4] bg-[#f7f3ee] shadow-[0_24px_70px_rgba(37,37,37,0.22)]"
          role="dialog"
        >
          <header className="flex items-center justify-between gap-3 border-b border-[#cabfb4] bg-[#6e7560] px-4 py-3.5 text-[#f8f5f1]">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Bot aria-hidden="true" size={21} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">AI Portfolio Assistant</h2>
                <p className="mt-0.5 text-xs text-white/75">Ask about Noel’s portfolio</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleClearConversation}
                disabled={isLoading}
                aria-label="Clear conversation"
                title="Clear conversation"
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw aria-hidden="true" size={17} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
          </header>

          <div
            aria-live="polite"
            className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-[#6e7560] text-white'
                      : 'rounded-bl-md border border-[#e1d8ce] bg-white text-[#34312e]'
                  }`}
                >
                  {messageText(message)}
                </p>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <p
                  aria-label="Assistant is typing"
                  className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[#e1d8ce] bg-white px-4 py-3"
                >
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6e7560] [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6e7560] [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6e7560]" />
                </p>
              </div>
            )}

            {(requestError || error) && (
              <p
                role="alert"
                className="rounded-xl border border-[#dbb0a5] bg-[#f8eae7] px-3 py-2 text-sm leading-5 text-[#7f3d32]"
              >
                The assistant is temporarily unavailable. Please try again, or use the{' '}
                <Link
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className="font-medium underline underline-offset-2"
                >
                  contact page
                </Link>
                .
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-[#cabfb4] bg-[#f3eee8] p-3">
            <label htmlFor="portfolio-chat-message" className="sr-only">
              Your message
            </label>
            <div className="flex items-end gap-2">
              <input
                id="portfolio-chat-message"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={4000}
                placeholder="Ask a question..."
                autoComplete="off"
                disabled={isLoading}
                className="min-w-0 flex-1 rounded-2xl border border-[#cabfb4] bg-white px-4 py-3 text-sm text-[#252525] outline-none transition placeholder:text-[#8b8580] focus:border-[#6e7560] focus:ring-2 focus:ring-[#d1d8cc] disabled:opacity-70"
              />
              <button
                type="submit"
                disabled={isLoading || input.trim().length === 0}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#6e7560] text-white transition-colors hover:bg-[#59654c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send aria-hidden="true" size={17} />
              </button>
            </div>
            <div className="mt-2 text-center">
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="text-xs text-[#68635f] underline decoration-[#9c958c] underline-offset-2 hover:text-[#252525]"
              >
                Contact Noel directly
              </Link>
            </div>
          </form>
        </section>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setIsOpen((open) => !open)
            if (!isOpen) window.setTimeout(() => inputRef.current?.focus(), 0)
          }}
          aria-label={isOpen ? 'Close AI Portfolio Assistant' : 'Open AI Portfolio Assistant'}
          aria-expanded={isOpen}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6e7560] text-white shadow-[0_10px_28px_rgba(37,37,37,0.22)] transition hover:-translate-y-0.5 hover:bg-[#59654c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6e7560] sm:h-16 sm:w-16"
        >
          {isOpen ? (
            <X aria-hidden="true" size={24} />
          ) : (
            <MessageCircle aria-hidden="true" size={25} />
          )}
        </button>
      </div>
    </div>,
    document.body,
  )
}
