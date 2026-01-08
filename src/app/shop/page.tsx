"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/auth"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { api } from "@/lib/api"
import { useCartStore } from "@/store/cart"
import { toast } from "sonner"
import { LoadingWithLogo } from "@/components/loading-with-logo"
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
}

interface Category {
  category_id: number
  category_name: string
  parent_category_id?: number
}

function ShopPageContent() {
  const searchParams = useSearchParams()
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscription">("one-time")
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortBy, setSortBy] = useState<string>("featured")
  const [coffeeType, setCoffeeType] = useState<string>("")
  const [roastLevel, setRoastLevel] = useState<string>("")
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  // Debounce search input
  useEffect(() => {
    if (search) {
      setSearchLoading(true)
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [search])

  const fetchCategories = async () => {
    try {
      const response = await api.get("/store/products/categories")
      // Filter out "Catering Packages" category
      const allCategories = response.data.categories || []
      const filteredCategories = allCategories.filter(
        (cat: Category) => cat.category_name?.toLowerCase() !== "catering packages"
      )
      setCategories(filteredCategories)
    } catch (error) {
      // Silently fail - don't show error to user
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = { limit: 50 }
      
      if (selectedCategory) params.category_id = selectedCategory
      if (debouncedSearch) params.search = debouncedSearch
      if (sortBy) params.order_by = sortBy

      // Apply coffee type and roast level filters by enhancing search
      let enhancedSearch = debouncedSearch
      if (coffeeType) {
        enhancedSearch = enhancedSearch ? `${enhancedSearch} ${coffeeType}` : coffeeType
      }
      if (roastLevel) {
        enhancedSearch = enhancedSearch ? `${enhancedSearch} ${roastLevel}` : roastLevel
      }
      if (enhancedSearch) params.search = enhancedSearch

      const response = await api.get("/store/products", { params })
      console.log("Shop Products API Response:", response.data)
      console.log("First Product Sample:", response.data.products?.[0])
      if (response.data.products?.[0]) {
        console.log("Has Discount:", response.data.products[0].has_discount)
        console.log("Original Price:", response.data.products[0].original_price)
        console.log("Discounted Price:", response.data.products[0].discounted_price)
        console.log("Discount %:", response.data.products[0].discount_percentage)
      }
      setProducts(response.data.products || [])
    } catch (error: any) {
      // Only show error if it's a critical error, not network issues
      console.error("Failed to fetch products:", error)
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        // Don't show toast for auth errors or network issues
        // toast.error("Failed to load products")
      }
      setProducts([]) // Set empty array on error
    } finally {
      setLoading(false)
      if (search) {
        setSearchLoading(false)
      }
    }
  }

  const fetchSubscriptions = async () => {
    if (!isAuthenticated) {
      setSubscriptions([])
      setSubscriptionsLoading(false)
      return
    }
    try {
      setSubscriptionsLoading(true)
      const response = await api.get("/store/subscriptions")
      setSubscriptions(response.data.subscriptions || [])
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error)
      setSubscriptions([])
    } finally {
      setSubscriptionsLoading(false)
    }
  }

  // Check URL parameter for purchaseType
  useEffect(() => {
    const urlPurchaseType = searchParams.get("purchaseType")
    if (urlPurchaseType === "subscription") {
      setPurchaseType("subscription")
    }
  }, [searchParams])

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (purchaseType === "one-time") {
      fetchProducts()
    } else {
      fetchSubscriptions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseType, selectedCategory, debouncedSearch, sortBy, coffeeType, roastLevel])

  const handleResetFilters = () => {
    setCoffeeType("")
    setRoastLevel("")
    setSearch("")
    setDebouncedSearch("")
    setSortBy("featured")
    setSelectedCategory(null)
  }

  const handleApplyFilters = () => {
    fetchProducts()
  }

  const handleAddToCart = (product: Product) => {
    // Use discounted price if available, otherwise use regular price
    const priceToUse = product.has_discount && product.discounted_price 
      ? product.discounted_price.toString() 
      : product.product_price
    
    addItem({
      product_id: product.product_id,
      product_name: product.product_name,
      product_price: priceToUse,
      product_image: getProductImageUrl(product),
    })
    toast.success(`${product.product_name} added to cart`)
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-r from-blue-900/90 to-blue-800/90">
        <div className="absolute inset-0">
          <Image
            src="/assets/sndurex/Frame 1000007200.png"
            alt="Product Catalog"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 h-full flex items-center">
          <div className="text-white text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">Product Catalog</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90">
              Crafted with passion, enjoyed in every sip. Taste the difference!
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-6 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 lg:top-24">
                {/* Purchase Type Selector */}
                <div className="mb-6 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPurchaseType("one-time")}
                    className={`flex-1 ${
                      purchaseType === "one-time"
                        ? "bg-[#E8DCC6] border-[#E8DCC6] text-gray-900 hover:bg-[#E8DCC6]/90"
                        : "border-gray-300"
                    }`}
                  >
                    One-time Purchase
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPurchaseType("subscription")}
                    className={`flex-1 ${
                      purchaseType === "subscription"
                        ? "bg-[#E8DCC6] border-[#E8DCC6] text-gray-900 hover:bg-[#E8DCC6]/90"
                        : "border-gray-300"
                    }`}
                  >
                    Subscriptions
                  </Button>
                </div>

                {/* Categories - Only show for one-time purchases */}
                {purchaseType === "one-time" && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Menu for One-time Purchases
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center justify-between group ${
                        selectedCategory === null ? 'bg-gray-100 font-medium' : ''
                      }`}
                    >
                      <span>All Products</span>
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.category_id}
                        onClick={() => setSelectedCategory(category.category_id)}
                        className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center justify-between group ${
                          selectedCategory === category.category_id ? 'bg-gray-100 font-medium' : ''
                        }`}
                      >
                        <span>{category.category_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                )}

                {/* Subscription Info - Only show for subscription tab */}
                {purchaseType === "subscription" && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    My Subscriptions
                  </h3>
                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-200 mb-6">
                    <p className="text-sm text-pink-900 font-medium mb-2">
                      Active Subscriptions
                    </p>
                    <p className="text-xs text-pink-700">
                      Manage your recurring orders and deliveries
                    </p>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Products Grid / Subscriptions */}
            <div className="lg:col-span-3">
              {/* Toolbar */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {purchaseType === "subscription" 
                    ? "My Subscriptions"
                    : selectedCategory 
                    ? categories.find(c => c.category_id === selectedCategory)?.category_name || "Products"
                    : "All Products"}
                </h2>
                <p className="text-gray-600 mb-4">
                  {purchaseType === "subscription"
                    ? "Manage your recurring orders and deliveries"
                    : "Crafted with passion, enjoyed in every bite. Taste the difference!"}
                </p>
                {purchaseType === "one-time" && (
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="relative flex-1 sm:flex-initial min-w-[150px] sm:min-w-0">
                    <Input
                      placeholder="Q Search Products"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full sm:w-48 text-sm sm:text-base "
                      style={{color:"black"}}
                    />
                    {searchLoading && search && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#2952E6] border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`${showFilters ? "bg-[#2952E6] text-white" : ""}`}
                  >
                    Filter
                  </Button>
                </div>
                )}
              </div>

              {/* Filter Panel - Only for one-time purchases */}
              {purchaseType === "one-time" && showFilters && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Filter</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="coffee-type" className="text-sm font-medium text-gray-700 mb-2 block">
                          Coffee Type
                        </label>
                        <Select value={coffeeType || "all"} onValueChange={(value) => setCoffeeType(value === "all" ? "" : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="arabica">Arabica</SelectItem>
                            <SelectItem value="robusta">Robusta</SelectItem>
                            <SelectItem value="blend">Blend</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label htmlFor="roast-level" className="text-sm font-medium text-gray-700 mb-2 block">
                          Roast Level
                        </label>
                        <Select value={roastLevel || "all"} onValueChange={(value) => setRoastLevel(value === "all" ? "" : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleResetFilters}
                      >
                        Reset
                      </Button>
                      <Button 
                        className="flex-1 bg-[#2952E6] hover:bg-[#1e3fb3]"
                        onClick={handleApplyFilters}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Products Grid / Subscriptions */}
              {(() => {
                // Show subscriptions if subscription tab is selected
                if (purchaseType === "subscription") {
                  if (subscriptionsLoading) {
                    return <LoadingWithLogo message="Loading subscriptions..." size="lg" />
                  }
                  if (!isAuthenticated) {
                    return (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-lg font-medium mb-2">Please login to view subscriptions</p>
                        <Link href="/auth/login">
                          <Button className="mt-4">Login</Button>
                        </Link>
                      </div>
                    )
                  }
                  if (subscriptions.length === 0) {
                    return (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-lg font-medium mb-2">No active subscriptions</p>
                        <p className="text-sm text-gray-400">
                          Start a subscription by adding products to your cart
                        </p>
                      </div>
                    )
                  }
                  return (
                    <div className="space-y-4 mb-8">
                      {subscriptions.map((subscription: any) => (
                        <Card key={subscription.order_id} className="overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-xl font-bold">Subscription #{subscription.order_id}</h3>
                                  <Badge variant={subscription.order_status === 1 ? "default" : "secondary"}>
                                    {subscription.order_status === 1 ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                {subscription.products && subscription.products.length > 0 && (
                                  <div className="space-y-2 mb-4">
                                    {subscription.products.map((product: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-3 text-sm">
                                        <span className="font-medium">{product.product_name}</span>
                                        <span className="text-gray-500">x{product.quantity}</span>
                                        <span className="ml-auto font-bold">${parseFloat(product.total).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {subscription.delivery_address && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    <strong>Delivery Address:</strong> {subscription.delivery_address}
                                  </p>
                                )}
                                {subscription.delivery_date_time && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    <strong>Next Delivery:</strong> {new Date(subscription.delivery_date_time).toLocaleDateString()}
                                  </p>
                                )}
                                {subscription.order_comments && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    <strong>Notes:</strong> {subscription.order_comments}
                                  </p>
                                )}
                                <div className="mt-4 flex gap-2">
                                  <span className="text-lg font-bold">Total: ${parseFloat(subscription.order_total || 0).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )
                }

                // Show products for one-time purchases
                if (loading) {
                  return <LoadingWithLogo message="Loading products..." size="lg" />
                }
                if (searchLoading && search) {
                  return <LoadingWithLogo message="Searching products..." size="md" />
                }
                if (products.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg font-medium mb-2">
                        {debouncedSearch || selectedCategory || coffeeType || roastLevel
                          ? "No products found matching your filters"
                          : "No products available at the moment"}
                      </p>
                      {(debouncedSearch || selectedCategory || coffeeType || roastLevel) && (
                        <Button variant="outline" onClick={handleResetFilters} className="mt-4">
                          Clear Filters
                        </Button>
                      )}
                      <p className="text-sm text-gray-400">
                        Try adjusting your filters or search terms
                      </p>
                    </div>
                  )
                }
                return (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <Card key={product.product_id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                      <div className="relative aspect-square bg-gray-900">
                        {getProductImageUrl(product) ? (
                          <img
                            src={getProductImageUrl(product)!}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/30" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-white text-center">
                                <div className="text-6xl font-light mb-2">25g</div>
                                <div className="text-sm">SAMPLE PACK</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-1">{product.product_name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {(() => {
                            // Debug logging
                            if (product.has_discount) {
                              console.log(`Product ${product.product_id} has discount:`, {
                                has_discount: product.has_discount,
                                original_price: product.original_price,
                                discounted_price: product.discounted_price,
                                discount_percentage: product.discount_percentage
                              })
                            }
                            
                            // Check if discount should be shown
                            const shouldShowDiscount = product.has_discount && 
                              typeof product.original_price === 'number' && 
                              typeof product.discounted_price === 'number' &&
                              product.original_price > 0 &&
                              product.discounted_price > 0
                            
                            if (shouldShowDiscount && product.original_price && product.discounted_price) {
                              return (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500 line-through">
                                    ${product.original_price.toFixed(2)}
                                  </span>
                                  <span className="text-xl font-bold text-[#2952E6]">
                                    ${product.discounted_price.toFixed(2)}
                                  </span>
                                  {product.discount_percentage && product.discount_percentage > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {product.discount_percentage}% OFF
                                    </Badge>
                                  )}
                                </div>
                              )
                            }
                            
                            return (
                              <span className="text-xl font-bold text-[#2952E6]">
                                ${Number.parseFloat(product.product_price).toFixed(2)}
                              </span>
                            )
                          })()}
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {product.product_description}
                        </p>
                        <div className="flex gap-2">
                          <Link href={`/shop/${product.product_id}`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full">
                              View Details
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            className="bg-[#2952E6] hover:bg-[#1e3fb3]"
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                )
              })()}

              {/* Pagination */}
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full bg-[#2952E6] text-white">
                  1
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  2
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<LoadingWithLogo message="Loading..." size="lg" />}>
      <ShopPageContent />
    </Suspense>
  )
}

