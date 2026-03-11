"use client"

import { Clock, Phone } from "lucide-react"
import Link from "next/link"
import { useQuoteModalStore } from "@/store/quote-modal"

export function TopBar() {
  const openQuoteModal = useQuoteModalStore((s) => s.open)

  return (
    <div className="bg-[#2D3E50] text-white py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
          
          {/* Left Side: Delivery Notice */}
          <div className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium">
            <Clock className="w-4 h-4 text-white" />
            <span>All orders must be placed 24 hours prior to the delivery date</span>
          </div>

          {/* Right Side: Contact & Quick Links */}
          <div className="flex items-center gap-4 md:gap-6">
            <a
              href="tel:1300827286"
              className="flex items-center gap-1.5 text-[12px] md:text-[13px] font-medium hover:text-[#E03A3E] transition"
            >
              <Phone className="w-3.5 h-3.5" />
              1300 827 286
            </a>

            <div className="flex items-center gap-3">
              <button
                onClick={openQuoteModal}
                className="border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#2D3E50] px-3 py-1 rounded-[6px] transition text-[11px] md:text-[12px] font-semibold"
              >
                Request a Quote
              </button>

              <Link
                href="/food-safety"
                className="bg-[#5A7D59] hover:bg-[#4a6649] text-white px-3 py-1 rounded-[6px] transition text-[11px] md:text-[12px] font-semibold"
              >
                Healthy Choices
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
