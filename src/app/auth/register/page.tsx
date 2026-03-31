"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuthStore } from "@/store/auth"
import { toast } from "sonner"

const FORM_STORAGE_KEY = "caterly_register_form"

const defaultForm = {
  fullName: "",
  phoneNumber: "",
  email: "",
  address: "",
  suburb: "",
  state: "",
  postalCode: "",
  password: "",
  confirmPassword: "",
  agree: false,
}

function RegisterPageContent() {
  const router = useRouter()
  const register = useAuthStore((state) => state.register)

  // Initialize form directly from sessionStorage (lazy initializer avoids race conditions)
  const [form, setForm] = useState(() => {
    if (typeof window === "undefined") return defaultForm
    try {
      const saved = sessionStorage.getItem(FORM_STORAGE_KEY)
      if (saved) return { ...defaultForm, ...JSON.parse(saved) }
    } catch { }
    return defaultForm
  })
  const [loading, setLoading] = useState(false)

  // Persist form data to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form))
    } catch { }
  }, [form])

  const handleChange = (key: string, value: any) => {
    setForm((prev: typeof defaultForm) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !form.fullName ||
      !form.phoneNumber ||
      !form.email ||
      !form.address ||
      !form.suburb ||
      !form.state ||
      !form.postalCode
    ) {
      toast.error("Please fill all required fields")
      return
    }

    if (form.password.length < 8) {
      toast.error("Password should be at least 8 characters long")
      return
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (!form.agree) {
      toast.error("Please agree to Terms & Conditions")
      return
    }

    setLoading(true)

    try {
      const [firstname, ...lastnameParts] = form.fullName.split(" ")
      const lastname = lastnameParts.join(" ").trim() || firstname.trim() || ""

      const registrationData: any = {
        firstname: firstname.trim(),
        lastname: lastname || firstname.trim(),
        email: form.email,
        username: form.email,
        password: form.password,
        telephone: form.phoneNumber,
        address_line1: form.address,
        suburb: form.suburb,
        postal_code: form.postalCode,
        state: form.state,
      }

      await register(registrationData)

      // Save registration data to localStorage so checkout can pre-fill it
      try {
        const [fn, ...lnParts] = form.fullName.trim().split(" ")
        localStorage.setItem("caterly_checkout_prefill", JSON.stringify({
          firstName: fn || "",
          lastName: lnParts.join(" ") || "",
          email: form.email,
          phone: form.phoneNumber,
          streetAddress: form.address,
          suburb: form.suburb,
          state: form.state,
          postcode: form.postalCode,
        }))
      } catch { }

      toast.success("Thank you for registering with us.")
      router.push("/")
    } catch (error: any) {
      const message = error.message || "Registration failed"
      if (message.toLowerCase().includes("email") && (message.toLowerCase().includes("exists") || message.toLowerCase().includes("already"))) {
        toast.error("the email already existed")
      } else {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans">

      {/* ================= MOBILE TOP IMAGE ================= */}
      <div className="lg:hidden px-4 pt-6">
        <div className="relative h-[180px] rounded-[16px] overflow-hidden">
          <img
            src="/assets/images/log.png"
            className="absolute inset-0 w-full h-full object-cover"
            alt="Caterly banner"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/assets/images/cat.svg"
              alt="Caterly logo"
              className="w-[160px]"
            />
          </div>
        </div>
      </div>

      {/* ================= DESKTOP LEFT ================= */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/assets/images/log.png"
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

      {/* ================= FORM ================= */}
      <div className="flex-1 flex justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-[420px]">

          <h1 className="text-[28px] font-semibold text-black mb-6">
            Register
          </h1>

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="space-y-1">
              <Input
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="h-[48px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                required
              />
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Input
                  placeholder="Phone Number"
                  value={form.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  className="h-[48px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                  required
                />
              </div>
              <div className="space-y-1">
                <Input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="h-[48px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <Input
              placeholder="Address"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="h-[48px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
              required
            />

            {/* Suburb & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Input
                  placeholder="Suburb"
                  value={form.suburb}
                  onChange={(e) => handleChange("suburb", e.target.value)}
                  className="h-[48px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                  required
                />
              </div>
              <div className="space-y-1">
                <Input
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className="h-[48px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                  required
                />
              </div>
            </div>

            {/* Postal Code */}
            <Input
              placeholder="Postal Code"
              value={form.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              className="h-[48px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
              required
            />

            {/* Password */}
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="h-[48px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                required
              />
              <p className="text-[12px] text-gray-500 mt-1">
                Password should at least be 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <Input
              type="password"
              placeholder="Re-enter Password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="h-[48px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
              required
            />

            {/* Terms */}
            <div className="flex items-start gap-3 mt-4">
              <div className="pt-0.5">
                <Checkbox
                  checked={form.agree}
                  onCheckedChange={(checked) =>
                    handleChange("agree", checked)
                  }
                />
              </div>
              <p className="text-[13px] text-gray-700 leading-tight">
                I agree to all{" "}
                <Link href="/terms" className="text-[#E03A3E] font-medium hover:underline">
                  Terms & Conditions
                </Link>
                ,{" "}
                <Link href="/privacy" className="text-[#E03A3E] font-medium hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-6 w-full h-[52px] rounded-[12px] bg-[#E03A3E] hover:bg-[#cc3236] text-white text-[16px] font-semibold transition"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-[14px] text-center text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#E03A3E] font-semibold hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <RegisterPageContent />
    </Suspense>
  )
}
