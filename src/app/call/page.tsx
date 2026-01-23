"use client";
import React from "react";

export default function ContactPage() {
  return (
    <div className="w-full bg-white text-black min-h-screen">

      {/* Main Contact Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">

        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* LEFT PANEL */}
          <div>
            <h1 className="text-3xl font-bold mb-4">Get in Touch</h1>
            <p className="text-gray-600 leading-relaxed mb-10 max-w-md">
              We'd love to hear from you. Whether you have questions about our services,
              need catering for an event, or just want to say hello, don't hesitate to reach out.
              Our team is here to help you create something extraordinary.
            </p>

            <div className="space-y-8 text-sm">

              {/* Address */}
              <div className="flex items-start gap-4">
                <span className="text-[#E03A3E] text-lg">📍</span>
                <div>
                  <div className="font-semibold">Address</div>
                  <div className="text-gray-600">75 Dorcas St, South Melbourne 3205</div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <span className="text-[#E03A3E] text-lg">📞</span>
                <div>
                  <div className="font-semibold">Phone</div>
                  <div className="text-gray-600">1300 827 286</div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <span className="text-[#E03A3E] text-lg">✉️</span>
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-gray-600">info@caterly.com.au</div>
                </div>
              </div>

              {/* Working Days */}
              <div className="flex items-start gap-4">
                <span className="text-[#E03A3E] text-lg">🕒</span>
                <div>
                  <div className="font-semibold">Working Days</div>
                  <div className="text-gray-600">Monday - Saturday</div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL – FORM */}
          <div>
            <h2 className="text-xl font-semibold mb-8">Contact Form</h2>

            <form className="space-y-6">

              {/* Full Name */}
              <div>
                <label className="text-sm font-medium block mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter Here"
                  className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium block mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="Enter Here"
                    className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Phone</label>
                  <input
                    type="tel"
                    placeholder="Enter Here"
                    className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <textarea
                  rows={4}
                  placeholder="Add Message"
                  className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                ></textarea>
              </div>

              {/* Captcha */}
              <div className="flex gap-4 items-center">
                <div className="border border-dashed border-[#E03A3E] text-[#333] px-6 py-3 rounded-md font-semibold tracking-wider">
                  3282
                </div>
                <input
                  type="text"
                  placeholder="Enter Captcha"
                  className="flex-1 border border-[#FDECEC] rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white py-3 rounded-lg font-semibold transition"
              >
                Submit
              </button>

            </form>
          </div>

        </div>
      </section>

      {/* MAP */}
      <section className="w-full h-[380px] mt-6">
        <iframe
          className="w-full h-full border-0"
          src="https://www.google.com/maps?q=South+Melbourne+3205&output=embed"
          loading="lazy"
        ></iframe>
      </section>

    </div>
  );
}
