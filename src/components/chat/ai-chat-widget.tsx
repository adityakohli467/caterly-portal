"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Send, ShoppingCart, Plus, Minus, Check } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { useCartStore } from "@/store/cart"

const BOT_ICON = "/assets/images/bizzy-bot.png"

interface QuoteItem {
  product_id: number
  name: string
  price: number
  quantity: number
  line_total?: number
  image?: string | null
}

interface QuoteData {
  items: QuoteItem[]
  subtotal?: number
  item_count?: number
  guest_count?: number | null
  notes?: string | null
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  quote?: QuoteData
}

const uid = () => Math.random().toString(36).slice(2)

/** Heuristic: does this assistant message read like a priced menu proposal? */
const looksLikeMenu = (text: string) => {
  if (!text) return false
  const hasPrice = /\$\s?\d/.test(text)
  const hasMenuCue = /(per person|total\b|menu|package|starter|main|dessert|platter)/i.test(text)
  return hasPrice && hasMenuCue
}

const WELCOME_TEXT =
  "Hey there! I'm Bizzy 👋 your Caterly event buddy. Planning something special? Tell me the occasion, how many guests, your budget and any dietary needs — and I'll put together a menu for you."

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
  const streamIn = (fullText: string, quote?: QuoteData) => {
    const id = uid()
    setMessages((prev) => [...prev, { id, role: "assistant", content: "", quote }])

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
      const quote: QuoteData | undefined =
        data?.quote && Array.isArray(data.quote.items) && data.quote.items.length > 0 ? data.quote : undefined
      streamIn(data?.reply?.trim() || "Sorry, I didn't quite catch that — could you say it another way?", quote)
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

  // The most recent assistant message — the only one that should offer the fallback "add menu" CTA.
  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Chat with Bizzy"
          className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-teal-600 py-2 pl-2 pr-5 text-white shadow-xl transition hover:bg-teal-500"
        >
          <span className="relative">
            <Image
              src={BOT_ICON}
              alt="Bizzy"
              width={38}
              height={38}
              className="h-9 w-9 rounded-full object-cover"
            />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-teal-600 bg-green-500" />
          </span>
          <span className="hidden font-semibold sm:inline">Chat with Bizzy</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[70vh] max-h-[620px] w-[92vw] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#1e2a4a] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="relative">
                <Image
                  src={BOT_ICON}
                  alt="Bizzy"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[#1e2a4a] bg-green-500" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Bizzy</p>
                <p className="text-xs text-teal-300/90">Caterly event assistant</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-100 p-4">
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col gap-2">
                <div className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
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
                        ? "rounded-br-sm bg-teal-600 text-white"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-800 shadow-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
                {m.role === "assistant" && m.quote?.items?.length ? (
                  <QuoteCard quote={m.quote} />
                ) : m.role === "assistant" && m.id === lastAssistantId && !typing && looksLikeMenu(m.content) ? (
                  <button
                    onClick={() => sendText("Yes please — build the quote for that menu so I can add it to my cart.")}
                    className="ml-8 flex items-center gap-1.5 self-start rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-500"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Add this menu to cart
                  </button>
                ) : null}
              </div>
            ))}

            {typing && (
              <div className="flex items-end gap-2">
                <Image src={BOT_ICON} alt="Bizzy" width={26} height={26} className="h-6 w-6 shrink-0 rounded-full object-cover" />
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            )}

            {showQuickReplies && (
              <div className="flex flex-col items-start gap-2 pt-1">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendText(q)}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-teal-400 hover:text-teal-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Ask a question…"
                className="max-h-28 flex-1 resize-none rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none"
              />
              <button
                onClick={() => sendText(input)}
                disabled={typing || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-slate-400">Bizzy can make mistakes — confirm details before ordering.</p>
          </div>
        </div>
      )}
    </>
  )
}

/** A priced menu card the customer can tweak and drop straight into the cart. */
function QuoteCard({ quote }: { quote: QuoteData }) {
  const addItem = useCartStore((s) => s.addItem)
  const [qtys, setQtys] = useState<Record<number, number>>(() =>
    Object.fromEntries(quote.items.map((it) => [it.product_id, Math.max(1, it.quantity || 1)])),
  )
  const [added, setAdded] = useState(false)

  const setQty = (id: number, q: number) => {
    setQtys((prev) => ({ ...prev, [id]: Math.max(1, q) }))
    setAdded(false)
  }

  const subtotal = quote.items.reduce((s, it) => s + it.price * (qtys[it.product_id] ?? it.quantity), 0)

  const addAll = () => {
    quote.items.forEach((it) => {
      addItem({
        product_id: it.product_id,
        product_name: it.name,
        product_price: String(it.price),
        product_image: it.image ?? undefined,
        quantity: qtys[it.product_id] ?? it.quantity,
      })
    })
    setAdded(true)
    toast.success("Menu added to your cart")
  }

  return (
    <div className="ml-8 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-teal-700">
        <ShoppingCart className="h-3.5 w-3.5" /> Your suggested menu
      </p>

      <div className="space-y-2">
        {quote.items.map((it) => {
          const q = qtys[it.product_id] ?? it.quantity
          return (
            <div key={it.product_id} className="flex items-center gap-2">
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt={it.name} className="h-9 w-9 shrink-0 rounded-md object-cover" />
              ) : (
                <div className="h-9 w-9 shrink-0 rounded-md bg-slate-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-800">{it.name}</p>
                <p className="text-[11px] text-slate-400">${it.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQty(it.product_id, q - 1)}
                  aria-label="Decrease quantity"
                  className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-xs text-slate-800">{q}</span>
                <button
                  onClick={() => setQty(it.product_id, q + 1)}
                  aria-label="Increase quantity"
                  className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <span className="w-14 text-right text-xs font-semibold text-slate-800">${(it.price * q).toFixed(2)}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2">
        <span className="text-xs text-slate-500">Subtotal</span>
        <span className="text-sm font-bold text-teal-700">${subtotal.toFixed(2)}</span>
      </div>

      {added ? (
        <Link
          href="/cart"
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white transition hover:bg-green-500"
        >
          <Check className="h-4 w-4" /> Added — View cart
        </Link>
      ) : (
        <button
          onClick={addAll}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-600 py-2 text-xs font-semibold text-white transition hover:bg-teal-500"
        >
          <ShoppingCart className="h-4 w-4" /> Add all items to cart
        </button>
      )}
    </div>
  )
}
