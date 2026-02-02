"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { LoadingWithLogo } from "@/components/loading-with-logo"
import { getProductImageUrl } from "@/lib/product-utils"
import { Search } from "lucide-react"

interface Product {
  product_id: number
  product_name: string
  product_description: string
  product_price: string
  original_price?: number
  discounted_price?: number
  has_discount?: boolean
  discount_percentage?: number
  product_image?: string
  product_images?: Array<{ image_url: string } | string> | null
}

interface Category {
  category_id: number
  category_name: string
}

function ShopPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addItem } = useCartStore()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(() => {
    // Initialize from URL on first render
    const categoryParam = searchParams.get('category')
    return categoryParam ? parseInt(categoryParam) : null
  })
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  // Debounce search
  useEffect(() => {
    if (search) setSearchLoading(true)
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchCategories = async () => {
    try {
      const res = await api.get("/store/products/categories")
      const all = res.data.categories || []
      const filtered = all.filter(
        (cat: Category) => cat.category_name?.toLowerCase() !== "catering packages"
      )
      setCategories(filtered)
    } catch (err) {
      console.error("Failed to fetch categories", err)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = { limit: 50 }
      if (selectedCategory) params.category_id = selectedCategory
      if (debouncedSearch) params.search = debouncedSearch

      const res = await api.get("/store/products", { params })
      setProducts(res.data.products || [])
    } catch (err) {
      console.error("Failed to fetch products", err)
      setProducts([])
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, debouncedSearch])

  const handleAddToCart = (product: Product) => {
    const priceToUse =
      product.has_discount && product.discounted_price
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
    <div className="bg-white min-h-screen">

      {/* HEADER */}
      <section className="w-full bg-white border-b">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Catering
          </h1>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">

            {/* LEFT SIDEBAR */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">

                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    router.push('/shop')
                  }}
                  className="w-full bg-[#E03A3E] text-white py-2 rounded-md text-sm font-semibold hover:bg-[#cc3236]"
                >
                  All Menu
                </button>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Categories</h4>
                  <ul className="space-y-1 text-sm">
                    {categories.map(cat => (
                      <li
                        key={cat.category_id}
                        onClick={() => {
                          setSelectedCategory(cat.category_id)
                          router.push(`/shop?category=${cat.category_id}`)
                        }}
                        className={`px-3 py-1.5 rounded-md cursor-pointer ${selectedCategory === cat.category_id
                          ? "bg-[#FFF1F1] text-[#E03A3E] font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                          }`}
                      >
                        {cat.category_name}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="lg:col-span-3">

              {/* TOOLBAR */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-black leading-tight">
                    {selectedCategory
                      ? categories.find(c => c.category_id === selectedCategory)?.category_name
                      : "All Products"}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Crafted with passion, enjoyed in every bite. Taste the difference!
                  </p>
                </div>

                <div className="relative w-full sm:w-[320px]">
                  <Input
                    type="text"
                    placeholder="Search Products"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-[#F1C6C6] rounded-lg pl-10 pr-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#E03A3E]" />
                </div>
              </div>

              {/* PRODUCT GRID */}
              {loading ? (
                <LoadingWithLogo message="Loading products..." size="lg" />
              ) : searchLoading ? (
                <LoadingWithLogo message="Searching products..." size="md" />
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No products found
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <div
                      key={product.product_id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                    >
                      <img
                        src={getProductImageUrl(product) || "/assets/images/placeholder.jpg"}
                        alt={product.product_name}
                        className="w-full h-44 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900">
                          {product.product_name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {product.product_description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-semibold text-gray-900">
                            $
                            {product.has_discount && product.discounted_price
                              ? product.discounted_price
                              : product.product_price}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-[#E03A3E] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#cc3236] transition"
                          >
                            Order
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PAGINATION UI PLACEHOLDER */}
              <div className="flex justify-center gap-3 mt-10">
                <button className="w-10 h-10 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed">
                  ←
                </button>
                <button className="w-10 h-10 bg-[#E03A3E] text-white rounded-md hover:bg-[#cc3236]">
                  →
                </button>
              </div>

            </main>
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
