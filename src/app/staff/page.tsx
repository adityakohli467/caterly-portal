"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function StaffPage() {
  const [comments, setComments] = useState("");

  const roles = [
    { title: "Hire Waiters", count: 9 },
    { title: "Hire Chefs", count: 9 },
    { title: "Hire Managers", count: 9 },
  ];

  const services = [
    "Wait Staff (Weekday) – $49.50/hr (Min. 3 hours)",
    "Wait Staff (Weekend) – $59.50/hr (Min. 3 hours)",
    "Wait Staff (Night) – $69.50/hr (Min. 3 hours)",
  ];

  return (
    <div className="w-full bg-white text-black min-h-screen">

      <main className="max-w-[1200px] mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div className="w-full md:w-1/3 rounded-xl overflow-hidden">
            <Image
              src="/assets/images/c29.jpg"
              alt="Staff"
              width={400}
              height={300}
              className="object-cover w-full h-[260px]"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-[#E03A3E]">Staff Hire</span> for your events
            </h1>
            <p className="text-gray-600 mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi.
            </p>

            <div className="text-sm text-gray-700 space-y-1">
              <div><strong>Hire Details</strong></div>
              <ul className="list-disc list-inside">
                <li>Waiters</li>
                <li>Event Managers</li>
                <li>Chefs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Select Role */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Select Role</h2>
          <p className="text-gray-500 text-sm mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi.
          </p>

          {roles.map((role, idx) => (
            <div key={idx} className="mb-8 border rounded-lg p-4">

              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">
                  {role.title} ({role.count})
                </h3>
                <span className="text-[#E03A3E] font-semibold">Amount: $333</span>
              </div>

              <p className="text-sm text-blue-600 mb-4">
                This product has a minimum quantity of 3
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="accent-[#E03A3E]" />
                      <span className="text-sm">{service}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="w-6 h-6 border rounded text-sm">-</button>
                      <span className="text-sm">3</span>
                      <button className="w-6 h-6 border rounded text-sm">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Comments */}
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 min-h-[120px] text-base focus:outline-none focus:ring-2 focus:ring-[#E03A3E]"
            placeholder="Add Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />

          {/* Subtotal */}
          <div className="flex justify-between items-center mt-6 text-[#E03A3E] font-semibold">
            <span>Sub Total:</span>
            <span>$999</span>
          </div>

          {/* Add to Cart */}
          <button
            className="mt-6 bg-[#E03A3E] hover:bg-[#cc3236] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            🛒 Add to Cart
          </button>
        </div>

      </main>

      {/* You may also like */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-[1200px] mx-auto px-6">

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">You may also Like</h3>
            <button className="text-[#E03A3E] text-sm font-medium">View All</button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <img
                  src={`/assets/images/reco-${item}.jpg`}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-semibold">All Day</h4>
                  <p className="text-sm text-gray-500 mb-3">
                    We start with carefully selected lots single origins and trusted microlots.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">$25.90</span>
                    <button className="bg-[#E03A3E] text-white px-4 py-1.5 rounded-md text-sm">
                      🛒 Shop Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
