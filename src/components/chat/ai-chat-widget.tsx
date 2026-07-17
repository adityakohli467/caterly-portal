"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { X, Send } from "lucide-react"
import { api } from "@/lib/api"

const BOT_ICON = "/assets/images/bizzy-bot.png"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

const uid = () => Math.random().toString(36).slice(2)

const WELCOME_TEXT =
  "Hey there! I'm Bizzy 👋 your Caterly event buddy. Planning something special? Tell me the occasion, how many guests, your budget and any veg/non-veg mix — I'll sort out a menu for you."

const QUICK_REPLIES = [
  "Planning a wedding",
  "Corporate lunch for 30",
  "Birthday party under $500",
  "I'd like a quote",
]

export function AiChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uid(), role: "assistant", content: WELCOME_TEXT },
  ])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  /** Reveal an assistant reply gradually so it feels like a person typing live. */
  const streamIn = (fullText: string) => {
    const id = uid()
    setMessages((prev) => [...prev, { id, role: "assistant", content: "" }])

    const words = fullText.split(/(\s+)/) // keep whitespace tokens
    let i = 0
    const step = () => {
      i += 1
      const partial = words.slice(0, i).join("")
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: partial } : m)))
      if (i < words.length) {
        // Slightly variable cadence reads more naturally than a fixed tick.
        setTimeout(step, 18 + Math.random() * 34)
      }
    }
    step()
  }

  const sendText = async (text: string) => {
    const clean = text.trim()
    if (!clean || typing) return

    const userMsg: ChatMessage = { id: uid(), role: "user", content: clean }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput("")
    setTyping(true)

    try {
      // Send the full conversation (minus the static welcome) so the assistant has memory.
      const payload = history
        .slice(1)
        .map((m) => ({ role: m.role, content: m.content }))

      const { data } = await api.post("/store/ai-chat", { messages: payload })
      setTyping(false)
      streamIn(data?.reply?.trim() || "Sorry, I didn't quite catch that — could you say it another way?")
    } catch (err) {
      setTyping(false)
      streamIn("Hmm, I'm having trouble connecting right now. Please try again in a moment.")
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendText(input)
    }
  }

  const showQuickReplies = messages.length === 1 && !typing

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Chat with Bizzy"
          className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-amber-500 py-2 pl-2 pr-5 text-black shadow-xl transition hover:bg-amber-400"
        >
          <span className="relative">
            <Image
              src={BOT_ICON}
              alt="Bizzy"
              width={38}
              height={38}
              className="h-9 w-9 rounded-full object-cover"
            />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-amber-500 bg-green-500" />
          </span>
          <span className="hidden font-semibold sm:inline">Chat with Bizzy</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[70vh] max-h-[620px] w-[92vw] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#241a05] to-[#1c1c1c] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="relative">
                <Image
                  src={BOT_ICON}
                  alt="Bizzy"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[#1c1c1c] bg-green-500" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Bizzy</p>
                <p className="text-xs text-amber-300/80">Caterly event assistant</p>
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
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#0f0f0f] p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <Image
                    src={BOT_ICON}
                    alt="Bizzy"
                    width={26}
                    height={26}
                    className="h-6 w-6 shrink-0 rounded-full object-cover"
                  />
                )}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-amber-500 text-black"
                      : "rounded-bl-sm bg-white/10 text-white"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex items-end gap-2">
                <Image src={BOT_ICON} alt="Bizzy" width={26} height={26} className="h-6 w-6 shrink-0 rounded-full object-cover" />
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" />
                </div>
              </div>
            )}

            {showQuickReplies && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendText(q)}
                    className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200 transition hover:bg-amber-500/20"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 bg-[#1c1c1c] p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Type your message…"
                className="max-h-28 flex-1 resize-none rounded-xl border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-amber-500 focus:outline-none"
              />
              <button
                onClick={() => sendText(input)}
                disabled={typing || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-white/30">Bizzy can make mistakes — confirm details before ordering.</p>
          </div>
        </div>
      )}
    </>
  )
}
