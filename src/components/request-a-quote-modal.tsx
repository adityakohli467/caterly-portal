"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { api } from "@/lib/api"

const generateCaptcha = () => Math.floor(1000 + Math.random() * 9000).toString()

export function RequestAQuoteModal() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [captchaCode, setCaptchaCode] = useState("")
    const [quoteForm, setQuoteForm] = useState({
        name: "",
        contact: "",
        email: "",
        deliveryDateTime: "",
        occasion: "",
        message: "",
        captchaInput: "",
    })
    const [submittingQuote, setSubmittingQuote] = useState(false)

    useEffect(() => {
        setCaptchaCode(generateCaptcha())
    }, [])

    // Regenerate captcha when modal opens
    useEffect(() => {
        if (isOpen) {
            setCaptchaCode(generateCaptcha())
        }
    }, [isOpen])

    const handleOpen = () => setIsOpen(true)
    const handleClose = () => {
        setIsOpen(false)
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
            toast.success("Your quote request has been submitted! We'll be in touch within 24 hours.")
            handleClose()
        } catch (error: any) {
            toast.error(error?.message || "Failed to submit. Please try again.")
            setCaptchaCode(generateCaptcha())
            setQuoteForm(prev => ({ ...prev, captchaInput: "" }))
        } finally {
            setSubmittingQuote(false)
        }
    }

    // Hide on login / register pages
    if (pathname?.startsWith("/auth")) return null

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={handleOpen}
                aria-label="Request a Quote"
                className="fixed bottom-8 right-8 z-40 flex items-center gap-2 bg-[#E03A3E] hover:bg-[#cc3236] text-white px-5 py-3 rounded-full shadow-2xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ boxShadow: "0 4px 24px rgba(224,58,62,0.45)" }}
            >
                {/* Document/Quote icon */}
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
                Request a Quote
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal Panel */}
                    <div className="relative w-full max-w-[540px] bg-white rounded-2xl shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F2CACA]">
                            <div>
                                <h2 className="text-[20px] font-semibold text-black">Request a Quote</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    We&apos;ll get back to you within 24 hours.
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500 text-lg leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form Body */}
                        <form className="px-6 py-5 space-y-4" onSubmit={handleQuoteSubmit}>

                            {/* Name */}
                            <div>
                                <label className="text-sm font-medium text-black">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={quoteForm.name}
                                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                                    placeholder="Enter your full name"
                                    className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#E03A3E]"
                                />
                            </div>

                            {/* Contact */}
                            <div>
                                <label className="text-sm font-medium text-black">Contact</label>
                                <input
                                    type="tel"
                                    required
                                    value={quoteForm.contact}
                                    onChange={(e) => setQuoteForm({ ...quoteForm, contact: e.target.value })}
                                    placeholder="Enter your phone number"
                                    className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#E03A3E]"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm font-medium text-black">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={quoteForm.email}
                                    onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                                    placeholder="Enter your email address"
                                    className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#E03A3E]"
                                />
                            </div>

                            {/* Delivery Date and Time */}
                            <div>
                                <label className="text-sm font-medium text-black">Delivery Date and Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={quoteForm.deliveryDateTime}
                                    onChange={(e) => setQuoteForm({ ...quoteForm, deliveryDateTime: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#E03A3E]"
                                />
                            </div>

                            {/* Occasion */}
                            <div>
                                <label className="text-sm font-medium text-black">Occasion</label>
                                <select
                                    required
                                    value={quoteForm.occasion}
                                    onChange={(e) => setQuoteForm({ ...quoteForm, occasion: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm text-gray-600 focus:outline-none focus:border-[#E03A3E]"
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
                                    required
                                    rows={3}
                                    value={quoteForm.message}
                                    onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                                    placeholder="Tell us about your event..."
                                    className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm text-black placeholder:text-gray-400 resize-none focus:outline-none focus:border-[#E03A3E]"
                                />
                            </div>

                            {/* Captcha */}
                            <div>
                                <label className="text-sm font-medium text-black">Captcha</label>
                                <div className="mt-1 flex items-center gap-3">
                                    <div className="flex items-center justify-center min-w-[90px] border-2 border-dashed border-[#E03A3E] px-5 py-3 rounded-md select-none">
                                        <span className="text-[#E03A3E] font-bold text-lg tracking-widest">{captchaCode}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCaptchaCode(generateCaptcha())}
                                        className="text-xs text-[#E03A3E] underline whitespace-nowrap"
                                    >
                                        Refresh
                                    </button>
                                    <input
                                        type="text"
                                        required
                                        value={quoteForm.captchaInput}
                                        onChange={(e) => setQuoteForm({ ...quoteForm, captchaInput: e.target.value })}
                                        placeholder="Enter captcha"
                                        className="flex-1 rounded-md border border-[#F2CACA] px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#E03A3E]"
                                    />
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center gap-3 pt-1 pb-2">
                                <button
                                    type="submit"
                                    disabled={submittingQuote}
                                    className="flex-1 bg-[#E03A3E] hover:bg-[#cc3236] text-white py-3 rounded-md text-sm font-semibold transition disabled:opacity-50"
                                >
                                    {submittingQuote ? "Submitting..." : "Submit Request"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 border border-[#E6E6E6] text-black py-3 rounded-md text-sm font-semibold hover:bg-gray-50 transition"
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
