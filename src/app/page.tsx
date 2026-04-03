"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useQuoteModalStore } from "@/store/quote-modal"
import { getProductImageUrls } from "@/lib/product-utils"

interface Review {
  review_id: number
  reviewer_name: string
  rating: number
  review_text: string
  created_at: string
}

export default function HomePage() {
  const openQuoteModal = useQuoteModalStore((s) => s.open)
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
    "/assets/images/c50.png",
    "/assets/images/c54.png",
    "/assets/images/c51.png",
    "/assets/images/c55.png",
    "/assets/images/c52.png",
    "/assets/images/c53.png",


  ]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [categoryImages, setCategoryImages] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const response = await api.get("/store/products", { params: { limit: 100 } })
        const products = response.data.products || []

        const mapping: Record<string, string[]> = {}
        const searchTerms = ["breakfast", "morning tea", "lunch", "platter", "finger food", "cake"]

        searchTerms.forEach(term => {
          // Find products matching the term and collect unique image URLs
          const matches = products.filter((p: any) =>
            (p.show_in_storefront !== false && p.show_in_storefront !== 0) && (
              p.product_name?.toLowerCase().includes(term) ||
              p.product_description?.toLowerCase().includes(term)
            )
          )
          const urls = matches.flatMap((p: any) => getProductImageUrls(p))
          // Filter to unique URLs only
          mapping[term] = Array.from(new Set(urls))
        })
        setCategoryImages(mapping)
      } catch (err) {
        console.error("Failed to fetch category products:", err)
      }
    }
    fetchCategoryProducts()
  }, [])

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

  // Catering card slideshow images
  const corporateImages = [
    "/assets/images/c42.png",
    "/assets/images/c43.png",
    "/assets/images/c44.png",
    "/assets/images/c45.png",
  ]
  const eventImages = [
    "/assets/images/c46.png",
    "/assets/images/c47.png",
    "/assets/images/c48.png",
    "/assets/images/c50.png",
    "/assets/images/c51.png",
  ]
  const weddingImages = [
    "/assets/images/c52.png",
    "/assets/images/c53.png",
    "/assets/images/c54.png",
    "/assets/images/c55.png",
    "/assets/images/c56.png",
  ]

  const ServiceCard = ({ title, subtitle, description, points, images }: { title: string, subtitle: string, description: string, points: string[], images: string[] }) => {
    const [index, setIndex] = useState(0)

    useEffect(() => {
      if (!images || images.length <= 1) return
      const t = setInterval(() => setIndex(i => (i + 1) % images.length), 2000)
      return () => clearInterval(t)
    }, [images.length])

    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 text-center flex flex-col group transition-all duration-300">
        <div className="relative h-[220px] md:h-[260px] rounded-xl overflow-hidden mb-4 md:mb-6">
          {images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={title}
              fill
              className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>

        <h3 className="text-[18px] font-semibold text-[#A61E2D] mb-2">{title}</h3>
        <p className="text-[13px] font-medium text-black mb-3">{subtitle}</p>
        <p className="text-[14px] text-[#6B6B6B] leading-relaxed mb-6 flex-grow">{description}</p>

        <ul className="text-left text-[14px] text-[#6B6B6B] mb-6 space-y-1">
          {points.map((p, i) => <li key={i}>✔ {p}</li>)}
        </ul>

        <div className="mt-auto">
          <Link href="/shop" passHref legacyBehavior>
            <button className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-6 py-2 rounded-md text-sm font-semibold w-full transition-colors">
              Order Now
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const CategoryCard = ({ item, dynamicImages }: { item: any, dynamicImages: string[] }) => {
    const [index, setIndex] = useState(0)
    // Placeholder first, then dynamic ones
    const allImages = dynamicImages.length > 0 ? [item.img, ...dynamicImages] : [item.img]

    useEffect(() => {
      if (allImages.length <= 1) return
      const t = setInterval(() => setIndex(i => (i + 1) % allImages.length), 2000)
      return () => clearInterval(t)
    }, [allImages.length])

    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full group transition-all duration-300">
        <div className="relative h-[240px] w-full bg-gray-100">
          {allImages.map((src, i) => (
            <Image
              key={src + i}
              src={src}
              alt={item.title}
              fill
              className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-[18px] font-semibold text-black mb-3">{item.title}</h3>
          <p className="text-[14px] text-[#6B6B6B] leading-relaxed mb-4 flex-grow">{item.desc}</p>
          <Link href={`/shop?search=${encodeURIComponent(item.search)}`} passHref legacyBehavior>
            <a className="bg-[#E03A3E] hover:bg-[#cc3236] text-white text-sm font-semibold px-5 py-2 rounded-md inline-block transition w-fit">
              Order Now
            </a>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-hidden">

      {/* 1. HERO SECTION - FULL VISIBILITY */}
      <section className="relative w-full bg-[#B5B796] overflow-hidden min-h-[380px] md:min-h-[400px] lg:min-h-[500px]">

        {/* BACKGROUND IMAGE - NO CUTTING */}
        <div className="relative w-full h-full">
          <img
            src="/assets/images/ban.jpeg"
            alt="Wide Banner"
            className="w-full h-full object-contain md:object-cover lg:object-contain object-center"
          />

          {/* LIGHT OVERLAY FOR CLARITY */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* BUTTONS ALIGNED TO IMAGE CONTENT */}
        <div className="absolute inset-0 z-10 flex items-end justify-start pb-6 md:pb-24 lg:pb-32 px-4 md:px-20 lg:px-44">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <button
              onClick={openQuoteModal}
              className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-6 py-2.5 md:px-8 md:py-3.5 rounded-xl text-sm md:text-md font-bold w-full sm:w-auto transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              Book Now
            </button>

            <Link href="/shop" className="w-full sm:w-auto">
              <button className="bg-white/95 backdrop-blur-sm border border-white/20 hover:bg-white text-gray-900 px-6 py-2.5 md:px-8 md:py-3.5 rounded-xl text-sm md:text-md font-bold w-full sm:w-auto transition-all shadow-xl hover:scale-105 active:scale-95">
                View Menu
              </button>
            </Link>
          </div>
        </div>
      </section>



      {/* ================================================= */}
      {/* 2. OUR SERVICES */}
      {/* ================================================= */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[120px]">

          {/* SECTION HEADER */}
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-[24px] md:text-[32px] font-semibold text-black mb-3 md:mb-4">
              Catering for Every Occasion
            </h2>
            <p className="text-[14px] md:text-[16px] text-[#6B6B6B] max-w-[520px] mx-auto px-4">
              Catering Every Moment with Excellence
            </p>
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-[64px]">
            <ServiceCard
              title="Corporate Catering"
              subtitle="Impress. Engage. Deliver Excellence."
              description="From meetings to large corporate events, Caterly provides professional catering that enhances productivity and leaves a lasting impression."
              points={["Reliable & on-time delivery", "Perfect for meetings & events", "Wide variety of menu options"]}
              images={corporateImages}
            />

            <ServiceCard
              title="Event Catering"
              subtitle="Perfect Catering for Every Occasion"
              description="Whether it’s a private event, celebration, or special gathering, Caterly offers versatile catering solutions designed to suit every occasion."
              points={["Flexible catering packages", "Beautifully presented platters", "Hassle-free experience"]}
              images={eventImages}
            />

            <ServiceCard
              title="Wedding Catering"
              subtitle="Where Love Meets Exceptional Taste"
              description="Your big day deserves unforgettable food. Caterly crafts exquisite wedding menus tailored to your style, ensuring every bite reflects elegance, love, and celebration."
              points={["Tailored wedding packages", "Premium presentation & service", "Seamless event execution"]}
              images={weddingImages}
            />
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
              Our Catering Packages
            </h2>
            <p className="text-[14px] md:text-[16px] text-[#6B6B6B] max-w-[640px] mx-auto leading-relaxed px-4">
              Flavourful Catering Made Easy
            </p>
          </div>

          {/* CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-x-[40px] md:gap-y-[64px]">            {[
            {
              title: "Breakfast Packages",
              desc: "Start the day right with freshly prepared breakfast selections including pastries, sandwiches, wraps, fruit platters and coffee options. Perfect for early meetings and team gatherings.",
              img: "/assets/images/c34.jpg",
              search: "breakfast"
            },
            {
              title: "Morning Tea Packages",
              desc: "A delightful mix of sweet and savoury treats designed for mid morning breaks. Includes muffins, slices, pastries, fruit and light bites to keep everyone energised.",
              img: "/assets/images/c31.jpeg",
              search: "morning tea"
            },
            {
              title: "Lunch Packages",
              desc: "Our lunch packages offer a satisfying variety of wraps, sandwiches, salads and hot food options. Ideal for corporate meetings, office lunches and team events.",
              img: "/assets/images/c58.png",
              search: "lunch"
            },
            {
              title: "Assorted Platters",
              desc: "Beautifully presented platters featuring sandwiches, wraps, fruit, pastries and gourmet selections. Perfect for sharing at meetings, functions and celebrations.",
              img: "/assets/images/c33.jpeg",
              search: "platter"
            },
            {
              title: "Finger Food and Canapés",
              desc: "Elegant bite sized options designed for events and networking functions. Easy to enjoy while mingling and ideal for cocktail style gatherings.",
              img: "/assets/images/c36.png",
              search: "finger food"
            },
            {
              title: "Cakes and Sweet Treats",
              desc: "Celebrate special occasions with our delicious cakes and dessert selections including birthday cakes, slices and sweet platters.",
              img: "/assets/images/c35.png",
              search: "cake"
            },
          ].map((item, index) => (
            <CategoryCard
              key={index}
              item={item}
              dynamicImages={categoryImages[item.search] || []}
            />
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

              <p className="text-[14px] md:text-[15px] text-[#111111] leading-relaxed mb-3 md:mb-4 max-w-[520px]">
                For over 15 years, we've been crafting exceptional catering experiences
                with a focus on fresh, seasonal ingredients and impeccable service.
                Our team of passionate culinary experts creates memorable food
                experiences for every occasion.
              </p>

              <p className="text-[14px] md:text-[15px] text-[#111111] leading-relaxed max-w-[520px]">
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
              Freshly Prepared. Perfectly Delivered.
            </p>
          </div>

          {/* FEATURES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center">

            {/* ITEM 1 */}
            <div className="flex flex-col items-center">
              <div className="w-[64px] h-[64px] rounded-full bg-[#FFECEC] flex items-center justify-center mb-6">
                {/* Fresh / Leaf */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E03A3E" strokeWidth="2">
                  <path d="M5 21c10 0 14-10 14-14C9 7 5 11 5 21z" />
                  <path d="M5 21c0-6 6-12 14-14" />
                </svg>
              </div>
              <h3 className="text-[18px] font-semibold text-black mb-2">
                Fresh Ingredients
              </h3>
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed max-w-[240px]">
                We use high-quality, fresh ingredients to prepare every dish, ensuring great taste and consistent quality for every event.
              </p>
            </div>

            {/* ITEM 2 */}
            <div className="flex flex-col items-center">
              <div className="w-[64px] h-[64px] rounded-full bg-[#FFECEC] flex items-center justify-center mb-6">
                {/* Menu */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E03A3E" strokeWidth="2">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <line x1="8" y1="8" x2="16" y2="8" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="8" y1="16" x2="13" y2="16" />
                </svg>
              </div>
              <h3 className="text-[18px] font-semibold text-black mb-2">
                Tailored Catering Menus
              </h3>
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed max-w-[240px]">
                Our menus are flexible and customised to suit offices, corporate meetings, private events, and special occasions.
              </p>
            </div>

            {/* ITEM 3 */}
            <div className="flex flex-col items-center">
              <div className="w-[64px] h-[64px] rounded-full bg-[#FFECEC] flex items-center justify-center mb-6">
                {/* Delivery */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E03A3E" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h3 className="text-[18px] font-semibold text-black mb-2">
                Reliable &amp; On-Time Delivery
              </h3>
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed max-w-[240px]">
                We ensure your catering arrives fresh and exactly when you need it, every single time.
              </p>
            </div>

            {/* ITEM 4 */}
            <div className="flex flex-col items-center">
              <div className="w-[64px] h-[64px] rounded-full bg-[#FFECEC] flex items-center justify-center mb-6">
                {/* Presentation */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E03A3E" strokeWidth="2">
                  <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7z" />
                </svg>
              </div>
              <h3 className="text-[18px] font-semibold text-black mb-2">
                Professional Presentation
              </h3>
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed max-w-[240px]">
                Every dish is presented with attention to detail, enhancing the overall experience of your event.
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
                  onClick={openQuoteModal}
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

                <a
                  href="tel:1300827286"
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
              inline-block
            "
                >
                  Call Now
                </a>

              </div>
            </div>
          </div>

        </div>
      </section>



    </div>
  )
}
