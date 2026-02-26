"use client"

import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-black text-white font-sans">
      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block border-t border-white/10">
        <div className="max-w-7xl mx-auto px-10 py-16">
          <div className="grid grid-cols-4 gap-12">

            {/* LOGO + ABOUT */}
            <div>
              <Image
                src="/assets/images/cat.svg"
                alt="Caterly Logo"
                width={160}
                height={70}
                className="mb-6"
              />
              <p className="text-sm text-white/70 leading-relaxed">
                Premium catering services delivered fresh and on time.
                We make every event memorable with quality food and service.
              </p>
            </div>

            {/* CONTACT INFO */}
            <div>
              <h4 className="text-lg font-semibold mb-6 tracking-wide">
                Contact
              </h4>
              <p className="mb-3 text-white/80">
                <span className="font-semibold">Phone:</span> 1300 827 286
              </p>
              <p className="text-white/80">
                <span className="font-semibold">Email:</span> Catering@caterly.com.au
              </p>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h4 className="text-lg font-semibold mb-6 tracking-wide">
                Quick Links
              </h4>
              <ul className="space-y-3 text-white/80">
                <li>
                  <Link href="/" className="hover:text-white transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-white transition">
                    Catering
                  </Link>
                </li>
                <li>
                  <Link href="/call" className="hover:text-white transition">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/delivery" className="hover:text-white transition">
                    Delivery Information
                  </Link>
                </li>
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h4 className="text-lg font-semibold mb-6 tracking-wide">
                Legal
              </h4>
              <ul className="space-y-3 text-white/80">
                <li>
                  <Link href="/terms" className="hover:text-white transition">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/delivery" className="hover:text-white transition">
                    Delivery Information
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* BOTTOM BAR */}
          <div className="mt-14 pt-6 border-t border-white/10 text-center text-sm text-white/60">
            © 2025 Caterly. All Rights Reserved.
          </div>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden border-t border-white/10">
        <div className="px-6 py-12">

          {/* LOGO */}
          <div className="mb-8">
            <Image
              src="/assets/images/cat.svg"
              alt="Caterly Logo"
              width={150}
              height={65}
            />
          </div>

          {/* CONTACT */}
          <div className="mb-10">
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="mb-3 text-white/80">
              <span className="font-semibold">Phone:</span> 1300 827 286
            </p>
            <p className="text-white/80">
              <span className="font-semibold">Email:</span> Catering@caterly.com.au
            </p>
          </div>

          {/* LINKS */}
          <div className="mb-10">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
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
              <li>
                <Link href="/delivery">Delivery Information</Link>
              </li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="mb-12">
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-white/80">
              <li>
                <Link href="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/delivery">Delivery Information</Link>
              </li>
            </ul>
          </div>

          {/* COPYRIGHT */}
          <div className="border-t border-white/10 pt-6 text-sm text-white/60">
            © 2025 Caterly. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}