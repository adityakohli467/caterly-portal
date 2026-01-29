"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  // Gallery state
  const galleryImages = [
    "/assets/images/c10.jpg",
    "/assets/images/c11.jpg",
    "/assets/images/c12.jpg",
    "/assets/images/c13.jpg"
  ]
  const [currentIndex, setCurrentIndex] = useState(0)

  const visibleImages = galleryImages.slice(currentIndex, currentIndex + 3)

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex + 3 < galleryImages.length) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <div className="w-full overflow-x-hidden">

      {/* ================================================= */}
      {/* 1. HERO SECTION */}
      {/* ================================================= */}
      <section className="relative w-full h-[500px] md:h-[788px] overflow-hidden bg-white">

        {/* BACKGROUND IMAGE */}
        <Image
          src="/assets/images/log.png"
          alt="Caterly Hero Background"
          fill
          priority
          className="object-cover"
        />

        {/* CONTENT */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="flex flex-col items-center text-center max-w-[900px] px-4 md:px-6 gap-4 md:gap-[24px]">

            {/* HEADING */}
            <h1 className="text-[32px] md:text-[56px] leading-[1.2] font-semibold text-black">
              Crafting{" "}
              <span className="text-[#E03A3E] italic font-semibold">
                unforgettable
              </span>
              <br />
              event experiences.
            </h1>

            {/* SUBTEXT */}
            <p className="text-[14px] md:text-[16px] text-[#6B6B6B] max-w-[620px] px-4">
              Elevating every event with refined flavors, flawless presentation,
              and enduring impressions.
            </p>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mt-2 w-full sm:w-auto px-4">
              <button
                className="
            bg-[#E03A3E]
            hover:bg-[#cc3236]
            text-white
            px-6
            py-3
            rounded-md
            text-sm
            font-semibold
            w-full sm:w-auto
          "
              >
                Book Now
              </button>

              <Link href="/shop" passHref legacyBehavior>
                <button
                  className="
              bg-white
              border
              border-[#E6E6E6]
              hover:bg-gray-100
              text-black
              px-6
              py-3
              rounded-md
              text-sm
              font-semibold
              cursor-pointer
              w-full sm:w-auto
            "
                >
                  View Menu
                </button>
              </Link>
            </div>

          </div>
        </div>
      </section>



      {/* ================================================= */}
      {/* 2. WHO WE ARE */}
      {/* ================================================= */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[120px]">

          {/* SECTION HEADER */}
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-[24px] md:text-[32px] font-semibold text-black mb-3 md:mb-4">
              Our Services
            </h2>
            <p className="text-[14px] md:text-[16px] text-[#6B6B6B] max-w-[520px] mx-auto px-4">
              From intimate gatherings to large scale events,
              <br className="hidden md:block" />
              we've got you covered.
            </p>
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-[64px]">

            {/* CARD 1 */}
            <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 text-center">
              <div className="relative h-[220px] md:h-[260px] rounded-xl overflow-hidden mb-4 md:mb-6">
                <Image
                  src="/assets/images/c1.png"
                  alt="Catering Services"
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-[18px] font-semibold text-[#A61E2D] mb-3">
                Catering Services
              </h3>

              <p className="text-[14px] text-[#6B6B6B] leading-relaxed mb-6">
                Professional catering for meetings,
                workshops, and business events with
                premium-quality food.
              </p>

              <Link href="/shop" passHref legacyBehavior>
                <button className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-6 py-2 rounded-md text-sm font-semibold w-full">
                  Book Now
                </button>
              </Link>
            </div>

            {/* CARD 2 */}
            <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 text-center">
              <div className="relative h-[220px] md:h-[260px] rounded-xl overflow-hidden mb-4 md:mb-6">
                <Image
                  src="/assets/images/c2.jpg"
                  alt="Venue Bookings"
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-[18px] font-semibold text-[#A61E2D] mb-3">
                Venue Bookings
              </h3>

              <p className="text-[14px] text-[#6B6B6B] leading-relaxed mb-6">
                Professional catering for meetings,
                workshops, and business events with
                premium-quality food.
              </p>

              <Link href="/venue" passHref legacyBehavior>
                <button className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-6 py-2 rounded-md text-sm font-semibold w-full">
                  Book Now
                </button>
              </Link>
            </div>

            {/* CARD 3 */}
            <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 text-center">
              <div className="relative h-[220px] md:h-[260px] rounded-xl overflow-hidden mb-4 md:mb-6">
                <Image
                  src="/assets/images/c3.jpg"
                  alt="Staff Hire"
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-[18px] font-semibold text-[#A61E2D] mb-3">
                Staff Hire
              </h3>

              <p className="text-[14px] text-[#6B6B6B] leading-relaxed mb-6">
                Professional catering for meetings,
                workshops, and business events with
                premium-quality food.
              </p>

              <Link href="/staff" passHref legacyBehavior>
                <button className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-6 py-2 rounded-md text-sm font-semibold w-full">
                  Book Now
                </button>
              </Link>
            </div>

          </div>
        </div>
      </section>


      {/* ================================================= */}
      {/* 3. CATERING EXCELLENCE */}
      {/* ================================================= */}
      <section className="bg-white py-12 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[120px]">

          {/* HEADER */}
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-[28px] md:text-[36px] font-semibold text-black mb-3 md:mb-4">
              Our Catering Services
            </h2>
            <p className="text-[14px] md:text-[16px] text-[#6B6B6B] max-w-[640px] mx-auto leading-relaxed px-4">
              From intimate gatherings to large corporate events, we offer a range
              <br className="hidden md:block" />
              of catering services to meet your needs.
            </p>
          </div>

          {/* CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-x-[40px] md:gap-y-[64px]">

            {[
              {
                title: "All Day",
                desc:
                  "Make your special day unforgettable with our customized wedding menus and professional service.",
                img: "/assets/images/c4.jpg"
              },
              {
                title: "All Day",
                desc:
                  "Make your special day unforgettable with our customized wedding menus and professional service.",
                img: "/assets/images/c5.jpg"
              },
              {
                title: "All Day",
                desc:
                  "Make your special day unforgettable with our customized wedding menus and professional service.",
                img: "/assets/images/c4.jpg"
              },
              {
                title: "Grazing Tables",
                desc:
                  "Stunning grazing tables that combine visual appeal with delicious variety for your guests.",
                img: "/assets/images/c6.jpg"
              },
              {
                title: "Breakfast Catering",
                desc:
                  "Start your day right with our fresh, energizing breakfast options for meetings and events.",
                img: "/assets/images/c7.jpg"
              },
              {
                title: "Finger Food",
                desc:
                  "Delicious bite-sized delights perfect for cocktail parties and networking events.",
                img: "/assets/images/c8.jpg"
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                {/* IMAGE */}
                <div className="relative h-[240px] w-full">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <h3 className="text-[18px] font-semibold text-black mb-3">
                    {item.title}
                  </h3>

                  <p className="text-[14px] text-[#6B6B6B] leading-relaxed mb-4">
                    {item.desc}
                  </p>

                  <button className="text-[#E03A3E] text-sm font-semibold flex items-center gap-1 hover:underline">
                    Read more
                    <span className="text-lg">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CTA BUTTON */}
          <div className="flex justify-center mt-20">
            <Link href="/shop" passHref legacyBehavior>
              <button className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-8 py-3 rounded-md text-sm font-semibold">
                View Catering Menu
              </button>
            </Link>
          </div>

        </div>
      </section>

      {/* ================================================= */}
      {/* 4. SERVICES / OFFERINGS */}
      {/* ================================================= */}
      <section
        className="relative w-full py-12 md:py-20 lg:py-[120px] bg-white overflow-hidden"
        style={{
          backgroundImage: "url('/assets/images/frame.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 md:gap-12 lg:gap-[80px]">

            {/* LEFT CONTENT */}
            <div>
              <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-semibold text-black mb-4 md:mb-6">
                Who we are
              </h2>

              <p className="text-[14px] md:text-[15px] text-[#333333] leading-relaxed mb-3 md:mb-4 max-w-[520px]">
                For over 15 years, we've been crafting exceptional catering experiences
                with a focus on fresh, seasonal ingredients and impeccable service.
                Our team of passionate culinary experts creates memorable food
                experiences for every occasion.
              </p>

              <p className="text-[14px] md:text-[15px] text-[#333333] leading-relaxed max-w-[520px]">
                We believe that great food brings people together. Whether you're
                planning a corporate lunch, an elegant wedding, or an intimate dinner
                party, we approach each event with creativity, attention to detail,
                and a commitment to exceeding your expectations.
              </p>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative w-full h-[280px] md:h-[380px] lg:w-[652px] rounded-lg overflow-hidden">
              <Image
                src="/assets/images/c9.jpg"
                alt="Product Image"
                fill
                className="object-cover"
              />
            </div>



          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* 5. EXPERIENCE SECTION */}
      {/* ================================================= */}
      <section className="bg-white py-12 md:py-[120px]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[120px]">

          {/* HEADER */}
          <div className="text-center mb-12 md:mb-[80px]">
            <h2 className="text-[28px] md:text-[36px] font-semibold text-black mb-3 md:mb-4">
              Why Choose Us
            </h2>
            <p className="text-[14px] md:text-[16px] text-[#6B6B6B] max-w-[640px] mx-auto px-4">
              From intimate gatherings to large scale events, we've got you covered
            </p>
          </div>

          {/* FEATURES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-[80px] text-center">

            {/* ITEM 1 */}
            <div className="flex flex-col items-center">
              <div className="w-[64px] h-[64px] rounded-full bg-[#EEF3FF] flex items-center justify-center mb-6">
                {/* Truck Icon */}
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2F5BFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>

              <h3 className="text-[18px] font-semibold text-black mb-2">
                Delivery Available
              </h3>
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed max-w-[260px]">
                Reliable delivery within 25 miles of our kitchen
              </p>
            </div>

            {/* ITEM 2 */}
            <div className="flex flex-col items-center">
              <div className="w-[64px] h-[64px] rounded-full bg-[#EEF3FF] flex items-center justify-center mb-6">
                {/* Handshake Icon */}
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2F5BFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 3h5v5" />
                  <path d="M8 3H3v5" />
                  <path d="M21 3l-7 7" />
                  <path d="M3 3l7 7" />
                  <path d="M12 14l-2 2a4 4 0 0 1-6-6l2-2" />
                  <path d="M12 14l2 2a4 4 0 0 0 6-6l-2-2" />
                </svg>
              </div>

              <h3 className="text-[18px] font-semibold text-black mb-2">
                Committed to Value
              </h3>
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed max-w-[260px]">
                Premium quality at competitive prices
              </p>
            </div>

            {/* ITEM 3 */}
            <div className="flex flex-col items-center">
              <div className="w-[64px] h-[64px] rounded-full bg-[#EEF3FF] flex items-center justify-center mb-6">
                {/* Leaf Icon */}
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2F5BFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 20A7 7 0 0 1 9 6c0-3 5-3 5-6 0 0 5 4 5 10a7 7 0 0 1-8 7z" />
                  <path d="M12 20v-8" />
                </svg>
              </div>

              <h3 className="text-[18px] font-semibold text-black mb-2">
                Freshest Ingredients
              </h3>
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed max-w-[260px]">
                Locally sourced seasonal produce
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ================================================= */}
      {/* 6. TESTIMONIALS */}
      {/* ================================================= */}
      <section className="py-12 md:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 text-center">

          {/* Heading */}
          <h2 className="text-[28px] md:text-[36px] font-semibold text-black mb-3 md:mb-4">
            Event Gallery
          </h2>

          {/* Subheading */}
          <p className="text-[14px] md:text-[16px] text-[#6B6B6B] max-w-[520px] mx-auto mb-8 md:mb-16 px-4">
            Browse our portfolio of past events and get inspired for your next gathering.
          </p>

          {/* Gallery Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-16">
            {visibleImages.map((img, idx) => (
              <div key={idx} className="relative h-[280px] md:h-[420px] rounded-xl overflow-hidden">
                <Image
                  src={img}
                  alt={`Gallery image ${currentIndex + idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4">

            {/* Prev */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-12 h-12 rounded-lg bg-[#F2F2F2] flex items-center justify-center text-[#9A9A9A] hover:bg-[#E6E6E6] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>

            {/* Next */}
            <button
              onClick={handleNext}
              disabled={currentIndex + 3 >= galleryImages.length}
              className="w-12 h-12 rounded-lg bg-[#E03A3E] flex items-center justify-center text-white hover:bg-[#cc3236] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>

          </div>

        </div>
      </section>


      {/* ================================================= */}
      {/* 7. GALLERY */}
      {/* ================================================= */}
      <section className="py-12 md:py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">

          {/* CTA Wrapper */}
          <div
            className="
        relative
        rounded-2xl
        overflow-hidden
        px-4 md:px-6
        py-12 md:py-20
        lg:px-16
        text-center
        flex
        items-center
        justify-center
        min-h-[260px]
      "
            style={{
              backgroundImage: "url('/assets/images/f2.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-[#3b0d1b]/90" />

            {/* Content */}
            <div className="relative z-10 max-w-[900px] mx-auto">

              {/* Heading */}
              <h2 className="text-[24px] md:text-[36px] lg:text-[44px] font-semibold text-white mb-3 md:mb-4 leading-tight">
                Let&apos;s Make Your Event Delicious
              </h2>

              {/* Description */}
              <p className="text-white/80 text-[14px] md:text-[16px] lg:text-[17px] mb-6 md:mb-10 px-4">
                Ready to create an unforgettable culinary experience for your guests? Contact us today to start planning.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                <button
                  className="
              bg-white
              text-black
              px-8
              py-3
              rounded-md
              text-sm
              font-semibold
              hover:bg-gray-100
              transition
            "
                >
                  Request a Quote
                </button>

                <button
                  className="
              bg-[#E03A3E]
              text-white
              px-8
              py-3
              rounded-md
              text-sm
              font-semibold
              hover:bg-[#cc3236]
              transition
            "
                >
                  Call Now
                </button>

              </div>
            </div>
          </div>

        </div>
      </section>



      {/* ================================================= */}
      {/* 8. CALL TO ACTION */}
      {/* ================================================= */}
      {/* <section className="py-12 md:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 items-stretch border rounded-xl overflow-hidden">

            <div className="p-6 md:p-10">

  
              <h2 className="text-[24px] md:text-[28px] font-semibold text-black mb-2">
                Request a Quote
              </h2>
              <p className="text-gray-600 text-sm mb-6 md:mb-8 max-w-md">
                Fill out the form and our team will get back to you within 24 hours to
                discuss your catering needs.
              </p>

     
              <form className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-black">First Name</label>
                    <input
                      type="text"
                      placeholder="Enter Here"
                      className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm focus:outline-none focus:border-[#E03A3E]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter Here"
                      className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm focus:outline-none focus:border-[#E03A3E]"
                    />
                  </div>
                </div>

                
                <div>
                  <label className="text-sm font-medium text-black">Email</label>
                  <input
                    type="email"
                    placeholder="Enter Here"
                    className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm focus:outline-none focus:border-[#E03A3E]"
                  />
                </div>

              
                <div>
                  <label className="text-sm font-medium text-black">Phone</label>
                  <input
                    type="tel"
                    placeholder="Enter Here"
                    className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm focus:outline-none focus:border-[#E03A3E]"
                  />
                </div>

              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-black">
                      Delivery Time
                    </label>
                    <select className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm text-gray-600 focus:outline-none focus:border-[#E03A3E]">
                      <option>Select</option>
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      placeholder="Enter Here"
                      className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm focus:outline-none focus:border-[#E03A3E]"
                    />
                  </div>
                </div>

           
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-black">
                      Select Event Type
                    </label>
                    <select className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm text-gray-600 focus:outline-none focus:border-[#E03A3E]">
                      <option>Select</option>
                      <option>Corporate</option>
                      <option>Wedding</option>
                      <option>Private Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">
                      Suitable Contact Time
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Here"
                      className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm focus:outline-none focus:border-[#E03A3E]"
                    />
                  </div>
                </div>

             
                <div>
                  <label className="text-sm font-medium text-black">Message</label>
                  <textarea
                    placeholder="Tell us about your event"
                    rows={4}
                    className="mt-1 w-full rounded-md border border-[#F2CACA] px-4 py-3 text-sm focus:outline-none focus:border-[#E03A3E]"
                  />
                </div>

             
                <div className="flex items-center gap-4">
                  <div className="border-2 border-dashed border-[#E03A3E] px-6 py-3 text-black font-semibold rounded-md">
                    3282
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Captcha"
                    className="flex-1 rounded-md border border-[#F2CACA] px-4 py-3 text-sm focus:outline-none focus:border-[#E03A3E]"
                  />
                </div>

               
                <button
                  type="submit"
                  className="
              w-full
              bg-[#E03A3E]
              hover:bg-[#cc3236]
              text-white
              py-4
              rounded-md
              text-sm
              font-semibold
              transition
            "
                >
                  Submit
                </button>

              </form>
            </div>

            <div className="relative hidden lg:block">
              <img
                src="/assets/images/c14.jpg"
                alt="Chef preparing food"
                className="w-full h-full object-cover"
              />
            </div>


          </div>
        </div>
      </section> */}

    </div>
  )
}
