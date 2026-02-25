"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuthStore } from "@/store/auth"
import { toast } from "sonner"

function RegisterPageContent() {
  const router = useRouter()
  const register = useAuthStore((state) => state.register)

  const [form, setForm] = useState({
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
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value })
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

      toast.success("Registration successful!")
      router.push("/")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed")
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
            <Input
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="h-[48px] rounded-[10px] border border-[#E5E7EB]"
              required
            />

            {/* Phone & Email */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className="h-[48px] rounded-[10px] border border-[#E5E7EB]"
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="h-[48px] rounded-[10px] border border-[#E5E7EB]"
                required
              />
            </div>

            {/* Address */}
            <Input
              placeholder="Address"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="h-[48px] rounded-[10px] border border-[#E5E7EB]"
              required
            />

            {/* Suburb & State */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Suburb"
                value={form.suburb}
                onChange={(e) => handleChange("suburb", e.target.value)}
                className="h-[48px] rounded-[10px] border border-[#E5E7EB]"
                required
              />
              <Input
                placeholder="State"
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="h-[48px] rounded-[10px] border border-[#E5E7EB]"
                required
              />
            </div>

            {/* Postal Code */}
            <Input
              placeholder="Postal Code"
              value={form.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              className="h-[48px] rounded-[10px] border border-[#E5E7EB]"
              required
            />

            {/* Password */}
            <Input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="h-[48px] rounded-[10px] border border-[#E5E7EB]"
              required
            />
            <p className="text-[12px] text-gray-500">
              Password should at least be 8 characters long
            </p>

            {/* Confirm Password */}
            <Input
              type="password"
              placeholder="Re – Enter Password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="h-[48px] rounded-[10px] border border-[#E5E7EB]"
              required
            />

            {/* Terms */}
            <div className="flex items-center gap-2 mt-4">
              <Checkbox
                checked={form.agree}
                onCheckedChange={(checked) =>
                  handleChange("agree", checked)
                }
              />
              <p className="text-[13px] text-gray-500">
                I agree to all{" "}
                <Link href="/terms" className="text-blue-500 font-medium">
                  Terms & Conditions
                </Link>
                ,{" "}
                <Link href="/privacy" className="text-blue-500 font-medium">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-6 w-full h-[52px] rounded-[12px] bg-[#e03a3e] hover:bg-[#e03a39] text-white text-[16px] font-semibold"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-[14px] text-center text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 font-semibold">
              Just login
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
