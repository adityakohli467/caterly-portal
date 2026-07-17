"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react"
import { api } from "@/lib/api"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm the Caterly Assistant. Tell me about your event — date, number of guests, budget and any veg/non-veg preferences — and I'll build a menu for you.",
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const next: ChatMessage[] = [...messages, { role: "user", content: text }]
    setMessages(next)
    setInput("")
    setLoading(true)

    try {
      // Send the conversation without the static welcome message.
      const payload = next.filter((m) => m !== WELCOME)
      const { data } = await api.post("/store/ai-chat", { messages: payload })
      setMessages([...next, { role: "assistant", content: data?.reply || "Sorry, I couldn't respond just now." }])
    } catch (err) {
      setMessages([
        ...next,
        { role: "assistant", content: "Something went wrong reaching the assistant. Please try again in a moment." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat assistant"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-black shadow-lg transition hover:bg-amber-400"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden font-semibold sm:inline">Ask Caterly AI</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[70vh] max-h-[600px] w-[92vw] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#1c1c1c] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-black">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Caterly Assistant</p>
                <p className="text-xs text-green-400">Online</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-amber-500 text-black"
                      : "rounded-bl-sm bg-white/10 text-white"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white/10 px-3 py-2 text-sm text-white/70">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 bg-[#1c1c1c] p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Describe your event…"
                className="max-h-28 flex-1 resize-none rounded-xl border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-amber-500 focus:outline-none"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
