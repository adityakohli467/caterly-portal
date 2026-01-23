"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth"
import { useCartStore } from "@/store/cart"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, User, ShoppingCart, LogOut, UserCircle } from "lucide-react"

export function Header() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()

  // ✅ Subscribe directly to cart items for instant updates
  const cartItems = useCartStore((state) => state.items)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E6E6E6]">
      {/* ================= MAIN BAR ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[72px]">

          {/* LOGO */}
          <Link href="/" className="flex items-center h-full">
            <Image
              src="/assets/images/cat_logo.png"
              alt="Caterly Logo"
              width={140}
              height={48}
              className="object-contain max-h-[48px]"
              priority
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-10 text-[16px] font-medium text-black">
            <Link href="/" className="hover:text-[#E03A3E]">
              Home
            </Link>

            <Link href="/shop" className="hover:text-[#E03A3E]">
              Catering
            </Link>

            <Link
              href="/call"
              className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-6 py-2 rounded-[10px] font-semibold text-sm"
            >
              Contact
            </Link>

            {/*
            <Link href="/venue" className="hover:text-[#E03A3E]">
              Venue
            </Link>
            <Link href="/staff" className="hover:text-[#E03A3E]">
              Staff
            </Link>
            */}
          </nav>

          {/* DESKTOP RIGHT */}
          <div className="hidden md:flex items-center gap-6">
            {/* CART */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
              aria-label="Cart"
            >
              <ShoppingCart className="w-6 h-6 text-[#E03A3E]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E03A3E] text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* PROFILE / LOGIN */}
            {isAuthenticated && user ? (
              <DropdownMenu
                trigger={
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 cursor-pointer">
                    <User className="w-6 h-6 text-[#E03A3E]" />
                    <span className="font-medium text-black text-sm max-w-[120px] truncate">
                      {user.username}
                    </span>
                  </div>
                }
                align="right"
              >
                {/* User Info Header */}
                <div className="px-4 py-4 border-b border-gray-200">
                  <div className="text-black font-semibold text-lg">
                    {user.username}
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    {user.email || `${user.username.toLowerCase()}@example.com`}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-3">
                      <UserCircle className="w-5 h-5" />
                      <span>Account</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={logout}
                    className="text-[#E03A3E] hover:bg-gray-100"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
                aria-label="Profile / Login"
              >
                <User className="w-6 h-6 text-[#E03A3E]" />
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-[#E03A3E]"
            aria-label="Open menu"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          {/* TOP BAR */}
          <div className="flex items-center justify-between h-[72px] px-4 border-b border-[#E6E6E6]">
            <Image
              src="/assets/images/cat_logo.png"
              alt="Caterly Logo"
              width={130}
              height={44}
              className="object-contain"
            />
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="w-7 h-7 text-[#E03A3E]" />
            </button>
          </div>

          {/* LINKS */}
          <nav className="flex flex-col px-6 pt-8 gap-6 text-[18px] font-medium text-black">
            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="/shop" onClick={() => setOpen(false)}>
              Catering
            </Link>

            <div className="pt-6 border-t border-gray-200">
              <Link
                href="/call"
                onClick={() => setOpen(false)}
                className="inline-block bg-[#E03A3E] text-white px-6 py-3 rounded-[12px] font-semibold text-center"
              >
                Contact
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
