"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { useQuoteModalStore } from "@/store/quote-modal"

const generateCaptcha = () => Math.floor(1000 + Math.random() * 9000).toString()

export function RequestAQuoteModal() {

  const pathname = usePathname()
  const { isOpen, close: storeClose } = useQuoteModalStore()

  const [captchaCode, setCaptchaCode] = useState("")
  const [submittingQuote, setSubmittingQuote] = useState(false)

  const [quoteForm, setQuoteForm] = useState({
    name: "",
    contact: "",
    email: "",
    deliveryDateTime: "",
    occasion: "",
    message: "",
    captchaInput: "",
  })

  useEffect(() => {
    setCaptchaCode(generateCaptcha())
  }, [])

  useEffect(() => {
    if (isOpen) {
      setCaptchaCode(generateCaptcha())
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleClose = () => {
    storeClose()

    setQuoteForm({
      name: "",
      contact: "",
      email: "",
      deliveryDateTime: "",
      occasion: "",
      message: "",
      captchaInput: "",
    })

    setCaptchaCode(generateCaptcha())
  }

  const handleQuoteSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    if (quoteForm.captchaInput !== captchaCode) {
      toast.error("Captcha does not match. Please try again.")
      setCaptchaCode(generateCaptcha())
      setQuoteForm(prev => ({ ...prev, captchaInput: "" }))
      return
    }

    setSubmittingQuote(true)

    try {

      await api.post("/store/quotation", {
        name: quoteForm.name,
        contact: quoteForm.contact,
        email: quoteForm.email,
        delivery_date_time: quoteForm.deliveryDateTime,
        occasion: quoteForm.occasion,
        message: quoteForm.message,
        captcha: quoteForm.captchaInput,
      })

      toast.success("Your quote request has been submitted!")

      handleClose()

    } catch (error: any) {

      toast.error(error?.message || "Failed to submit.")

      setCaptchaCode(generateCaptcha())
      setQuoteForm(prev => ({ ...prev, captchaInput: "" }))

    } finally {

      setSubmittingQuote(false)

    }
  }

  if (pathname?.startsWith("/auth")) return null

  return (
    <>
      {isOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative w-full max-w-[520px] bg-white rounded-2xl shadow-2xl z-10">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">

              <div>
                <h2 className="text-lg font-semibold text-black">
                  Request a Quote
                </h2>
                <p className="text-sm text-gray-500">
                  We'll get back to you within 24 hours
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>

            </div>

            {/* Form */}
            <form
              className="px-6 py-5 space-y-3"
              onSubmit={handleQuoteSubmit}
            >

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-black">Name</label>

                <input
                  type="text"
                  required
                  value={quoteForm.name}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#E03A3E]"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="text-sm font-medium text-black">Contact</label>

                <input
                  type="tel"
                  required
                  value={quoteForm.contact}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, contact: e.target.value })
                  }
                  placeholder="Phone number"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#E03A3E]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-black">Email</label>

                <input
                  type="email"
                  required
                  value={quoteForm.email}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, email: e.target.value })
                  }
                  placeholder="Email address"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#E03A3E]"
                />
              </div>

              {/* Delivery Date */}
              <div>
                <label className="text-sm font-medium text-black">
                  Delivery Date & Time
                </label>

                <input
                  type="datetime-local"
                  required
                  value={quoteForm.deliveryDateTime}
                  onChange={(e) =>
                    setQuoteForm({
                      ...quoteForm,
                      deliveryDateTime: e.target.value
                    })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#E03A3E]"
                />
              </div>

              {/* Occasion */}
              <div>
                <label className="text-sm font-medium text-black">Occasion</label>

                <select
                  required
                  value={quoteForm.occasion}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, occasion: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#E03A3E]"
                >
                  <option value="">Select Occasion</option>
                  <option>Wedding</option>
                  <option>Corporate Event</option>
                  <option>Birthday Party</option>
                  <option>Anniversary</option>
                  <option>Private Dinner</option>
                  <option>Graduation</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-black">Message</label>

                <textarea
                  rows={2}
                  required
                  value={quoteForm.message}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, message: e.target.value })
                  }
                  placeholder="Tell us about your event..."
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#E03A3E]"
                />
              </div>

              {/* Captcha */}
              <div>
                <label className="text-sm font-medium text-black">Captcha</label>

                <div className="mt-1 flex items-center gap-2">

                  <div className="border-2 border-dashed border-[#E03A3E] px-4 py-1 rounded-md font-bold text-[#E03A3E] tracking-widest">
                    {captchaCode}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCaptchaCode(generateCaptcha())}
                    className="text-xs text-[#E03A3E] underline"
                  >
                    Refresh
                  </button>

                  <input
                    type="text"
                    required
                    value={quoteForm.captchaInput}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        captchaInput: e.target.value
                      })
                    }
                    placeholder="Enter"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#E03A3E]"
                  />

                </div>

              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">

                <button
                  type="submit"
                  disabled={submittingQuote}
                  className="flex-1 bg-[#E03A3E] hover:bg-[#c73236] text-white py-2 rounded-md text-sm font-semibold transition disabled:opacity-50"
                >
                  {submittingQuote ? "Submitting..." : "Submit Request"}
                </button>

            <button
  type="button"
  onClick={handleClose}
  className="flex-1 border border-gray-300 py-2 rounded-md text-sm font-semibold text-black hover:bg-gray-50"
>
  Cancel
</button>

              </div>

            </form>

          </div>

        </div>

      )}
    </>
  )
}