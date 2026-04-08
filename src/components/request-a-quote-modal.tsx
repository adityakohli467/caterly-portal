"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { useQuoteModalStore } from "@/store/quote-modal"
import { X } from "lucide-react"

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
      <style dangerouslySetInnerHTML={{ __html: `
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.3);
        }
        input[type="datetime-local"] {
          accent-color: #E03A3E;
        }
      `}} />
      {isOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative w-full max-w-[550px] bg-white rounded-2xl shadow-2xl z-10 overflow-y-auto max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-gray-50">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Request a Quote
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  We'll get back to you within 24 hours
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 text-[#E03A3E] transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Form */}
            <form
              className="px-8 py-6 space-y-5"
              onSubmit={handleQuoteSubmit}
            >

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Name</label>

                <input
                  type="text"
                  required
                  value={quoteForm.name}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E03A3E] focus:border-transparent"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Contact</label>

                <input
                  type="tel"
                  required
                  value={quoteForm.contact}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, contact: e.target.value })
                  }
                  placeholder="Phone number"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E03A3E] focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>

                <input
                  type="email"
                  required
                  value={quoteForm.email}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, email: e.target.value })
                  }
                  placeholder="Email address"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E03A3E] focus:border-transparent"
                />
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E03A3E] focus:border-transparent"
                />
              </div>

              {/* Occasion */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Occasion</label>

                <select
                  required
                  value={quoteForm.occasion}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, occasion: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E03A3E] focus:border-transparent"
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">Message</label>

                <textarea
                  rows={3}
                  required
                  value={quoteForm.message}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, message: e.target.value })
                  }
                  placeholder="Tell us about your event..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#E03A3E] focus:border-transparent"
                />
              </div>

              {/* Captcha */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-800 mb-3">Verification Code</label>

                <div className="flex items-center gap-3 mb-3">

                  <div className="border-2 border-dashed border-[#E03A3E] px-5 py-2 rounded-lg font-bold text-lg text-[#E03A3E] tracking-widest bg-white min-w-fit select-none pointer-events-none">
                    {captchaCode}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCaptchaCode(generateCaptcha())}
                    className="text-xs font-medium text-[#E03A3E] hover:underline whitespace-nowrap"
                  >
                    🔄 Refresh
                  </button>

                </div>

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
                  placeholder="Enter the code above"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E03A3E] focus:border-transparent"
                />

              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">

                <button
                  type="submit"
                  disabled={submittingQuote}
                  className="flex-1 bg-[#E03A3E] hover:bg-[#c73236] text-white py-3 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  {submittingQuote ? "Submitting..." : "Submit Request"}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 border-2 border-gray-300 py-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
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