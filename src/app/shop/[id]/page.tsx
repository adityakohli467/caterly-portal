"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Star, Minus, Plus, ChevronLeft, ChevronRight, Home, ChevronRight as ChevronRightIcon } from "lucide-react"
import Image from "next/image"
import { api } from "@/lib/api"
import { useCartStore } from "@/store/cart"
import { useAuthStore } from "@/store/auth"
import { toast } from "sonner"
import { getProductImageUrl, getProductImageUrls } from "@/lib/product-utils"

interface Product {
  product_id: number
  product_name: string
  product_description: string
  short_description?: string
  product_price: string
  original_price?: number
  discounted_price?: number
  discount_percentage?: number
  has_discount?: boolean
  product_image?: string
  product_images?: Array<{ image_url: string; image_order?: number } | string> | null
  categories?: Array<{ category_id: number; category_name: string; parent_category_id?: number }>
  options?: Array<any>
  roast_level?: string | null
  show_specifications?: boolean
  show_other_info?: boolean
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter()
  const { addItem, getItemPrice } = useCartStore()
  const { isAuthenticated, token } = useAuthStore()
  const [productId, setProductId] = useState<string>("")
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<"whole" | "ground">("ground")
  const [quantity, setQuantity] = useState(1)
  const [purchaseType, setPurchaseType] = useState<"onetime" | "subscription">("onetime")
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({}) // option_id -> option_value_id
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewerName, setReviewerName] = useState("")
  const [reviewerEmail, setReviewerEmail] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Handle params (can be Promise in Next.js 15+ or object in Next.js 14)
  useEffect(() => {
    const resolveParams = async () => {
      if (params && typeof params === 'object' && 'then' in params) {
        const resolved = await params
        setProductId(resolved.id)
      } else {
        setProductId((params as { id: string }).id)
      }
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchReviews()
    }
  }, [productId])

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true)
      const response = await api.get(`/store/products/${productId}/reviews`)
      setReviews(response.data.reviews || [])
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
      setReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const headers: any = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      const response = await api.get(`/store/products/${productId}`, { headers })
      console.log("Product detail API response:", response.data)
      setProduct(response.data.product)
      // Reset to first image when product changes
      setSelectedImageIndex(0)
    } catch (error: any) {
      console.error("Failed to fetch product:", error)
      // Don't show error for 401 - product should be viewable without auth
      if (error.response?.status === 404) {
        toast.error("Product not found")
        router.push("/shop")
      } else if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to load product. Please try again.")
      }
      // Don't redirect on auth errors - product should still be viewable
      if (error.response?.status === 404) {
        router.push("/shop")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    // Validate required options
    if (product.options && product.options.length > 0) {
      for (const option of product.options) {
        if (option.required && !selectedOptions[option.option_id]) {
          toast.error(`Please select ${option.option_name}`)
          return
        }
      }
    }
    
    // Build options array
    const options: any[] = []
    if (product.options && product.options.length > 0) {
      for (const option of product.options) {
        const selectedValueId = selectedOptions[option.option_id]
        if (selectedValueId) {
          const selectedValue = option.values.find((v: any) => v.option_value_id === selectedValueId)
          if (selectedValue) {
            options.push({
              option_id: option.option_id,
              option_name: option.option_name,
              option_value_id: selectedValue.option_value_id,
              option_value: selectedValue.option_value,
              product_option_id: selectedValue.product_option_id,
              option_price: selectedValue.product_option_price,
              option_price_prefix: selectedValue.product_option_price_prefix,
            })
          }
        }
      }
    }
    
    // Use discounted price if available, otherwise use regular price
    const priceToUse = product.has_discount && product.discounted_price 
      ? product.discounted_price.toString() 
      : product.product_price
    
    addItem({
      product_id: product.product_id,
      product_name: product.product_name,
      product_price: priceToUse,
      product_image: getProductImageUrl(product),
      quantity,
      options: options.length > 0 ? options : undefined,
    })
    toast.success(`${product.product_name} added to cart`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : 
                   day === 2 || day === 22 ? 'nd' : 
                   day === 3 || day === 23 ? 'rd' : 'th'
    return `${day}${suffix} ${month}, ${year}`
  }

  const updateQuantity = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change))
  }

  const calculateSubtotal = () => {
    if (!product) return 0
    
    // Build options array for price calculation
    const options: any[] = []
    if (product.options && product.options.length > 0) {
      for (const option of product.options) {
        const selectedValueId = selectedOptions[option.option_id]
        if (selectedValueId) {
          const selectedValue = option.values.find((v: any) => v.option_value_id === selectedValueId)
          if (selectedValue) {
            options.push({
              option_id: option.option_id,
              option_name: option.option_name,
              option_value_id: selectedValue.option_value_id,
              option_value: selectedValue.option_value,
              product_option_id: selectedValue.product_option_id,
              option_price: selectedValue.product_option_price,
              option_price_prefix: selectedValue.product_option_price_prefix,
            })
          }
        }
      }
    }
    
    // Use discounted price if available
    const basePrice = product.has_discount && product.discounted_price 
      ? product.discounted_price.toString() 
      : product.product_price
    
    // Use cart store's getItemPrice function
    const itemPrice = getItemPrice({
      product_id: product.product_id,
      product_name: product.product_name,
      product_price: basePrice,
      quantity: 1,
      options: options.length > 0 ? options : undefined,
    })
    
    return itemPrice * quantity
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmitReview = async () => {
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating")
      return
    }

    if (!reviewText.trim() || reviewText.trim().length < 10) {
      toast.error("Please write a review (at least 10 characters)")
      return
    }

    try {
      setSubmittingReview(true)
      const headers: any = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const response = await api.post(
        `/store/products/${productId}/reviews`,
        {
          rating,
          review_text: reviewText.trim(),
          reviewer_name: reviewerName.trim() || undefined,
          reviewer_email: reviewerEmail.trim() || undefined,
        },
        { headers }
      )

      toast.success("Review submitted successfully! It will be reviewed before being published.")
      setRating(0)
      setReviewText("")
      setReviewerName("")
      setReviewerEmail("")
      
      // Refresh reviews
      await fetchReviews()
    } catch (error: any) {
      console.error("Failed to submit review:", error)
      const errorMessage = error.response?.data?.message || "Failed to submit review. Please try again."
      toast.error(errorMessage)
    } finally {
      setSubmittingReview(false)
    }
  }

  // Get main category for breadcrumb
  const mainCategory = product?.categories?.find(cat => !cat.parent_category_id) || product?.categories?.[0]
  const subCategory = product?.categories?.find(cat => cat.parent_category_id)

  return (
    <div className="flex flex-col bg-white">
      {/* Breadcrumb */}
      <section className="bg-gray-50 border-b">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-[#2952E6] flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            <Link href="/shop" className="text-gray-600 hover:text-[#2952E6]">
              Product Catalogue
            </Link>
            {mainCategory && (
              <>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{mainCategory.category_name}</span>
              </>
            )}
            {subCategory && (
              <>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{subCategory.category_name}</span>
              </>
            )}
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{product?.product_name}</span>
          </nav>
        </div>
      </section>

      {/* Product Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Product Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                {(() => {
                  const imageUrls = getProductImageUrls(product)
                  const mainImage = imageUrls[selectedImageIndex] || getProductImageUrl(product)
                  
                  return mainImage ? (
                    <Image
                      src={mainImage}
                      alt={`${product.product_name} - Image ${selectedImageIndex + 1}`}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                      <span className="text-white/40 text-lg">{product.product_name}</span>
                    </div>
                  )
                })()}
                
                {/* Navigation arrows for multiple images */}
                {(() => {
                  const imageUrls = getProductImageUrls(product)
                  if (imageUrls.length > 1) {
                    return (
                      <>
                        <button
                          onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )
                  }
                  return null
                })()}
              </div>
              
              {/* Thumbnail Images */}
              {(() => {
                const imageUrls = getProductImageUrls(product)
                if (imageUrls.length > 1) {
                  return (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {imageUrls.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-[#2952E6] ring-2 ring-[#2952E6] ring-offset-2'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          aria-label={`View image ${index + 1}`}
                        >
                          <Image
                            src={url}
                            alt={`${product.product_name} thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )
                }
                return null
              })()}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.product_name}</h1>
              
              <div className="flex items-center gap-3 mb-6">
                {product.has_discount && product.original_price && product.discounted_price ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-gray-500 line-through">
                      ${product.original_price.toFixed(2)}
                    </span>
                    <div className="text-2xl font-bold text-[#2952E6]">
                      ${product.discounted_price.toFixed(2)}
                    </div>
                    {product.discount_percentage && (
                      <Badge variant="destructive" className="text-sm">
                        {product.discount_percentage}% OFF
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-[#2952E6]">
                    ${parseFloat(product.product_price).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-gray-700 leading-relaxed mb-6 text-lg font-medium">
                  {product.short_description}
                </p>
              )}

              {/* Full Description */}
              <p className="text-gray-700 leading-relaxed mb-6">{product.product_description}</p>

              {/* Roast Level - Only show if defined in backend */}
              {product.roast_level && (
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-sm font-medium text-gray-700">{product.roast_level} Roast</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => {
                      // Determine roast intensity based on roast level
                      let filledBars = 0
                      const roastLower = product.roast_level?.toLowerCase() || ''
                      if (roastLower.includes('light')) {
                        filledBars = 1
                      } else if (roastLower.includes('medium')) {
                        filledBars = 3
                      } else if (roastLower.includes('dark')) {
                        filledBars = 5
                      } else {
                        filledBars = 3 // Default to medium
                      }
                      return (
                        <div 
                          key={i}
                          className={`w-8 h-3 rounded ${i < filledBars ? 'bg-amber-700' : 'bg-gray-200'}`}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Product Options */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-4 mb-6">
                  {product.options.map((option) => (
                    <div key={option.option_id}>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        {option.option_name}
                        {option.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <select
                        value={selectedOptions[option.option_id] || ""}
                        onChange={(e) => {
                          setSelectedOptions({
                            ...selectedOptions,
                            [option.option_id]: Number.parseInt(e.target.value),
                          })
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2952E6] focus:border-[#2952E6]"
                        required={option.required}
                      >
                        <option value="">Select {option.option_name}</option>
                        {option.values.map((value: any) => {
                          // Use discounted price if available, otherwise use regular price
                          const displayPrice = value.has_discount && value.discounted_option_price
                            ? value.discounted_option_price
                            : Number.parseFloat(value.product_option_price || "0")
                          const priceDisplay = displayPrice > 0
                            ? ` (+$${displayPrice.toFixed(2)})`
                            : ""
                          return (
                            <option key={value.option_value_id} value={value.option_value_id}>
                              {value.option_value}{priceDisplay}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="border rounded-lg overflow-hidden mb-6">
                <div className="grid grid-cols-2 bg-gray-50 p-4 font-medium text-sm">
                  <div>Quantity</div>
                  <div className="text-right">Price</div>
                </div>
                <div className="grid grid-cols-2 p-4 items-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(-1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-right font-bold">
                    {product.has_discount && product.discounted_price ? 
                      `$${product.discounted_price.toFixed(2)}` : 
                      `$${Number.parseFloat(product.product_price).toFixed(2)}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 text-lg font-bold">
                <span>Subtotal</span>
                <span>
                  {product.has_discount && product.discounted_price ? 
                    `$${(product.discounted_price * quantity).toFixed(2)}` : 
                    `$${calculateSubtotal()}`}
                </span>
              </div>

              {/* Purchase Type */}
              <div className="mb-6">
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={purchaseType === "onetime"}
                      onChange={() => setPurchaseType("onetime")}
                      className="w-4 h-4 text-[#2952E6]"
                    />
                    <span>One-time Purchase</span>
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="radio"
                      checked={purchaseType === "subscription"}
                      onChange={() => setPurchaseType("subscription")}
                      className="w-4 h-4 text-[#2952E6]"
                    />
                    <span className="font-medium">Subscribe & Deliver every</span>
                  </label>
                  {purchaseType === "subscription" && (
                    <>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2">
                        <option>2 Weeks</option>
                        <option>4 Weeks</option>
                        <option>8 Weeks</option>
                      </select>
                      <p className="text-sm text-gray-600">
                        Get 10% off every recurring order
                      </p>
                    </>
                  )}
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full py-6 bg-[#2952E6] hover:bg-[#1e3fb3] text-white font-semibold text-lg"
                onClick={handleAddToCart}
              >
                Add to Cart ({quantity})
              </Button>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="description" className="mb-16">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2952E6] data-[state=active]:text-[#2952E6]"
              >
                Description
              </TabsTrigger>
              {product.show_specifications && (
                <TabsTrigger 
                  value="specifications"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2952E6] data-[state=active]:text-[#2952E6]"
                >
                  Specifications
                </TabsTrigger>
              )}
              {product.show_other_info && (
                <TabsTrigger 
                  value="other"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2952E6] data-[state=active]:text-[#2952E6]"
                >
                  Other Info
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Product Description</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {product.product_description}
              </p>
            </TabsContent>

            {product.show_specifications && (
              <TabsContent value="specifications" className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
                <p className="text-gray-700">Specifications content goes here...</p>
              </TabsContent>
            )}

            {product.show_other_info && (
              <TabsContent value="other" className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Other Information</h3>
                <p className="text-gray-700">Other information goes here...</p>
              </TabsContent>
            )}
          </Tabs>

          {/* Reviews Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-gray-500 italic mb-2">Featured</p>
                <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option>4-star reviews</option>
                <option>5-star reviews</option>
                <option>All reviews</option>
              </select>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {reviews.map((review) => (
                  <Card key={review.review_id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold text-gray-900">{review.reviewer_name}</p>
                          <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{review.review_text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-2 mb-12">
              <Button variant="outline" size="icon" className="rounded-full">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Write Review */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Review this product</h3>
                
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Click to rate</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <Textarea
                    placeholder="Write your review here, what did you like the most?"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="min-h-32 resize-none"
                    disabled={submittingReview}
                  />
                  {reviewText.length > 0 && reviewText.length < 10 && (
                    <p className="text-sm text-red-500 mt-1">
                      Review must be at least 10 characters ({reviewText.length}/10)
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Your Name (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    disabled={submittingReview}
                    className="mb-2"
                  />
                </div>

                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Your Email (Optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    disabled={submittingReview}
                  />
                </div>

                <Button 
                  onClick={handleSubmitReview}
                  className="bg-[#2952E6] hover:bg-[#1e3fb3]"
                  disabled={submittingReview || !rating || reviewText.trim().length < 10}
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* You May Also Like */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">You may also Like</h2>
              <Link href="/shop">
                <Button className="bg-[#2952E6] hover:bg-[#1e3fb3]">
                  View All
                </Button>
              </Link>
            </div>

            <div className="text-center py-8 text-gray-500">
              <p>Related products will be displayed here</p>
              <Link href="/shop">
                <Button variant="outline" className="mt-4">
                  Browse All Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

