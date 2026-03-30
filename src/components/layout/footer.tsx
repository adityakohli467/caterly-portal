"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn, FaCcAmex, FaCcMastercard, FaCcVisa } from "react-icons/fa"
import { api } from "@/lib/api"

export function Footer() {

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubscribe = async () => {

    if (!email) return

    try {

      setLoading(true)
      setMessage("")

      await api.post("/store/newsletter/subscribe", { email })

      setMessage("Subscribed!")
      setEmail("")

    } catch (error: any) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message)
      } else {
        setMessage("Error subscribing.")
      }
    } finally {
      setLoading(false)
    }

  }

  return (
    <footer className="bg-black text-white font-sans">

      <div className="max-w-7xl mx-auto px-10 py-16 grid md:grid-cols-5 gap-12">

        {/* LOGO */}
        <div>
          <Image
            src="/assets/images/l1.png"
            alt="Caterly Logo"
            width={0}
            height={0}
            sizes="100vw"
            className="mb-4 ml-6 -mt-4"
            style={{ width: '130px', height: '130px' }}
            
          />
  <p className="text-sm text-white/70 ml-6 -mt-6">
            Premium catering services delivered fresh and on time.
          </p>
        
        </div>

        {/* CONTACT */}
        <div>
          <h4 className="text-lg font-semibold mb-6">
            Contact
          </h4>

          <p className="text-white/80 mb-3">
            <strong>Phone:</strong> 1300 827 286
          </p>

          <p className="text-white/80">
            <strong>Email:</strong> Catering@caterly.com.au
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h4 className="text-lg font-semibold mb-6">
            Quick Links
          </h4>

          <ul className="space-y-3 text-white/80">

            <li>
              <Link href="/">Home</Link>
            </li>

            <li>
              <Link href="/shop">Catering</Link>
            </li>

            <li>
              <Link href="/call">Contact</Link>
            </li>

          </ul>
        </div>

        {/* LEGAL */}
        <div>
          <h4 className="text-lg font-semibold mb-6">
            Legal
          </h4>

          <ul className="space-y-3 text-white/80">

            <li>
              <Link href="/terms">Terms & Conditions</Link>
            </li>

            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>

            <li>
              <Link href="/refund">Refund Policy</Link>
            </li>

            <li>
              <Link href="/delivery-policy">Delivery Policy</Link>
            </li>

            <li>
              <Link href="/food-safety">
                Food Safety & Allergen Disclaimer
              </Link>
            </li>

          </ul>
        </div>


        {/* SMALL NEWSLETTER */}
        <div>

          <h4 className="text-lg font-semibold mb-4">
            Newsletter
          </h4>

          <p className="text-sm text-white/70 mb-4">
            Get updates and exclusive offers.
          </p>

          <div className="flex">

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-black text-sm outline-none"
            />

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="bg-[#E03A3E] px-4 text-sm font-semibold"
            >
              {loading ? "..." : "Join"}
            </button>

          </div>

          {message && (
            <p className="text-xs mt-2 text-white/60">
              {message}
            </p>
          )}

        </div>

      </div>


      {/* FOLLOW + PAYMENTS */}
      <div className="border-t border-white/10 py-6">

        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center">



          {/* FOLLOW */}
          <div className="flex items-center gap-4 mb-4 md:mb-0">

            <span className="text-sm">Follow Us</span>

            <a href="https://www.facebook.com/profile.php?id=61584509317898" target="_blank" rel="noopener noreferrer" className="bg-white/20 p-2 rounded-full hover:bg-white/30">
              <FaFacebookF size={14} />
            </a>

            <a href="https://www.instagram.com/caterly.catering?igsh=dTJndGgwOG4xbnls" target="_blank" rel="noopener noreferrer" className="bg-white/20 p-2 rounded-full hover:bg-white/30">
              <FaInstagram size={14} />
            </a>

            <a href="https://www.youtube.com/@Caterly.Catering" target="_blank" rel="noopener noreferrer" className="bg-white/20 p-2 rounded-full hover:bg-white/30">
              <FaYoutube size={14} />
            </a>

            <a href="https://www.linkedin.com/company/caterly-catering/" target="_blank" rel="noopener noreferrer" className="bg-white/20 p-2 rounded-full hover:bg-white/30">
              <FaLinkedinIn size={14} />
            </a>

          </div>


          {/* PAYMENTS */}
          <div className="flex items-center gap-3">

            <span className="text-sm mr-2">We Accept</span>

            {/* <FaCcAmex size={32} /> */}
            <FaCcMastercard size={32} />
            <FaCcVisa size={32} />

          </div>

        </div>

      </div>


      {/* COPYRIGHT */}
      <div className="text-center text-sm text-white/60 pb-6">
        © 2025 Caterly. All Rights Reserved.
      </div>

    </footer>
  )
}