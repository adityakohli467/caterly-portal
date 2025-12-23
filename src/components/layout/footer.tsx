"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Instagram } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export function Footer() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address")
      return
    }

    try {
      setLoading(true)
      const response = await api.post("/store/newsletter/subscribe", {
        email: email.trim(),
      })

      toast.success(response.data.message || "Successfully subscribed to our newsletter!")
      setEmail("")
    } catch (error: any) {
      console.error("Newsletter subscription error:", error)
      const errorMessage = error.response?.data?.message || "Failed to subscribe. Please try again later."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-[#1a1a1a]">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Logo and Brand */}
          <div>
            <div className="mb-4">
              <span className="text-white text-2xl font-bold" style={{ fontFamily: 'Albert Sans', fontWeight: 700 }}>
                ZENN
              </span>
            </div>
            <p className="text-sm text-white/60">© Zenn Cafe. All rights reserved.</p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-white" style={{ fontFamily: 'Albert Sans' }}>GET IN TOUCH WITH US</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-white/70">Email: catering@zenncafe.com.au</li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  )
}
