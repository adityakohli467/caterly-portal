"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { getProductImageUrl } from "@/lib/product-utils"

interface Product {
  product_id: number
  product_name: string
  product_description: string
  product_price: string
  original_price?: number
  discounted_price?: number
  discount_percentage?: number
  has_discount?: boolean
  product_image?: string
  product_images?: Array<{ image_url: string; image_order?: number } | string> | null
  header_name?: string
}

interface Review {
  review_id: number
  rating: number
  review_text: string
  reviewer_name: string
  reviewer_location?: string
  created_at: string
}

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [coffeeProducts, setCoffeeProducts] = useState<Product[]>([])
  const [teaProducts, setTeaProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [coffeePage, setCoffeePage] = useState(1)
  const [teaPage, setTeaPage] = useState(1)
  const [brewingPage, setBrewingPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchFeaturedProducts()
    fetchPublishedReviews()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true)
      let coffeeProductsData: Product[] = []
      let teaProductsData: Product[] = []
      
      // Fetch featured coffee (featured_1) and tea (featured_2) products
      try {
        const [coffeeResponse, teaResponse] = await Promise.all([
          api.get("/store/products/featured/coffee", { params: { limit: 4 } }).catch(() => null),
          api.get("/store/products/featured/tea", { params: { limit: 4 } }).catch(() => null)
        ])
        
        coffeeProductsData = coffeeResponse?.data?.products || []
        teaProductsData = teaResponse?.data?.products || []
      } catch (error: any) {
        console.warn("Failed to fetch featured products by flag:", error)
      }
      
      // If no featured products found, try fallback strategies
      if (coffeeProductsData.length === 0) {
        try {
          // Try to get products from "Coffee" category
          const fallbackResponse = await api.get("/store/products", { 
            params: { limit: 4, search: "coffee" } 
          })
          coffeeProductsData = fallbackResponse.data.products?.slice(0, 4) || []
        } catch (fallbackError) {
          console.warn("Coffee fallback failed:", fallbackError)
        }
      }
      
      if (teaProductsData.length === 0) {
        try {
          // Try to get products from "Tea" category
          const fallbackResponse = await api.get("/store/products", { 
            params: { limit: 4, search: "tea" } 
          })
          teaProductsData = fallbackResponse.data.products?.slice(0, 4) || []
        } catch (fallbackError) {
          console.warn("Tea fallback failed:", fallbackError)
        }
      }
      
      // Last resort: try general featured products
      if (coffeeProductsData.length === 0 && teaProductsData.length === 0) {
        try {
          const response = await api.get("/store/products/featured", { params: { limit: 8 } })
          const products = response.data.products || []
          if (products.length > 0) {
            coffeeProductsData = products.slice(0, 4)
            teaProductsData = products.slice(4, 8)
          }
        } catch (fallbackError) {
          console.error("All fallback fetches failed:", fallbackError)
        }
      }
      
      setCoffeeProducts(coffeeProductsData)
      setTeaProducts(teaProductsData)
    } catch (error: any) {
      console.error("Failed to fetch featured products:", error)
      // Set empty arrays on complete failure
      setCoffeeProducts([])
      setTeaProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPublishedReviews = async () => {
    try {
      setReviewsLoading(true)
      const response = await api.get("/store/reviews/general", { params: { limit: 6 } })
      setReviews(response.data.reviews || [])
    } catch (error: any) {
      console.error("Failed to fetch reviews:", error)
      // Use empty array if fetch fails - reviews are optional
      setReviews([])
      // Don't show error toast - reviews are not critical
    } finally {
      setReviewsLoading(false)
    }
  }

  // Static brewing images - moved outside useMemo to avoid serialization issues
  const BREWING_IMAGES = [
    { id: 1, image: "/assets/sndurex/Feature Card.png", alt: "St. Dreux Coffee Cups" },
    { id: 2, image: "/assets/sndurex/Feature Card (1).png", alt: "The Shepherd Coffee Bag" },
    { id: 3, image: "/assets/sndurex/Feature Card (2).png", alt: "Coffee Pouring" }
  ] as const

  // Pagination constants
  const COFFEE_PRODUCTS_PER_PAGE = 4
  const TEA_PRODUCTS_PER_PAGE = 4
  const BREWING_IMAGES_PER_PAGE = 3

  // Calculate pagination for coffee products (4 per page)
  const coffeeTotalPages = useMemo(() => {
    if (!coffeeProducts || coffeeProducts.length === 0) return 1
    return Math.ceil(coffeeProducts.length / COFFEE_PRODUCTS_PER_PAGE)
  }, [coffeeProducts.length])

  const displayedCoffeeProducts = useMemo(() => {
    if (!coffeeProducts || coffeeProducts.length === 0) return []
    const startIndex = (coffeePage - 1) * COFFEE_PRODUCTS_PER_PAGE
    const endIndex = startIndex + COFFEE_PRODUCTS_PER_PAGE
    return coffeeProducts.slice(startIndex, endIndex)
  }, [coffeeProducts, coffeePage])

  // Calculate pagination for tea products (4 per page)
  const teaTotalPages = useMemo(() => {
    if (!teaProducts || teaProducts.length === 0) return 1
    return Math.ceil(teaProducts.length / TEA_PRODUCTS_PER_PAGE)
  }, [teaProducts.length])

  const displayedTeaProducts = useMemo(() => {
    if (!teaProducts || teaProducts.length === 0) return []
    const startIndex = (teaPage - 1) * TEA_PRODUCTS_PER_PAGE
    const endIndex = startIndex + TEA_PRODUCTS_PER_PAGE
    return teaProducts.slice(startIndex, endIndex)
  }, [teaProducts, teaPage])

  // Calculate pagination for brewing images (3 per page)
  const brewingTotalPages = useMemo(() => {
    return Math.ceil(BREWING_IMAGES.length / BREWING_IMAGES_PER_PAGE)
  }, [])

  const displayedBrewingImages = useMemo(() => {
    const startIndex = (brewingPage - 1) * BREWING_IMAGES_PER_PAGE
    const endIndex = startIndex + BREWING_IMAGES_PER_PAGE
    return BREWING_IMAGES.slice(startIndex, endIndex)
  }, [brewingPage])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await api.post("/store/newsletter/subscribe", {
        email: email.trim(),
      })

      toast.success(response.data.message || "Successfully subscribed to our newsletter!")
      setEmail("")
    } catch (error: any) {
      console.error("Newsletter subscription error:", error)
      const errorMessage = error.response?.data?.message || "Failed to subscribe. Please try again later."
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[600px] sm:h-[700px] md:h-[800px] bg-black">
        <div className="absolute inset-0">
          <Image
            src="/assets/sndurex/Wireframe - 14 (3).png"
            alt="ZENN Catering"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
        </div>
        <div className="relative container mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6" style={{ fontFamily: 'Albert Sans', fontWeight: 700 }}>
              Where quality is more than a promise.
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-white/90" style={{ fontFamily: 'Albert Sans' }}>
              Experience the perfect harmony of flavor, creativity, and hospitality.
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-[#055160] hover:bg-[#04414d] text-white px-8 py-6 text-lg" style={{ fontFamily: 'Albert Sans', fontWeight: 600 }}>
                LET'S CONNECT
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Statement - WHO WE ARE Section */}
      <section className="relative w-screen py-16 bg-[#0a0a0a]" style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
        <div className="relative container mx-auto px-6 text-center max-w-4xl z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white" style={{ fontFamily: 'Albert Sans', fontWeight: 700 }}>
            WHO WE ARE
          </h2>
          <p className="text-white leading-relaxed text-lg mb-4" style={{ fontFamily: 'Albert Sans' }}>
            With over 50 years of experience, ZENN has been at the forefront of culinary excellence. Our purpose-built facility in Epping serves as the foundation for creating experiences that nourish both body and soul.
          </p>
          <p className="text-white leading-relaxed text-lg mb-4" style={{ fontFamily: 'Albert Sans' }}>
            We believe in the power of diversity and respect, bringing together people from all walks of life to create something truly special.
          </p>
        </div>
      </section>

      {/* Coffee Blends Section */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Albert Sans', fontWeight: 700 }}>CATERING EXCELLENCE</h2>
              <p className="text-white/80 mt-2" style={{ fontFamily: 'Albert Sans' }}>
                Premium quality food, professional service, and seamless event planning
              </p>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="border-[#055160] text-[#055160] hover:bg-[#055160] hover:text-white" style={{ fontFamily: 'Albert Sans', fontWeight: 600 }}>
                View more
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#055160] mx-auto"></div>
            </div>
          ) : coffeeProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">No featured products available at the moment.</p>
              <Link href="/shop">
                <Button variant="outline" className="border-[#055160] text-[#055160] hover:bg-[#055160] hover:text-white" style={{ fontFamily: 'Albert Sans', fontWeight: 600 }}>
                  Browse All Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedCoffeeProducts.map((product) => (
                <Card key={product.product_id} className="overflow-hidden hover:shadow-xl transition-shadow group bg-[#1a1a1a] border-[#2a2a2a]">
                  <div className="relative aspect-square bg-gray-900">
                    {getProductImageUrl(product) ? (
                      <img
                        src={getProductImageUrl(product)!}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/30" />
                    )}
                    {!getProductImageUrl(product) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-6xl font-light mb-2">25g</div>
                          <div className="text-sm">SAMPLE PACK</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-white">{product.product_name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      {product.has_discount && product.original_price && product.discounted_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/50 line-through">
                            ${product.original_price.toFixed(2)}
                          </span>
                          <span className="text-xl font-bold text-[#055160]">
                            ${product.discounted_price.toFixed(2)}
                          </span>
                          {product.discount_percentage && (
                            <span className="text-xs bg-[#055160] text-white px-2 py-0.5 rounded">
                              {product.discount_percentage}% OFF
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-[#055160]">
                          ${parseFloat(product.product_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/70 mb-4 line-clamp-2">{product.product_description}</p>
                    <Link href={`/shop/${product.product_id}`}>
                      <Button size="sm" className="w-full bg-[#055160] hover:bg-[#04414d] text-white" style={{ fontFamily: 'Albert Sans', fontWeight: 600 }}>
                        View Product
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {coffeeTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                onClick={() => setCoffeePage(p => Math.max(1, p - 1))}
                disabled={coffeePage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: coffeeTotalPages || 1 }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant="outline"
                  size="icon"
                  className={`rounded-full border-[#2a2a2a] ${coffeePage === pageNum ? 'bg-[#055160] text-white border-[#055160]' : 'text-white border-[#2a2a2a]'}`}
                  onClick={() => setCoffeePage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                onClick={() => setCoffeePage(p => Math.min(coffeeTotalPages, p + 1))}
                disabled={coffeePage === coffeeTotalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Tea Products Section */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Albert Sans', fontWeight: 700 }}>DRIVEN BY INNOVATION</h2>
              <p className="text-white/80 mt-2" style={{ fontFamily: 'Albert Sans' }}>
                Our culinary artistry explores innovative ideas and sources high-quality ingredients
              </p>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="border-[#055160] text-[#055160] hover:bg-[#055160] hover:text-white" style={{ fontFamily: 'Albert Sans', fontWeight: 600 }}>
                View more
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : teaProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">No featured products available at the moment.</p>
              <Link href="/shop">
                <Button variant="outline" className="border-[#055160] text-[#055160] hover:bg-[#055160] hover:text-white" style={{ fontFamily: 'Albert Sans', fontWeight: 600 }}>
                  Browse All Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedTeaProducts.map((product) => (
                <Card key={product.product_id} className="overflow-hidden hover:shadow-xl transition-shadow group bg-[#1a1a1a] border-[#2a2a2a]">
                  <div className="relative aspect-square bg-gray-900">
                    {getProductImageUrl(product) ? (
                      <img
                        src={getProductImageUrl(product)!}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/30" />
                    )}
                    {!getProductImageUrl(product) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-6xl font-light mb-2">25g</div>
                          <div className="text-sm">SAMPLE PACK</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-white">{product.product_name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      {product.has_discount && product.original_price && product.discounted_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/50 line-through">
                            ${product.original_price.toFixed(2)}
                          </span>
                          <span className="text-xl font-bold text-[#055160]">
                            ${product.discounted_price.toFixed(2)}
                          </span>
                          {product.discount_percentage && (
                            <span className="text-xs bg-[#055160] text-white px-2 py-0.5 rounded">
                              {product.discount_percentage}% OFF
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-[#055160]">
                          ${parseFloat(product.product_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/70 mb-4 line-clamp-2">{product.product_description}</p>
                    <Link href={`/shop/${product.product_id}`}>
                      <Button size="sm" className="w-full bg-[#055160] hover:bg-[#04414d] text-white" style={{ fontFamily: 'Albert Sans', fontWeight: 600 }}>
                        View Product
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {teaTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                onClick={() => setTeaPage(p => Math.max(1, p - 1))}
                disabled={teaPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: teaTotalPages || 1 }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant="outline"
                  size="icon"
                  className={`rounded-full border-[#2a2a2a] ${teaPage === pageNum ? 'bg-[#055160] text-white border-[#055160]' : 'text-white border-[#2a2a2a]'}`}
                  onClick={() => setTeaPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                onClick={() => setTeaPage(p => Math.min(teaTotalPages, p + 1))}
                disabled={teaPage === teaTotalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-screen py-16 bg-[#0a0a0a]" style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white" style={{ fontFamily: 'Albert Sans', fontWeight: 700 }}>
            Let's Create Something Extraordinary!
          </h2>
          <p className="text-white/90 mb-8 leading-relaxed text-lg max-w-3xl mx-auto" style={{ fontFamily: 'Albert Sans' }}>
            Ready to elevate your next event? Our catering specialists are here to bring your vision to life with exceptional food, impeccable service, and unforgettable experiences.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-[#0a0a0a] hover:bg-white/90 px-8 py-6 text-lg rounded-lg" style={{ fontFamily: 'Albert Sans', fontWeight: 600 }}>
              CONTACT US
            </Button>
          </Link>
          <p className="text-white/60 mt-4 text-sm" style={{ fontFamily: 'Albert Sans' }}>
            Get in touch today to discuss your catering needs.
          </p>
        </div>
      </section>

      {/* THE ZENN EXPERIENCE Section */}
      <section className="w-screen py-16 bg-[#0a0a0a]" style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white order-2 lg:order-1">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white" style={{ fontFamily: 'Albert Sans', fontWeight: 700 }}>
                THE ZENN EXPERIENCE
              </h2>
              <p className="text-white/90 mb-6 leading-relaxed text-lg" style={{ fontFamily: 'Albert Sans' }}>
                We are dedicated to maintaining the highest standards in everything we do. Our baristas take pride in crafting the perfect cup of coffee, ensuring every sip is an experience to remember.
              </p>
              <p className="text-white/90 mb-6 leading-relaxed text-lg" style={{ fontFamily: 'Albert Sans' }}>
                The Zenn experience is about connection, quality, and exceeding expectations—whether you're dining in, grabbing takeaway, or catering your next event.
              </p>
            </div>
            <div className="relative h-96 lg:h-[500px] order-1 lg:order-2">
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <Image
                  src="/assets/sndurex/Rectangle 180 (1).png"
                  alt="ZENN Experience"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Albert Sans', fontWeight: 700 }}>WHERE PEOPLE THRIVE</h2>
            <p className="text-xl text-white/80 mt-4" style={{ fontFamily: 'Albert Sans' }}>
              Our culture promotes personal growth, equal opportunities, and strong teamwork
            </p>
          </div>

          {reviewsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#055160] mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <p>No reviews available yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <Card key={review.review_id} className="relative bg-[#1a1a1a] border-[#2a2a2a]">
                  <CardContent className="pt-12 pb-6">
                    <div className="absolute top-6 left-6 text-6xl text-white/20">"</div>
                    <p className="text-white/90 mb-6 relative z-10 leading-relaxed text-sm" style={{ fontFamily: 'Albert Sans' }}>
                      {review.review_text}
                    </p>
                    <div className="border-t border-[#2a2a2a] pt-4">
                      <p className="font-semibold text-white">{review.reviewer_name}</p>
                      {review.reviewer_location && (
                        <p className="text-sm text-white/60">{review.reviewer_location}</p>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brewing Gallery */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Albert Sans', fontWeight: 700 }}>
              CATERING EXCELLENCE
            </h2>
            <p className="text-white/80" style={{ fontFamily: 'Albert Sans' }}>
              Comprehensive options for all dietary needs including vegetarian, vegan, gluten-free, dairy-free, nut-free, Halal, and allergen-sensitive options.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {displayedBrewingImages.map((item) => (
              <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>

          {brewingTotalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                onClick={() => setBrewingPage(p => Math.max(1, p - 1))}
                disabled={brewingPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: brewingTotalPages || 1 }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant="outline"
                  size="icon"
                  className={`rounded-full border-[#2a2a2a] ${brewingPage === pageNum ? 'bg-[#055160] text-white border-[#055160]' : 'text-white border-[#2a2a2a]'}`}
                  onClick={() => setBrewingPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                onClick={() => setBrewingPage(p => Math.min(brewingTotalPages, p + 1))}
                disabled={brewingPage === brewingTotalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="w-screen py-16 bg-[#0a0a0a] text-white border-t border-[#1a1a1a]" style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Albert Sans', fontWeight: 700 }}>
              Sign up for our Newsletter
            </h2>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-2xl mx-auto">
              <Input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/50 disabled:opacity-50 flex-1 h-12 text-base rounded-md"
                required
                style={{ fontFamily: 'Albert Sans' }}
              />
              <Button 
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="bg-[#055160] hover:bg-[#04414d] text-white px-6 sm:px-8 h-12 text-base disabled:opacity-50 whitespace-nowrap rounded-md"
                style={{ fontFamily: 'Albert Sans', fontWeight: 600 }}
              >
                {isSubmitting ? "Subscribing..." : "Submit"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}


