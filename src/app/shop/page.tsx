"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/cart"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { LoadingWithLogo } from "@/components/loading-with-logo"
import { getProductImageUrl, getProductImageUrls } from "@/lib/product-utils"
import { Search, ChevronRight, ChevronDown } from "lucide-react"

interface ProductCategory {
  category_id: number
  category_name: string
  parent_category_id?: number | null
}

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
  short_description?: string
  categories?: ProductCategory[]
  // Direct subcategory fields returned by the API
  subcategory_id?: number | null
  subcategory_name?: string | null
  parent_category_id?: number | null
  parent_category_name?: string | null
  min_quantity?: number | null
}

interface Category {
  category_id: number
  category_name: string
  parent_category_id?: number | null
  children?: Category[]
}

function ShopPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addItem } = useCartStore()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(() => {
    const c = searchParams.get('category')
    return c ? parseInt(c) : null
  })
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState(() => searchParams.get('search') || "")
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get('search') || "")
  const [loading, setLoading] = useState(false)
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
      const cats = res.data.categories || []
      setCategories(cats)

      // Auto-select "Breakfast" only if no category AND no search param is in the URL
      const hasSearch = !!searchParams.get('search')
      if (!selectedCategory && !hasSearch && cats.length > 0) {
        const breakfast = cats.find((c: Category) =>
          c.category_name?.toLowerCase().includes("breakfast")
        )
        if (breakfast) {
          setSelectedCategory(breakfast.category_id)
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories", err)
    }
  }

  // Is this category id a parent (has children)?
  const getParentCategory = (id: number): Category | null => {
    const cat = categories.find(c => c.category_id === id)
    return (cat && cat.children && cat.children.length > 0) ? cat : null
  }

  // Get the parent of a given child category id
  const getParentOfChild = (childId: number): Category | null =>
    categories.find(c => c.children?.some(ch => ch.category_id === childId)) || null

  // Find category name by id (searches parents + their children)
  const findCategoryById = (id: number): Category | undefined => {
    for (const cat of categories) {
      if (cat.category_id === id) return cat
      const child = cat.children?.find(c => c.category_id === id)
      if (child) return child
    }
    return undefined
  }

  useEffect(() => { fetchCategories() }, [])

  useEffect(() => {
    let isActive = true

    const fetchProducts = async () => {
      try {
        // (Removed restriction that showed empty products for parent categories)

        setLoading(true)
        if (isActive) setProducts([])

        const sortAndSetProducts = (productList: Product[]) => {
          const sorted = [...productList].sort((a, b) => {
            const priceA = parseFloat(a.product_price) || 0
            const priceB = parseFloat(b.product_price) || 0
            return priceA - priceB
          })
          if (isActive) setProducts(sorted)
        }

        // ── Search mode ──────────────────────────────────────────────────────
        if (debouncedSearch) {
          const res = await api.get("/store/products", { params: { limit: 100, search: debouncedSearch } })
          sortAndSetProducts(res.data.products || [])
          return
        }

        // ── No category selected — show all ───────────────────────────────────
        if (!selectedCategory) {
          const res = await api.get("/store/products", { params: { limit: 100 } })
          sortAndSetProducts(res.data.products || [])
          return
        }

        // ── Category selected — simple direct fetch ─────────────────────────
        const res = await api.get("/store/products", {
          params: {
            limit: 100,
            category_id: selectedCategory
          }
        })
        const apiProducts: Product[] = res.data.products || []

        const selectedNode = findCategoryById(selectedCategory)
        const selectedName = selectedNode?.category_name || ""

        // Client-side filter as backup (some APIs return all products if filter is not supported)
        // If the API correctly filtered, this won't remove anything.
        const filtered = apiProducts.filter(p =>
          p.subcategory_id === selectedCategory ||
          p.parent_category_id === selectedCategory ||
          p.categories?.some(c => c.category_id === selectedCategory) ||
          (selectedName && (
            p.subcategory_name?.toLowerCase().trim() === selectedName.toLowerCase().trim() ||
            p.parent_category_name?.toLowerCase().trim() === selectedName.toLowerCase().trim() ||
            p.categories?.some(c => c.category_name?.toLowerCase().trim() === selectedName.toLowerCase().trim())
          ))
        )

        // Use client-side filtered result to prevent showing all items if category has no items.
        sortAndSetProducts(filtered)

      } catch (err) {
        console.error("Failed to fetch products", err)
        if (isActive) setProducts([])
      } finally {
        if (isActive) {
          setLoading(false)
          setSearchLoading(false)
        }
      }
    }

    if (categories.length > 0 || selectedCategory === null) {
      fetchProducts()
    }

    // Cleanup to prevent race conditions during rapid clicking
    return () => {
      isActive = false
    }
  }, [selectedCategory, debouncedSearch, categories])

  const handleAddToCart = (product: Product) => {
    const priceToUse =
      product.has_discount && product.discounted_price
        ? product.discounted_price.toString()
        : product.product_price
    const minQty = product.min_quantity ? Math.max(1, parseInt(String(product.min_quantity))) : 1
    addItem({
      product_id: product.product_id,
      product_name: product.product_name,
      product_price: priceToUse,
      product_image: getProductImageUrl(product),
      quantity: minQty,
    })
    if (minQty > 1) {
      toast.success(`${product.product_name} added to cart (minimum order: ${minQty})`)
    } else {
      toast.success(`${product.product_name} added to cart`)
    }
  }

  // Toggle a parent category's expanded state — only expands sidebar, never loads products
  const toggleParent = (id: number) => {
    setExpandedParents(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    // Do NOT change selectedCategory or navigate — just expand/collapse the sidebar
  }

  // Select a subcategory (triggers product load)
  const selectSubcategory = (id: number) => {
    setSelectedCategory(id)
    router.push(`/shop?category=${id}`)
  }

  // Auto-expand the parent of the currently selected subcategory
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const parent = getParentOfChild(selectedCategory)
      if (parent) {
        setExpandedParents(prev => new Set([...prev, parent.category_id]))
      }
    }
  }, [selectedCategory, categories])

  // Determine view mode — show search term as heading if searching, else category name
  const selectedCatName = debouncedSearch
    ? debouncedSearch
    : selectedCategory
      ? findCategoryById(selectedCategory)?.category_name ?? "Products"
      : "All Products"

  const ProductCard = ({ product }: { product: Product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const imageUrls = getProductImageUrls(product)

    useEffect(() => {
      if (imageUrls.length <= 1) return
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)
      }, 2000) // cycle every 2s automatically
      return () => clearInterval(interval)
    }, [imageUrls.length])

    const productUrl = selectedCategory
      ? `/shop/${product.product_id}?from=${selectedCategory}`
      : `/shop/${product.product_id}`
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => router.push(productUrl)}
        className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col h-full"
      >
        <div className="relative w-full bg-gray-50 overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {imageUrls.map((url, index) => (
            <img
              key={url + index}
              src={url || "/assets/images/placeholder.jpg"}
              alt={product.product_name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"
                } group-hover:scale-105 transition-transform duration-500`}
            />
          ))}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="min-h-[3rem] mb-2">
            <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
              {product.product_name}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
            <div className="flex flex-col">
              {parseFloat(product.has_discount && product.discounted_price
                ? product.discounted_price.toString()
                : product.product_price) > 0 && (
                  <span className="text-lg font-bold text-[#E03A3E]">
                    ${product.has_discount && product.discounted_price
                      ? product.discounted_price
                      : product.product_price}
                  </span>
                )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(productUrl) }}
              className="ml-auto bg-[#E03A3E] text-white px-5 py-1.5 rounded-md text-sm font-medium hover:bg-[#cc3236] transition shadow-sm"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">

      {/* HEADER */}
      <section className="bg-white py-12 md:py-16 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-[28px] md:text-[36px] font-bold text-primary mb-3 md:mb-4">
            Our Catering Services
          </h1>
          <p className="text-[14px] md:text-[16px] text-[#6B6B6B] max-w-[640px] mx-auto px-4">
            Freshly prepared catering packages for every occasion, delivered to your door.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">

            {/* LEFT SIDEBAR */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">

                <div className="mb-6">
                  <h4 className="text-[18px] font-bold text-gray-900 mb-2 border-b-2 border-red-500 pb-1 inline-block">
                    Packages
                  </h4>
                  <ul className="space-y-2 mt-4">
                    {categories
                      .filter(cat => !cat.parent_category_id)
                      .map(parent => {
                        const hasChildren = parent.children && parent.children.length > 0
                        const isExpanded = expandedParents.has(parent.category_id)
                        return (
                          <li key={parent.category_id}>
                            {/* Parent — if it has children, expand/collapse; if no children, select it */}
                            <div
                              onClick={() => {
                                if (hasChildren) {
                                  toggleParent(parent.category_id)
                                }
                                selectSubcategory(parent.category_id)
                              }}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${(hasChildren ? isExpanded : selectedCategory === parent.category_id)
                                  ? "bg-red-50 text-[#E03A3E]"
                                  : "hover:bg-gray-50 text-gray-700"
                                }`}
                            >
                              <span className="font-semibold text-[15px] capitalize">
                                {parent.category_name?.toLowerCase() || ''}
                              </span>
                              {hasChildren && (
                                <ChevronRight
                                  className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-90 text-[#E03A3E]" : "text-gray-400 group-hover:text-gray-600"
                                    }`}
                                />
                              )}
                            </div>

                            {/* Children — only visible when parent is expanded */}
                            {hasChildren && isExpanded && (
                              <ul className="mt-1 ml-4 space-y-1 mb-2">
                                {parent.children!.map((child) => (
                                  <li
                                    key={child.category_id}
                                    onClick={() => selectSubcategory(child.category_id)}
                                    className={`relative pl-4 pr-3 py-1.5 rounded-md cursor-pointer text-[14px] transition-all duration-200 capitalize ${selectedCategory === child.category_id
                                        ? "text-[#E03A3E] font-bold bg-white shadow-sm ring-1 ring-red-100"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                      }`}
                                  >
                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${selectedCategory === child.category_id ? "bg-[#E03A3E]" : "bg-gray-200"
                                      }`} />
                                    {child.category_name?.toLowerCase() || ''}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        )
                      })}
                  </ul>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="lg:col-span-3">

              {/* TOOLBAR */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight capitalize">
                    {selectedCatName || "All Products"}
                  </h2>
                  <div className="h-1 w-12 bg-[#E03A3E] mt-2 rounded-full mx-auto md:mx-0"></div>
                </div>
                <div className="relative w-full max-w-[400px]">
                  <Input
                    type="text"
                    placeholder="Search catering packages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border-gray-200 rounded-xl pl-12 pr-4 py-6 text-[16px] text-black placeholder:text-gray-400 focus:border-[#E03A3E] focus:ring-4 focus:ring-red-50 shadow-sm transition-all"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#E03A3E]" />
                </div>
              </div>

              {loading ? (
                <LoadingWithLogo message="Loading products..." size="lg" />
              ) : searchLoading ? (
                <LoadingWithLogo message="Searching products..." size="md" />
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No products found</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.product_id} product={product} />
                  ))}
                </div>
              )}


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
