"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/cart"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { LoadingWithLogo } from "@/components/loading-with-logo"
import { getProductImageUrl } from "@/lib/product-utils"
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
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
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
      setCategories(res.data.categories || [])
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

  const fetchProducts = async () => {
    try {
      // If a parent category (with children) is selected, show empty — user must pick a subcategory
      if (selectedCategory && !debouncedSearch) {
        const isParent = getParentCategory(selectedCategory)
        if (isParent) {
          setProducts([])
          setLoading(false)
          return
        }
      }

      setLoading(true)
      setProducts([])

      // ── Search mode ──────────────────────────────────────────────────────
      if (debouncedSearch) {
        const res = await api.get("/store/products", { params: { limit: 100, search: debouncedSearch } })
        setProducts(res.data.products || [])
        return
      }

      // ── No category selected — show all ───────────────────────────────────
      if (!selectedCategory) {
        const res = await api.get("/store/products", { params: { limit: 100 } })
        setProducts(res.data.products || [])
        return
      }

      // ── Subcategory selected — smart dual-fetch strategy ──────────────────
      const parent = getParentOfChild(selectedCategory)
      const subCatNode = parent?.children?.find(c => c.category_id === selectedCategory)
      const subCatName = subCatNode?.category_name || ""

      // Fetch with subcategory ID AND parent ID in parallel
      const [subRes, parentRes] = await Promise.all([
        api.get("/store/products", { params: { limit: 100, category_id: selectedCategory } }),
        parent
          ? api.get("/store/products", { params: { limit: 100, category_id: parent.category_id } })
          : Promise.resolve({ data: { products: [] } })
      ])

      const subProducts: Product[] = subRes.data.products || []
      const parentProducts: Product[] = parentRes.data.products || []

      console.log(`[Shop] sub (id=${selectedCategory}, name="${subCatName}"): ${subProducts.length} products`)
      console.log(`[Shop] parent (id=${parent?.category_id}): ${parentProducts.length} products`)
      if (subProducts.length > 0) {
        console.log("[Shop] First sub product:", JSON.stringify(subProducts[0]))
      }

      // Pool = deduplicated union of both responses (prefer parent products since they're the full set)
      const seen = new Set<number>()
      const allPool: Product[] = []
      for (const p of [...parentProducts, ...subProducts]) {
        if (!seen.has(p.product_id)) { seen.add(p.product_id); allPool.push(p) }
      }

      // ── Step 1: Try client-side filter using the direct subcategory_id field ─
      // The API returns subcategory_id as a top-level field on each product.
      // categories[] only contains the PARENT category — NOT the subcategory.
      const clientFiltered = allPool.filter(p =>
        p.subcategory_id === selectedCategory ||
        (subCatName && p.subcategory_name?.toLowerCase().trim() === subCatName.toLowerCase().trim()) ||
        // Also check inside categories[] for backwards compatibility
        p.categories?.some(c =>
          c.category_id === selectedCategory ||
          (subCatName && c.category_name?.toLowerCase().trim() === subCatName.toLowerCase().trim())
        )
      )

      if (clientFiltered.length > 0) {
        console.log(`[Shop] Client filter matched ${clientFiltered.length} products ✓`)
        setProducts(clientFiltered)
        return
      }

      // ── Step 2: Client filter found nothing — check if API filters by subcategory ──
      // If sub response has FEWER products than parent, the API is subcategory-aware → trust it
      const apiFiltersCorrectly =
        subProducts.length > 0 &&
        (parentProducts.length === 0 || subProducts.length < parentProducts.length)

      if (apiFiltersCorrectly) {
        console.log(`[Shop] API-aware: showing ${subProducts.length} subcategory products ✓`)
        setProducts(subProducts)
        return
      }

      // ── Step 3: Neither client filter nor API filtering worked ────────────
      // The subcategory truly has no products (or API fell back to parent)
      console.log(`[Shop] No products found for "${subCatName}" (id=${selectedCategory})`)
      setProducts([])

    } catch (err) {
      console.error("Failed to fetch products", err)
      setProducts([])
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }



  useEffect(() => { fetchCategories() }, [])

  useEffect(() => {
    if (categories.length > 0 || selectedCategory === null) {
      fetchProducts()
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

  // Determine view mode
  const selectedCatName = selectedCategory
    ? findCategoryById(selectedCategory)?.category_name ?? "Products"
    : "All Products"

  const ProductCard = ({ product }: { product: Product }) => {
    const productUrl = selectedCategory
      ? `/shop/${product.product_id}?from=${selectedCategory}`
      : `/shop/${product.product_id}`
    return (
      <div
        onClick={() => router.push(productUrl)}
        className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
      >
        <div className="relative w-full bg-gray-50 overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <img
            src={getProductImageUrl(product) || "/assets/images/placeholder.jpg"}
            alt={product.product_name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-900 text-base leading-snug flex-1 mb-2">
            {product.product_name}
          </h3>
          <div className="flex items-center justify-between mt-auto">
            {parseFloat(product.has_discount && product.discounted_price
              ? product.discounted_price.toString()
              : product.product_price) > 0 && (
                <span className="text-lg font-bold text-gray-900">
                  ${product.has_discount && product.discounted_price
                    ? product.discounted_price
                    : product.product_price}
                </span>
              )}
            <button
              onClick={(e) => { e.stopPropagation(); router.push(productUrl) }}
              className="ml-auto bg-[#E03A3E] text-white px-5 py-1.5 rounded-md text-sm font-medium hover:bg-[#cc3236] transition"
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
      <section className="w-full bg-white border-b">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Catering Services</h1>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">

            {/* LEFT SIDEBAR */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">

                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Packages</h4>
                  <ul className="space-y-1 text-sm">
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
                                } else {
                                  selectSubcategory(parent.category_id)
                                }
                              }}
                              className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer font-bold text-[15px] ${(hasChildren ? isExpanded : selectedCategory === parent.category_id)
                                ? "text-[#E03A3E]"
                                : "hover:bg-gray-100 text-gray-800"
                                }`}
                            >
                              <span>{parent.category_name}</span>
                              {hasChildren && (
                                isExpanded
                                  ? <ChevronDown className="h-4 w-4 text-[#E03A3E]" />
                                  : <ChevronRight className="h-4 w-4 text-gray-400" />
                              )}
                            </div>

                            {/* Children — only visible when parent is expanded */}
                            {hasChildren && isExpanded && (
                              <ul className="mt-1 ml-3 space-y-0.5 border-l-2 border-gray-100 pl-3">
                                {parent.children!.map(child => (
                                  <li
                                    key={child.category_id}
                                    onClick={() => selectSubcategory(child.category_id)}
                                    className={`px-2 py-1 rounded-md cursor-pointer text-sm font-medium ${selectedCategory === child.category_id
                                      ? "bg-[#FFF1F1] text-[#E03A3E] font-semibold"
                                      : "hover:bg-gray-100 text-gray-700"
                                      }`}
                                  >
                                    {child.category_name}
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-black leading-tight">
                    {selectedCatName}
                  </h2>
                  {/* <p className="text-gray-500 text-sm mt-1">
                    Crafted with passion, enjoyed in every bite. Taste the difference!
                  </p> */}
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

              {/* PAGINATION PLACEHOLDER */}
              <div className="flex justify-center gap-3 mt-10">
                <button className="w-10 h-10 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed">←</button>
                <button className="w-10 h-10 bg-[#E03A3E] text-white rounded-md hover:bg-[#cc3236]">→</button>
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
