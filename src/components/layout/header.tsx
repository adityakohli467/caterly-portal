"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import { useCartStore } from "@/store/cart"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, User, ShoppingCart, LogOut, UserCircle } from "lucide-react"
import { useQuoteModalStore } from "@/store/quote-modal"
import { useAuthModalStore } from "@/store/auth-modal"

export function Header() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const openQuoteModal = useQuoteModalStore((s) => s.open)
  const openAuthModal = useAuthModalStore((s) => s.openModal)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const cartItems = useCartStore((state) => state.items)
  const totalItems = cartItems.length

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E6E6E6]">
      {/* ================= MAIN BAR ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[72px]">

          {/* LOGO CONTAINER */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center h-full">
              <Image
                src="/assets/images/cat.svg"
                alt="Caterly Logo"
                width={200}
                height={60}
                className="object-contain h-[50px] md:h-[60px] lg:h-[70px] w-auto"
                priority
              />
            </Link>
          </div>

          {/* DESKTOP RIGHT (NAV + ACTIONS) */}
          <div className="hidden md:flex items-center gap-10">
            {/* NAVIGATION LINKS */}
            <nav className="flex items-center gap-10 text-[16px] font-medium text-black">
              <Link
                href="/"
                className={`transition-colors hover:text-[#E03A3E] ${pathname === '/' ? 'text-[#E03A3E] font-semibold' : ''}`}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className={`transition-colors hover:text-[#cc3236] ${pathname.startsWith('/shop') ? 'text-[#E03A3E] font-semibold' : ''}`}
              >
                Order Now
              </Link>
              <Link
                href="/call"
                className={`transition-colors hover:text-[#E03A3E] ${pathname === '/call' ? 'text-[#E03A3E] font-semibold' : ''}`}
              >
                Contact
              </Link>
            </nav>

            {/* ACTION ICONS */}
            <div className="flex items-center gap-6">
              <Link
                href="/checkout"
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 group transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-[#E03A3E]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E03A3E] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </Link>

              {isAuthenticated && user ? (
                <DropdownMenu
                  trigger={
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 cursor-pointer">
                      <User className="w-6 h-6 text-[#E03A3E]" />
                      <span className="text-sm font-medium text-black truncate max-w-[120px]">
                        {user.username}
                      </span>
                    </div>
                  }
                  align="right"
                >
                  <div className="px-4 py-4 border-b">
                    <div className="font-semibold text-black">{user.username}</div>
                    {user.email && (
                      <div className="text-sm text-gray-500 mt-1">
                        {user.email}
                      </div>
                    )}
                  </div>

                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-3">
                      <UserCircle className="w-5 h-5" />
                      Account
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-[#E03A3E]"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenu>
              ) : pathname === '/checkout' ? (
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <User className="w-6 h-6 text-[#E03A3E]" />
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <User className="w-6 h-6 text-[#E03A3E]" />
                </Link>
              )}
            </div>
          </div>

          {/* MOBILE RIGHT - Cart + Menu */}
          <div className="md:hidden flex items-center gap-3">
            {/* Cart Icon */}
            <Link
              href="/checkout"
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ShoppingCart className="w-6 h-6 text-[#E03A3E]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E03A3E] text-white text-xs font-bold rounded-full px-2">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Menu Button */}
            <button
              onClick={() => setOpen(true)}
              className="text-[#E03A3E]"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE MENU (DESKTOP STYLE) ================= */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          {/* TOP BAR */}
          <div className="flex items-center justify-between h-[72px] px-4 border-b border-[#E6E6E6]">
            <Link href="/" onClick={() => setOpen(false)}>
              <Image
                src="/assets/images/cat.svg"
                alt="Caterly Logo"
                width={120}
                height={40}
                className="object-contain max-h-[48px] w-auto h-auto"
              />
            </Link>
            <button onClick={() => setOpen(false)}>
              <X className="w-7 h-7 text-[#E03A3E]" />
            </button>
          </div>

          {/* NAV + ACTIONS (SAME AS DESKTOP) */}
          <div className="px-6 pt-8 space-y-8">

            <nav className="flex flex-col gap-6 text-[16px] font-medium text-black">
              <Link href="/" onClick={() => setOpen(false)} className={`transition-colors hover:text-[#E03A3E] ${pathname === '/' ? 'text-[#E03A3E] font-semibold' : ''}`}>Home</Link>
              <Link href="/shop" onClick={() => setOpen(false)} className={`transition-colors hover:text-[#E03A3E] ${pathname.startsWith('/shop') ? 'text-[#E03A3E] font-semibold' : ''}`}>Order Now</Link>

              <Link
                href="/call"
                onClick={() => setOpen(false)}
                className="hover:text-[#E03A3E]"
              >
                Contact
              </Link>

              <button
                onClick={() => { openQuoteModal(); setOpen(false) }}
                className="bg-[#E03A3E] text-white px-6 py-3 rounded-[10px] font-semibold text-center"
              >
                Request a Quote
              </button>
            </nav>

            <div className="flex items-center gap-6 pt-6">
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <ShoppingCart className="w-6 h-6 text-[#E03A3E]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E03A3E] text-white text-xs font-bold rounded-full px-2">
                    {totalItems}
                  </span>
                )}
              </Link>

              {isAuthenticated && user ? (
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#E03A3E]" />
                    <span className="font-medium text-black">{user.username}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <Link
                      href="/account"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 text-black font-medium"
                    >
                      <UserCircle className="w-5 h-5 text-[#E03A3E]" />
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setOpen(false)
                      }}
                      className="flex items-center gap-2 text-[#E03A3E] font-medium"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : pathname === '/checkout' ? (
                <button
                  onClick={() => {
                    openAuthModal('login')
                    setOpen(false)
                  }}
                  className="flex items-center gap-2"
                >
                  <User className="w-5 h-5 text-[#E03A3E]" />
                  Login
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2"
                >
                  <User className="w-5 h-5 text-[#E03A3E]" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
