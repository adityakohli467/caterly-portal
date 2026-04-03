"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { useCartStore } from "@/store/cart"
import { Search, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { getProductImageUrl, getProductImageUrls } from "@/lib/product-utils"

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
  show_in_storefront?: boolean | number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const { addItem } = useCartStore()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = { limit: 50 }
      if (search) params.search = search

      const response = await api.get("/store/products", { params })
      console.log("Products API Response:", response.data)
      setProducts(response.data.products || [])
    } catch (error: any) {
      console.error("Failed to fetch products:", error)
      // Don't show error for 401 (auth) - products should work without auth
      if (error.response?.status !== 401) {
        toast.error("Failed to load products. Please try again.")
      }
      setProducts([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      product_id: product.product_id,
      product_name: product.product_name,
      product_price: product.product_price,
      product_image: getProductImageUrl(product),
    })
    toast.success(`${product.product_name} added to cart`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Our Menu</h1>
        <p className="text-gray-600 text-lg">
          Browse our delicious selection of catering options
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="flex gap-4 max-w-2xl">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchProducts}>Search</Button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">
            {search ? "No products found matching your search" : "No products available at the moment"}
          </p>
          {search && (
            <Button variant="outline" onClick={() => {
              setSearch("")
              fetchProducts()
            }} className="mt-4">
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products
            .filter((p) => p.show_in_storefront !== false && p.show_in_storefront !== 0)
            .map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
        </div>
      )}
    </div>
  )

  function ProductCard({ product }: { product: Product }) {
    const [index, setIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const images = getProductImageUrls(product)

    useEffect(() => {
      if (!images || images.length <= 1) return
      const t = setInterval(() => setIndex(i => (i + 1) % images.length), 2000)
      return () => clearInterval(t)
    }, [images.length])

    return (
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col"
      >
        <div className="aspect-square bg-gray-200 relative overflow-hidden">
          {images.length > 0 ? (
            images.map((url: string, i: number) => (
              <img
                key={url + i}
                src={url}
                alt={product.product_name}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${i === index ? "opacity-100" : "opacity-0"
                  }`}
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        <CardContent className="pt-4 flex flex-col flex-1">
          <h3 className="font-bold text-lg mb-2">{product.product_name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.product_description}
          </p>
          <div className="flex items-center justify-between mt-auto">
            {product.has_discount && product.original_price && product.discounted_price ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 line-through">
                  ${product.original_price.toFixed(2)}
                </span>
                <span className="text-xl font-bold text-primary">
                  ${product.discounted_price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-primary">
                ${parseFloat(product.product_price).toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Link href={`/shop/${product.product_id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
            <Button onClick={() => handleAddToCart(product)}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
}


