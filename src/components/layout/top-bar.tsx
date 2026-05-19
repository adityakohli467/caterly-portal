"use client"

import { Clock, Phone } from "lucide-react"
import { useQuoteModalStore } from "@/store/quote-modal"

export function TopBar() {
  const openQuoteModal = useQuoteModalStore((s) => s.open)

  return (
    <div className="bg-[#000000] text-white py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">

          {/* Left Side: Delivery Notice */}
          <div className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium text-center md:text-left">
            <Clock className="w-4 h-4 text-white" />
            <span>
              All orders must be placed 24 hours prior to the delivery date
            </span>
          </div>

          {/* Right Side: Contact & Quick Links */}
          <div className="flex items-center gap-4 md:gap-6">

            {/* Phone */}
            <a
              href="tel:1300827286"
              className="flex items-center gap-1.5 text-[12px] md:text-[13px] font-medium hover:text-[#E03A3E] transition"
            >
              <Phone className="w-3.5 h-3.5" />
              1300 827 286
            </a>

            {/* Buttons */}
            <div className="flex items-center gap-3">

              {/* Request Quote */}
              <button
                onClick={openQuoteModal}
                className="bg-[#E03A3E] border border-[#E03A3E] text-white hover:bg-transparent hover:text-white px-3 py-1 rounded-[6px] transition text-[11px] md:text-[12px] font-bold"
              >
                Request a Quote
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}