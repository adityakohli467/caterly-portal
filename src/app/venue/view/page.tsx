"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function VenueDetailPage() {
  const [selectedTiming, setSelectedTiming] = useState("day");
  const [comments, setComments] = useState("");

  const timings = [
    { key: "day", label: "Day (7am-12pm & 2pm-5pm)", price: 26.5 },
    { key: "evening", label: "Evening (5pm-11pm)", price: 26.5 },
    { key: "extended", label: "Extended Hours", price: 26.5 },
  ];

  const features = [
    "High ceilings",
    "Up to 200 guests",
    "7 TVs",
    "Event manager support",
    "Private rooms",
    "High-speed Wi-Fi",
    "Large windows",
  ];

  return (
    <div className="w-full bg-white text-black min-h-screen">
      <main className="max-w-[1200px] mx-auto px-6 py-12">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-10">

          {/* Left */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Venue Hire</h1>
            <p className="text-gray-600 mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi.
            </p>

            <div className="rounded-xl overflow-hidden mb-6 bg-gray-100">
              <Image
                src="/assets/images/c28.jpg"
                alt="Venue"
                width={600}
                height={400}
                className="object-cover w-full h-[300px]"
              />
            </div>

            {/* Feature Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {features.map((feature, i) => (
                <span
                  key={i}
                  className="bg-[#EEF2FF] text-[#3B5BDB] px-4 py-1.5 rounded-lg text-sm font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Full Venue</h2>
            <p className="text-gray-600 mb-3">
              We start with carefully selected lots single origins and trusted microlots.
              Each shipment is inspected for quality.
            </p>
            <div className="text-2xl font-bold text-[#E03A3E] mb-4">$26.50</div>

            <div className="mb-6">
              <div className="font-semibold mb-2">Item Details</div>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                <li>Raspberry glaze</li>
                <li>Poppy Seed Muffin</li>
                <li>Item 3</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Timings */}
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4">Select Timings</h3>

          <div className="flex flex-col gap-3 mb-6">
            {timings.map((timing) => (
              <label
                key={timing.key}
                className="flex items-center justify-between cursor-pointer bg-white p-3 rounded-lg border hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTiming === timing.key}
                    onChange={() => setSelectedTiming(timing.key)}
                    className="accent-[#E03A3E] w-5 h-5"
                  />
                  <span className="text-base font-medium">{timing.label}</span>
                </div>
                <span className="text-[#E03A3E] font-semibold">
                  ${timing.price.toFixed(2)}
                </span>
              </label>
            ))}
          </div>

          <hr className="my-6 border-[#E03A3E]" />

          {/* Comments */}
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 min-h-[120px] text-base focus:outline-none focus:ring-2 focus:ring-[#E03A3E]"
            placeholder="Add Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />

          {/* Add to Cart */}
          <button
            className="mt-6 flex items-center gap-2 bg-[#E03A3E] hover:bg-[#cc3236] text-white px-8 py-3 rounded-lg font-semibold text-lg"
          >
            🛒 Add to Cart
          </button>
        </div>

      </main>
    </div>
  );
}
