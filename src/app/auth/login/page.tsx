"use client"

import React, { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/store/auth"
import { toast } from "sonner"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"
  const { login, logout, isAuthenticated, token } = useAuthStore()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated (but wait a moment to check)
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Wait a bit for auth state to hydrate from localStorage
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const authState = useAuthStore.getState()
      if (authState.isAuthenticated && authState.token) {
        // Already logged in, redirect to intended destination or home
        const redirectPath = redirect && redirect !== '/auth/login' && redirect !== '/login' ? redirect : '/'
        router.push(redirectPath)
        return
      }
      
      // Not authenticated, clear any stale tokens
      logout()
    }
    
    checkAuthAndRedirect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData.username, formData.password)
      
      // Verify login was successful by checking auth state
      const authState = useAuthStore.getState()
      if (!authState.isAuthenticated || !authState.token) {
        throw new Error("Login failed - authentication state not set")
      }
      
      // Wait for Zustand persist to save to localStorage and cookie to be set
      // Give it enough time to ensure everything is saved
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Verify token is actually saved
      const storedAuth = localStorage.getItem('caterly-auth')
      const cookieExists = document.cookie.includes('caterly-auth=')
      
      if (!storedAuth && !cookieExists) {
        console.warn("Token not properly saved, waiting longer...")
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      toast.success("Login successful!")
      
      // Set a flag to prevent immediate auth checks after redirect
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('just-logged-in', 'true')
      }
      
      // Use window.location for more reliable redirect (forces full page reload)
      // This ensures all state is properly loaded and middleware can read the cookie
      const redirectPath = redirect && redirect !== '/auth/login' && redirect !== '/login' ? redirect : '/'
      
      // Small delay to let toast show, then redirect
      setTimeout(() => {
        window.location.href = redirectPath
      }, 300)
    } catch (error: any) {
      console.error("Login error:", error)
      const errorMessage = error?.message || error.response?.data?.message || "Login failed. Please check your credentials."
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1a1a1a] items-center justify-center overflow-hidden">
        <Image
          src="/assets/sndurex/Frame 1000007200.png"
          alt="St. Dreux Coffee"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent z-10" />
        <div className="relative z-20 text-center px-8">
          <h1 className="text-white font-script text-7xl mb-2" style={{ fontFamily: 'cursive' }}>
            St. Dreux
          </h1>
          <p className="text-white tracking-[0.5em] text-sm font-light uppercase">COFFEE</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-[#F5F5F0]">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                type="text"
                placeholder="Email Address"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-6 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-6 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
              <div className="mt-2 text-right">
                <Link href="/auth/forgot-password" className="text-sm text-[#2952E6] hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-6 bg-[#2952E6] hover:bg-[#1e3fb3] text-white font-semibold rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with google
            </Button>

            <Button
              type="button"
              className="w-full py-6 bg-black hover:bg-gray-900 text-white font-medium rounded-lg flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Sign up with Apple
            </Button>
          </div>

          <p className="text-center text-gray-600 mt-8">
            Not a member yet?{" "}
            <Link href="/auth/register" className="text-[#2952E6] font-semibold hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}


