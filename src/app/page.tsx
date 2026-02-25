"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Review {
  review_id: number
  reviewer_name: string
  rating: number
  review_text: string
  created_at: string
}

export default function HomePage() {
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ reviewer_name: "", rating: 5, review_text: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get("/store/reviews/general")
        setReviews(res.data.reviews || res.data || [])
      } catch (error) {
        console.error("Failed to fetch reviews:", error)
        setReviews([])
      } finally {
        setReviewsLoading(false)
      }
    }
    fetchReviews()
  }, [])

  const refetchReviews = async () => {
    try {
      const res = await api.get("/store/reviews/general")
      setReviews(res.data.reviews || res.data || [])
    } catch (error) {
      console.error("Failed to refetch reviews:", error)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewForm.reviewer_name.trim() || !reviewForm.review_text.trim()) {
      toast.error("Please fill in all fields.")
      return
    }
    if (reviewForm.review_text.trim().length < 10) {
      toast.error("Please write at least 10 characters for your review.")
      return
    }
    setSubmittingReview(true)
    try {
      await api.post("/store/reviews/general", {
        reviewer_name: reviewForm.reviewer_name.trim(),
        rating: reviewForm.rating,
        review_text: reviewForm.review_text.trim(),
      })
      toast.success("Thank you! Your review has been submitted.")
      setReviewForm({ reviewer_name: "", rating: 5, review_text: "" })
      setShowReviewForm(false)
      await refetchReviews()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit review. Please try again.")
    } finally {
      setSubmittingReview(false)
    }
  }

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
      {/* CUSTOMER REVIEWS */}
      {/* ================================================= */}
      <section className="bg-[#FFF8F8] py-12 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[120px]">

          {/* HEADER */}
          <div className="flex items-start justify-between mb-12 md:mb-16">
            <div>
              <h2 className="text-[28px] md:text-[36px] font-semibold text-black mb-3 md:mb-4">
                What Our Clients Say
              </h2>
              <p className="text-[14px] md:text-[16px] text-[#6B6B6B] max-w-[520px]">
                Real stories from happy customers who chose Caterly for their events.
              </p>
            </div>
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-6 py-2.5 rounded-md text-sm font-semibold transition whitespace-nowrap"
            >
              Write a Review
            </button>
          </div>

          {reviewsLoading ? (
            <div className="text-center py-12 text-[#6B6B6B]">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-[#6B6B6B]">No reviews yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {reviews.slice(0, 6).map((review, idx) => (
                <div
                  key={review.review_id || idx}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition"
                >
                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={i < review.rating ? "#E03A3E" : "#E6E6E6"}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-[14px] md:text-[15px] text-[#333] leading-relaxed mb-6 line-clamp-4">
                    "{review.review_text}"
                  </p>

                  {/* Reviewer */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E03A3E]/10 flex items-center justify-center">
                      <span className="text-[#E03A3E] font-semibold text-sm">
                        {review.reviewer_name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black">
                        {review.reviewer_name}
                      </p>
                      {review.created_at && (
                        <p className="text-xs text-[#9A9A9A]">
                          {new Date(review.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}


        </div>
      </section>

      {/* REVIEW POPUP MODAL */}
      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowReviewForm(false)
              setReviewForm({ reviewer_name: "", rating: 5, review_text: "" })
            }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-[520px] bg-white rounded-2xl p-6 md:p-8 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200">

            {/* Close Button */}
            <button
              onClick={() => {
                setShowReviewForm(false)
                setReviewForm({ reviewer_name: "", rating: 5, review_text: "" })
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500"
            >
              ✕
            </button>

            <h3 className="text-[20px] font-semibold text-black mb-6">Share Your Experience</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-black block mb-2">Your Name</label>
                <input
                  type="text"
                  value={reviewForm.reviewer_name}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                  required
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="text-sm font-medium text-black block mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill={star <= reviewForm.rating ? "#E03A3E" : "#E6E6E6"}
                        xmlns="http://www.w3.org/2000/svg"
                        className="cursor-pointer"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="text-sm font-medium text-black block mb-2">Your Review</label>
                <textarea
                  rows={4}
                  value={reviewForm.review_text}
                  onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                  placeholder="Tell us about your experience..."
                  className={`w-full border rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 resize-none focus:outline-none focus:ring-1 ${reviewForm.review_text.length > 0 && reviewForm.review_text.length < 10
                    ? "border-[#E03A3E] focus:ring-[#E03A3E]"
                    : "border-[#FDECEC] focus:ring-[#E03A3E]"
                    }`}
                  required
                />
                {reviewForm.review_text.length > 0 && reviewForm.review_text.length < 10 && (
                  <p className="text-xs text-[#E03A3E] mt-1">
                    Please write at least 10 characters ({reviewForm.review_text.length}/10)
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-6 py-2.5 rounded-md text-sm font-semibold transition disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false)
                    setReviewForm({ reviewer_name: "", rating: 5, review_text: "" })
                  }}
                  className="border border-[#E6E6E6] text-black px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ================================================= */}
      {/* 6. TESTIMONIALS */}
      {/* ================================================= */}
      <section className="py-12 md:py-2 bg-white">
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
