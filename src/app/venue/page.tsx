import Link from "next/link";

export default function VenuePage() {
  return (
    <div className="w-full bg-white text-black min-h-screen">

      {/* Page Wrapper */}
      <main className="max-w-[1400px] mx-auto px-6 py-10">

        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <h1 className="text-3xl font-bold">Venue Hire</h1>

          <div className="flex items-center gap-4 w-full sm:w-auto">

            {/* Search */}
            <div className="relative w-full sm:w-[320px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E03A3E]">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search Products"
                className="
                  w-full
                  bg-white
                  border border-[#F1C6C6]
                  rounded-lg
                  pl-10 pr-4 py-2.5
                  text-sm
                  placeholder-gray-400
                  focus:outline-none
                  focus:ring-1
                  focus:ring-[#E03A3E]
                "
              />
            </div>

            {/* Filter */}
            <button
              className="
                flex items-center gap-2
                bg-white
                border border-[#F1C6C6]
                rounded-lg
                px-4 py-2.5
                text-[#E03A3E]
                text-sm font-medium
                hover:bg-[#FFF1F1]
                transition
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18l-7 8v5l-4 3v-8L3 5z" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-4 gap-10">

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">

            <button className="w-full bg-[#E03A3E] text-white py-2 rounded-md font-medium hover:bg-[#cc3236]">
              All Menu
            </button>

            <div>
              <h4 className="font-semibold mb-3">Venues</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer">Venue 1</li>
                <li className="px-3 py-2 bg-[#FFF1F1] text-[#E03A3E] rounded-md font-medium cursor-pointer">
                  Venue 2
                </li>
                <li className="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer">Venue 3</li>
                <li className="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer">Venue 4</li>
              </ul>
            </div>

          </aside>

          {/* Main Content */}
          <section className="lg:col-span-3">

            <h2 className="text-2xl font-bold mb-1">Venue 2</h2>
            <p className="text-gray-600 mb-5">
              Crafted with passion in South Melbourne. Perfect for up to 200 guests.
            </p>

            {/* Main Image */}
            <div className="rounded-xl overflow-hidden mb-6 bg-gray-100">
              <img
                src="/assets/images/c24.jpg"
                alt="Venue"
                className="w-full h-[420px] object-cover"
              />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                "High ceilings",
                "Up to 200 guests",
                "7 TVs",
                "Bar",
                "Buffet & Plated options",
                "Private rooms",
                "High-speed Wi-Fi",
                "Large windows",
                "Event manager support",
              ].map((tag, i) => (
                <span
                  key={i}
                  className="bg-[#EEF2FF] text-[#3B5BDB] px-3 py-1 rounded-md text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-10 text-sm text-gray-700">
              <div>
                <strong className="text-black">📍 Address</strong>
                <p>75 Dorcas St, South Melbourne</p>
              </div>
              <div>
                <strong className="text-black">⏰ Timings</strong>
                <p>Morning, Afternoon, Evening</p>
              </div>
              <div>
                <strong className="text-black">🚗 Parking</strong>
                <p>On-street + under-cover paid parking (Discounted)</p>
              </div>
              <div>
                <strong className="text-black">❤️ Access</strong>
                <p>75 Dorcas St, South Melbourne</p>
              </div>
            </div>

            {/* Venue Sections */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Full Venue", img: "/assets/images/c25.jpg" },
                { title: "Indoor Section", img: "/assets/images/c26.jpg" },
                { title: "Outdoor Section", img: "/assets/images/c27.jpg" },
              ].map((item, i) => (
                <div key={i} className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                  <img src={item.img} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      We start with carefully selected lots – single origins and trusted micro-lots.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">$25.90</span>
                      <Link href="/venue/view" legacyBehavior>
                        <a className="bg-[#E03A3E] text-white px-4 py-1.5 rounded-md text-sm hover:bg-[#cc3236] transition">View</a>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}
