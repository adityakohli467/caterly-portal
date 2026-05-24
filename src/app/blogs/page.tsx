"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight, Clock, User, ArrowRight } from "lucide-react"
import Image from "next/image"
import { api } from "@/lib/api"
import { LoadingWithLogo } from "@/components/loading-with-logo"

interface Blog {
  blog_id: number
  title: string
  slug: string
  category: string
  excerpt: string
  featured_image_url: string
  author: string
  tags: string[]
  read_time: number
  is_featured: boolean
  published_date: string
}

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch blogs and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch categories
        const categoriesRes = await api.get("/store/blogs/categories")
        setCategories(categoriesRes.data || [])

        // Fetch blogs
        const params = new URLSearchParams()
        if (selectedFilters.length > 0) {
          params.append("category", selectedFilters[0])
        }
        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim())
        }
        params.append("limit", "20")
        params.append("offset", String((currentPage - 1) * 20))

        const blogsRes = await api.get(`/store/blogs?${params.toString()}`)
        setBlogs(blogsRes.data.blogs || [])
        setTotalPages(Math.ceil((blogsRes.data.total || 0) / 20))
      } catch (error: any) {
        console.error("Failed to fetch blogs:", error)
        setBlogs([])
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedFilters, currentPage, searchQuery])

  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter))
    } else {
      setSelectedFilters([filter])
    }
  }

  // Get featured blog
  const featuredBlog = blogs.find(blog => blog.is_featured) || blogs[0]
  const otherBlogs = blogs.filter(blog => !blog.is_featured || blog.blog_id !== featuredBlog?.blog_id)

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Australia/Sydney",
    })
  }

  return (
    <div className="w-full bg-white">

      {/* ================================================= */}
      {/* HERO SECTION */}
      {/* ================================================= */}
      <section className="relative w-full h-[320px] md:h-[420px] overflow-hidden">
        <Image
          src="/assets/images/c3.jpg"
          alt="Caterly Blog"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[120px] w-full">
            <h1 className="text-[32px] md:text-[48px] font-semibold text-white leading-tight mb-3">
              Our <span className="text-[#E03A3E] italic">Blog</span>
            </h1>
            <p className="text-[14px] md:text-[16px] text-white/80 max-w-[520px]">
              Insights, updates, and everything we're passionate about —
              straight from our kitchen to your screen.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* SEARCH & FILTERS */}
      {/* ================================================= */}
      <section className="bg-white border-b border-[#E6E6E6]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[120px] py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            {/* Search */}
            <div className="relative w-full md:w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#E03A3E]" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-[#FDECEC] rounded-lg pl-10 pr-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilters([])}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedFilters.length === 0
                    ? "bg-[#E03A3E] text-white"
                    : "bg-[#FFF1F1] text-[#E03A3E] hover:bg-[#FFE0E0]"
                  }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleFilter(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedFilters.includes(category)
                      ? "bg-[#E03A3E] text-white"
                      : "bg-[#FFF1F1] text-[#E03A3E] hover:bg-[#FFE0E0]"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* FEATURED BLOG */}
      {/* ================================================= */}
      {featuredBlog && !loading && (
        <section className="bg-white py-12 md:py-16">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[120px]">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">

              {/* Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
                {featuredBlog.featured_image_url ? (
                  <Image
                    src={featuredBlog.featured_image_url}
                    alt={featuredBlog.title}
                    fill
                    className="object-cover"
                    unoptimized={true}
                    onError={(e) => {
                      console.error("Failed to load featured blog image:", featuredBlog.featured_image_url)
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#E03A3E]/20 to-[#E03A3E]/5 flex items-center justify-center">
                    <span className="text-[#E03A3E]/40 text-lg">No Image</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-[#E03A3E] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Featured
                  </span>
                </div>
              </div>

              {/* Content */}
              <div>
                {featuredBlog.category && (
                  <p className="text-xs text-[#E03A3E] uppercase font-semibold tracking-wider mb-3">
                    {featuredBlog.category}
                  </p>
                )}
                <h2 className="text-[24px] md:text-[32px] font-semibold text-black mb-4 leading-tight">
                  {featuredBlog.title}
                </h2>
                <p className="text-[14px] md:text-[15px] text-[#6B6B6B] leading-relaxed mb-6">
                  {featuredBlog.excerpt || "Read more to discover..."}
                </p>
                <div className="flex items-center gap-4 mb-6 text-sm text-[#6B6B6B]">
                  {featuredBlog.author && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {featuredBlog.author}
                    </span>
                  )}
                  {featuredBlog.read_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredBlog.read_time} min read
                    </span>
                  )}
                  {featuredBlog.published_date && (
                    <span>{formatDate(featuredBlog.published_date)}</span>
                  )}
                </div>
                <Link href={`/blogs/${featuredBlog.slug}`}>
                  <button className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-6 py-2.5 rounded-md text-sm font-semibold transition flex items-center gap-2">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================= */}
      {/* ALL BLOGS GRID */}
      {/* ================================================= */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[120px]">

          {/* Section Header */}
          <div className="mb-10">
            <h2 className="text-[24px] md:text-[32px] font-semibold text-black mb-2">
              Latest Articles
            </h2>
            <p className="text-[14px] md:text-[16px] text-[#6B6B6B]">
              Crafted with passion, enjoyed in every bite. Taste the difference!
            </p>
          </div>

          {loading ? (
            <LoadingWithLogo message="Loading blogs..." size="lg" />
          ) : otherBlogs.length === 0 ? (
            <div className="text-center py-16 text-[#6B6B6B]">
              <p className="text-lg mb-2">No blogs found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {otherBlogs.map((blog) => (
                <Link key={blog.blog_id} href={`/blogs/${blog.slug}`} className="group">
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-[#F2F2F2]">

                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {blog.featured_image_url ? (
                        <Image
                          src={blog.featured_image_url}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized={true}
                          onError={(e) => {
                            console.error("Failed to load blog image:", blog.featured_image_url)
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#E03A3E]/10 to-[#E03A3E]/5 flex items-center justify-center">
                          <span className="text-[#E03A3E]/30">No Image</span>
                        </div>
                      )}
                      {blog.read_time && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur-sm text-black text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {blog.read_time} MIN
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 md:p-6">
                      {blog.category && (
                        <p className="text-xs text-[#E03A3E] uppercase font-semibold tracking-wider mb-2">
                          {blog.category}
                        </p>
                      )}
                      <h3 className="text-[16px] md:text-[18px] font-semibold text-black mb-3 leading-snug line-clamp-2 group-hover:text-[#E03A3E] transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-[13px] text-[#6B6B6B] leading-relaxed mb-4 line-clamp-2">
                        {blog.excerpt || "Read more..."}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#999]">
                          {blog.author && <span>By {blog.author}</span>}
                          {blog.published_date && (
                            <span className="ml-2">{formatDate(blog.published_date)}</span>
                          )}
                        </div>
                        <span className="text-[#E03A3E] text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                onClick={() => {
                  setCurrentPage(p => Math.max(1, p - 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-md bg-[#F2F2F2] flex items-center justify-center text-[#9A9A9A] hover:bg-[#E6E6E6] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`w-10 h-10 rounded-md text-sm font-semibold transition ${currentPage === page
                      ? "bg-[#E03A3E] text-white"
                      : "bg-[#F2F2F2] text-black hover:bg-[#E6E6E6]"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-md bg-[#E03A3E] flex items-center justify-center text-white hover:bg-[#cc3236] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
