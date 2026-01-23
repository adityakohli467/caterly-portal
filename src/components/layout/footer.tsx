"use client"

import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#5B1919] text-white font-sans">
      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-10 py-14">
          <div className="grid grid-cols-3 gap-12 items-start">

            {/* LOGO + COPYRIGHT */}
            <div>
              <Image
                src="/assets/images/cat_logo.png"
                alt="Caterly Logo"
                width={160}
                height={70}
                className="mb-6"
              />
              <p className="text-sm text-white/80">
                2025 © All Rights Reserved Europa Pizza
              </p>
            </div>

            {/* CONTACT INFO */}
            <div>
              <h4 className="text-lg font-semibold mb-5">
                Contact Info
              </h4>
              <p className="mb-3">
                <span className="font-semibold">Phone:</span>{" "}
                1300 827 286
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                Catering@caterly.com.au
              </p>
            </div>

            {/* INFORMATION */}
            <div>
              <h4 className="text-lg font-semibold mb-5">
                Information
              </h4>
              <ul className="space-y-3">
                <li><Link href="#">Venue</Link></li>
                <li><Link href="#">About Us</Link></li>
                <li><Link href="#">Terms & Conditions</Link></li>
                <li><Link href="#">Contact Us</Link></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden px-6 py-10">
        {/* LOGO */}
        <div className="mb-8">
          <Image
            src="/assets/images/cat_logo.png"
            alt="Caterly Logo"
            width={150}
            height={65}
          />
        </div>

        {/* CONTACT INFO */}
        <div className="mb-10">
          <h4 className="text-xl font-semibold mb-4">
            Contact Info
          </h4>
          <p className="mb-4">
            <span className="font-semibold">Phone:</span>{" "}
            1300 827 286
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            Catering@caterly.com.au
          </p>
        </div>

        {/* INFORMATION */}
        <div className="mb-12">
          <h4 className="text-xl font-semibold mb-4">
            Information
          </h4>
          <ul className="space-y-4">
            <li><Link href="#">Venue</Link></li>
            <li><Link href="#">About Us</Link></li>
            <li><Link href="#">Terms & Conditions</Link></li>
            <li><Link href="#">Contact Us</Link></li>
          </ul>
        </div>

        {/* COPYRIGHT */}
        <p className="text-sm text-white/80">
          2025 © All Rights Reserved Europa Pizza
        </p>
      </div>
    </footer>
  )
}
