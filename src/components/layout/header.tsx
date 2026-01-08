// "use client"

// import Link from "next/link"
// import Image from "next/image"
// import { useEffect, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
// import { useAuthStore } from "@/store/auth"
// import { useCartStore } from "@/store/cart"
// import { ShoppingCart, Menu, X, User, LogOut, LogIn } from "lucide-react"

// export function Header() {
//   const { isAuthenticated, user, logout, checkAuth } = useAuthStore()
//   const { getTotalItems } = useCartStore()
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
//   const [mounted, setMounted] = useState(false)

//   useEffect(() => {
//     setMounted(true)
//     checkAuth()
//   }, [checkAuth])

//   // Close mobile menu when route changes
//   useEffect(() => {
//     setMobileMenuOpen(false)
//   }, [])

//   return (
//     <header className="sticky top-0 z-50 shadow-md bg-[#0a0a0a] border-b border-[#1a1a1a]">
//       {/* Main Navigation */}
//       <div className="container mx-auto px-4 sm:px-6">
//         <div className="flex items-center justify-between h-16 sm:h-20 min-h-[64px] sm:min-h-[80px]">
//           {/* Logo - ZENN Text */}
//           <Link href="/" className="flex items-center py-2 sm:py-3" onClick={() => setMobileMenuOpen(false)}>
//             <span className="text-white text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Albert Sans', fontWeight: 700 }}>
//               ZENN
//             </span>
//           </Link>

//           {/* Desktop Navigation */}
//           <nav className="hidden lg:flex items-center gap-6 xl:gap-10">
//             <Link href="/" className="text-white hover:text-[#055160] transition-colors text-base font-medium" style={{ fontFamily: 'Albert Sans' }}>
//               HOME
//             </Link>
//             <Link href="/shop" className="text-white hover:text-[#055160] transition-colors text-base font-medium" style={{ fontFamily: 'Albert Sans' }}>
//               CATERING
//             </Link>
//             <Link href="/contact" className="text-white hover:text-[#055160] transition-colors text-base font-medium" style={{ fontFamily: 'Albert Sans' }}>
//               CONTACT
//             </Link>
//           </nav>

//           {/* Desktop Actions */}
//           <div className="hidden lg:flex items-center gap-4 xl:gap-6">
//             <Link href="/quote">
//               <Button className="bg-[#055160] hover:bg-[#04414d] text-white px-6 py-2 text-base" style={{ fontFamily: 'Albert Sans', fontWeight: 600 }}>
//                 ORDER NOW
//               </Button>
//             </Link>
//             <Link href="/cart" className="flex items-center gap-2 text-white hover:text-[#055160] transition-colors whitespace-nowrap">
//               <ShoppingCart className="h-5 w-5" />
//               {mounted && getTotalItems() > 0 && (
//                 <span className="text-sm">({getTotalItems()})</span>
//               )}
//             </Link>

//             {!mounted ? (
//               // Show nothing during SSR to prevent hydration mismatch
//               <div className="flex items-center gap-3" style={{ minHeight: '40px' }}></div>
//             ) : isAuthenticated ? (
//               <DropdownMenu
//                 trigger={
//                   <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a] hover:bg-[#055160] text-white transition-colors border border-[#2a2a2a]">
//                     <User className="h-5 w-5" />
//                   </button>
//                 }
//                 align="right"
//               >
//                 <div className="py-1 bg-[#0a0a0a] border border-[#1a1a1a]">
//                   <div className="px-4 py-2 border-b border-[#1a1a1a]">
//                     <p className="text-sm font-medium text-white">
//                       {user?.username || user?.email?.split('@')[0] || 'User'}
//                     </p>
//                     {user?.email && (
//                       <p className="text-xs text-gray-400 truncate">{user.email}</p>
//                     )}
//                   </div>
//                   <DropdownMenuItem asChild>
//                     <Link href="/account" className="flex items-center gap-2">
//                       <User className="h-4 w-4" />
//                       Account
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={logout} className="text-red-600">
//                     <div className="flex items-center gap-2">
//                       <LogOut className="h-4 w-4" />
//                       Logout
//                     </div>
//                   </DropdownMenuItem>
//                 </div>
//               </DropdownMenu>
//             ) : (
//               <DropdownMenu
//                 trigger={
//                   <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a] hover:bg-[#055160] text-white transition-colors border border-[#2a2a2a]">
//                     <User className="h-5 w-5" />
//                   </button>
//                 }
//                 align="right"
//               >
//                 <div className="py-1 bg-[#0a0a0a] border border-[#1a1a1a]">
//                   <DropdownMenuItem asChild>
//                     <Link href="/auth/login" className="flex items-center gap-2 text-white hover:text-[#055160]">
//                       <LogIn className="h-4 w-4" />
//                       Login
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem asChild>
//                     <Link href="/auth/register" className="flex items-center gap-2 text-white hover:text-[#055160]">
//                       <User className="h-4 w-4" />
//                       Register
//                     </Link>
//                   </DropdownMenuItem>
//                 </div>
//               </DropdownMenu>
//             )}
//           </div>

//           {/* Mobile Actions */}
//           <div className="flex lg:hidden items-center gap-3">
//             <Link href="/cart" className="flex items-center gap-1 text-white hover:text-[#055160] transition-colors relative">
//               <ShoppingCart className="h-5 w-5" />
//               {mounted && getTotalItems() > 0 ? (
//                 <span className="absolute -top-1 -right-1 bg-[#055160] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                   {getTotalItems()}
//                 </span>
//               ) : null}
//             </Link>

//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="text-white hover:text-[#055160] transition-colors p-2"
//               aria-label="Toggle menu"
//             >
//               {mobileMenuOpen ? (
//                 <X className="h-6 w-6" />
//               ) : (
//                 <Menu className="h-6 w-6" />
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {mobileMenuOpen && (
//           <div className="lg:hidden border-t border-[#1a1a1a] animate-in slide-in-from-top bg-[#0a0a0a]">
//             <nav className="flex flex-col py-4">
//               <Link
//                 href="/"
//                 className="px-4 py-3 text-white hover:bg-[#1a1a1a] hover:text-[#055160] transition-colors text-base"
//                 onClick={() => setMobileMenuOpen(false)}
//                 style={{ fontFamily: 'Albert Sans' }}
//               >
//                 HOME
//               </Link>
//               <Link
//                 href="/shop"
//                 className="px-4 py-3 text-white hover:bg-[#1a1a1a] hover:text-[#055160] transition-colors text-base"
//                 onClick={() => setMobileMenuOpen(false)}
//                 style={{ fontFamily: 'Albert Sans' }}
//               >
//                 CATERING
//               </Link>
//               <Link
//                 href="/contact"
//                 className="px-4 py-3 text-white hover:bg-[#1a1a1a] hover:text-[#055160] transition-colors text-base"
//                 onClick={() => setMobileMenuOpen(false)}
//                 style={{ fontFamily: 'Albert Sans' }}
//               >
//                 CONTACT
//               </Link>
//               <div className="px-4 py-3 border-t border-[#1a1a1a] mt-2">
//                 <Link href="/quote" onClick={() => setMobileMenuOpen(false)}>
//                   <Button className="w-full bg-[#055160] hover:bg-[#04414d] text-white" style={{ fontFamily: 'Albert Sans', fontWeight: 600 }}>
//                     ORDER NOW
//                   </Button>
//                 </Link>
//               </div>
              
//               <div className="border-t border-[#1a1a1a] mt-2 pt-4 space-y-1">
//                 {!mounted ? (
//                   // Show nothing during SSR to prevent hydration mismatch
//                   <div style={{ minHeight: '40px' }}></div>
//                 ) : isAuthenticated ? (
//                   <>
//                     <div className="px-4 py-2 border-b border-[#1a1a1a]">
//                       <p className="text-white text-sm font-medium">
//                         {user?.username || user?.email?.split('@')[0] || 'User'}
//                       </p>
//                       {user?.email && (
//                         <p className="text-gray-400 text-xs truncate">{user.email}</p>
//                       )}
//                     </div>
//                     <Link
//                       href="/account"
//                       className="flex items-center gap-2 px-4 py-3 text-white hover:bg-[#1a1a1a] hover:text-[#055160] transition-colors text-base"
//                       onClick={() => setMobileMenuOpen(false)}
//                     >
//                       <User className="h-4 w-4" />
//                       Account
//                     </Link>
//                     <button
//                       className="flex items-center gap-2 w-full px-4 py-3 text-white hover:bg-[#1a1a1a] hover:text-[#055160] transition-colors text-base text-left"
//                       onClick={() => {
//                         logout()
//                         setMobileMenuOpen(false)
//                       }}
//                     >
//                       <LogOut className="h-4 w-4" />
//                       Logout
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <Link
//                       href="/auth/login"
//                       className="flex items-center gap-2 px-4 py-3 text-white hover:bg-[#1a1a1a] hover:text-[#055160] transition-colors text-base"
//                       onClick={() => setMobileMenuOpen(false)}
//                     >
//                       <LogIn className="h-4 w-4" />
//                       Login
//                     </Link>
//                     <Link
//                       href="/auth/register"
//                       className="flex items-center gap-2 px-4 py-3 text-white hover:bg-[#1a1a1a] hover:text-[#055160] transition-colors text-base"
//                       onClick={() => setMobileMenuOpen(false)}
//                     >
//                       <User className="h-4 w-4" />
//                       Register
//                     </Link>
//                   </>
//                 )}
//               </div>
//             </nav>
//           </div>
//         )}
//       </div>
//     </header>
//   )
// }


"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/auth"
import { useCartStore } from "@/store/cart"
import { ShoppingCart, Menu, X, User, LogOut, LogIn } from "lucide-react"

export function Header() {
  const { isAuthenticated, user, logout, checkAuth } = useAuthStore()
  const { getTotalItems } = useCartStore()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [checkAuth])

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#1a1a1a] shadow-md">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* LOGO */}
          <Link href="/" className="text-white text-2xl sm:text-3xl font-bold">
            ZENN
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-white hover:text-[#055160]">HOME</Link>
            <Link href="/shop" className="text-white hover:text-[#055160]">CATERING</Link>
            <Link href="/contact" className="text-white hover:text-[#055160]">CONTACT</Link>
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden lg:flex items-center gap-5">
            <Link href="/shop">
              <Button className="bg-[#055160] hover:bg-[#04414d] text-white">
                ORDER NOW
              </Button>
            </Link>

            <Link href="/cart" className="relative text-white hover:text-[#055160]">
              <ShoppingCart className="h-5 w-5" />
              {mounted && getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#055160] text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* USER DROPDOWN */}
            {mounted && (
              <DropdownMenu
                trigger={
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1a] hover:bg-[#055160] text-white border border-[#2a2a2a]">
                    <User className="h-5 w-5" />
                  </button>
                }
                align="right"
              >
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] py-1">

                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-[#1a1a1a]">
                        <p className="text-white text-sm font-medium">
                          {user?.username || user?.email?.split("@")[0]}
                        </p>
                        {user?.email && (
                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>
                        )}
                      </div>

                      <DropdownMenuItem
                        className="text-white hover:bg-white hover:text-black focus:bg-white focus:text-black"
                        asChild
                      >
                        <Link href="/account" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Account
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={logout}
                        className="text-red-500 hover:bg-white hover:text-red-600 focus:bg-white focus:text-red-600"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut className="h-4 w-4" />
                          Logout
                        </div>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        className="text-white hover:bg-white hover:text-black focus:bg-white focus:text-black"
                        asChild
                      >
                        <Link href="/auth/login" className="flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Login
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-white hover:bg-white hover:text-black focus:bg-white focus:text-black"
                        asChild
                      >
                        <Link href="/auth/register" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Register
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                </div>
              </DropdownMenu>
            )}
          </div>

          {/* MOBILE ICONS */}
          <div className="flex lg:hidden items-center gap-3">
            <Link href="/cart" className="relative text-white">
              <ShoppingCart className="h-5 w-5" />
              {mounted && getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#055160] text-white text-xs h-4 w-4 rounded-full flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0a0a0a] border-t border-[#1a1a1a]">
            <nav className="flex flex-col py-4">

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-white hover:bg-white hover:text-black"
              >
                HOME
              </Link>

              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-white hover:bg-white hover:text-black"
              >
                CATERING
              </Link>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-white hover:bg-white hover:text-black"
              >
                CONTACT
              </Link>

              {/* MOBILE ORDER NOW */}
              <div className="px-4 py-4 border-t border-[#1a1a1a]">
                <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#055160] hover:bg-[#04414d] text-white font-semibold">
                    ORDER NOW
                  </Button>
                </Link>
              </div>

              {/* MOBILE AUTH */}
              <div className="border-t border-[#1a1a1a] pt-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-white hover:bg-white hover:text-black"
                    >
                      Account
                    </Link>

                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 text-red-500 hover:bg-white hover:text-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-white hover:bg-white hover:text-black"
                    >
                      Login
                    </Link>

                    <Link
                      href="/auth/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-white hover:bg-white hover:text-black"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>

            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
