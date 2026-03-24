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
  const { login, logout } = useAuthStore()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const auth = useAuthStore.getState()
    if (!auth.isAuthenticated) logout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData.username, formData.password)
      toast.success("Login successful")
      setTimeout(() => {
        window.location.href = redirect
      }, 300)
    } catch {
      toast.error("Invalid credentials")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ================= MOBILE VIEW ================= */}
      <div className="lg:hidden px-4 pt-6">
        <div className="relative w-full h-[180px] rounded-[16px] overflow-hidden">

          {/* BACKGROUND IMAGE */}
          <img
            src="/assets/images/c28.jpg"
            alt="Caterly background"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* LOGO */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/assets/images/cat.svg"
              alt="Caterly logo"
              className="w-[160px] h-auto"
            />
          </div>
        </div>
      </div>

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden lg:flex min-h-screen">
        <div className="w-1/2 relative">
          <Image
            src="/assets/images/c28.jpg"
            alt="Caterly background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/assets/images/cat.svg"
              alt="Caterly logo"
              width={240}
              height={202}
              priority
            />
          </div>
        </div>

        {/* FORM */}
        <div className="w-1/2 flex items-center justify-center">
          <FormSection
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            loading={loading}
            redirect={redirect}
            router={router}
          />
        </div>
      </div>

      {/* MOBILE FORM */}
      <div className="lg:hidden px-4 mt-10">
        <FormSection
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          loading={loading}
          redirect={redirect}
          router={router}
        />
      </div>
    </div>
  )
}

/* ================= FORM COMPONENT ================= */
function FormSection({
  formData,
  setFormData,
  handleSubmit,
  loading,
  redirect,
  router,
}: any) {
  return (
    <div className="w-full max-w-[420px]">
      <h1 className="text-[28px] font-semibold text-black mb-6">
        Login
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[16px] font-semibold text-black">
            Email
          </label>
          <Input
            placeholder="Enter Here"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="h-[48px] rounded-[10px] border border-[#F2CFCF] text-black"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[16px] font-semibold text-black">
            Password
          </label>
          <Input
            type="password"
            placeholder="Enter Here"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="h-[48px] rounded-[10px] border border-[#F2CFCF] text-black"
            required
          />
        </div>

        <div className="flex justify-end -mt-2">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-[#E03A3E] font-medium hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-[52px] w-full rounded-[12px] bg-[#E03A3E] text-white text-[16px] font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>


      <p className="mt-6 text-[14px] text-gray-500">
        Not a member yet?{" "}
        <Link href="/auth/register" className="font-semibold text-black">
          Register now
        </Link>
      </p>

      {redirect && (redirect.includes('checkout') || redirect.includes('cart')) && (
        <div className="mt-8 border-t border-[#F2CFCF] pt-6">
          <p className="text-[14px] text-gray-500 mb-4 text-center">Or continue without an account</p>
          <Button
            type="button"
            onClick={() => router.push('/checkout')}
            variant="outline"
            className="h-[52px] w-full rounded-[12px] border-[#E03A3E] text-[#E03A3E] hover:bg-[#FDECEC] text-[16px] font-semibold"
          >
            Checkout as Guest
          </Button>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginPageContent />
    </Suspense>
  )
}
