"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuthStore } from "@/store/auth"
import { toast } from "sonner"

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const register = useAuthStore((state) => state.register)

  const [userType, setUserType] = useState<"customer" | "wholesale">("customer")
  const [wholesaleType, setWholesaleType] = useState<"premium" | "partial">("premium")

  // Check URL params for wholesale type
  useEffect(() => {
    const type = searchParams?.get("type")
    if (type === "wholesale") {
      setUserType("wholesale")
    }
  }, [searchParams])
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    companyName: "",
    addressLine1: "",
    addressLine2: "",
    suburb: "",
    postalCode: "",
    state: "",
    preferredContactMethod: "",
    businessType: "",
    estimatedOpeningDate: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate wholesale-specific required fields
    if (userType === "wholesale") {
      if (!formData.preferredContactMethod) {
        toast.error("Please select a preferred contact method")
        return
      }
      if (!formData.businessType) {
        toast.error("Please select New or Existing Business")
        return
      }
      if (!formData.estimatedOpeningDate) {
        toast.error("Please provide an estimated opening date")
        return
      }
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      toast.error("Password should be at least 8 characters long")
      return
    }

    if (!formData.agreeToTerms) {
      toast.error("Please agree to Terms & Conditions")
      return
    }

    setLoading(true)

    try {
      const [firstname, ...lastnameParts] = formData.fullName.split(" ")
      const lastname = lastnameParts.join(" ").trim() || firstname.trim() || ""

      const registrationData: any = {
        firstname: firstname.trim() || "",
        lastname: lastname || firstname.trim() || "",
        email: formData.email,
        username: formData.email,
        password: formData.password,
        telephone: formData.phoneNumber,
      }

      // Add wholesaler-specific fields
      if (userType === "wholesale") {
        registrationData.company_name = formData.companyName
        registrationData.address_line1 = formData.addressLine1
        registrationData.address_line2 = formData.addressLine2
        registrationData.suburb = formData.suburb
        registrationData.postal_code = formData.postalCode
        registrationData.state = formData.state
        registrationData.preferred_contact_method = formData.preferredContactMethod
        registrationData.business_type = formData.businessType
        registrationData.wholesale_type = wholesaleType === "premium" ? "Premium" : "Essential"
        // Set service_type based on wholesale_type: Premium = Full Service, Essential = Half Service
        registrationData.service_type = wholesaleType === "premium" ? "Full Service Wholesaler" : "Half Service"
        registrationData.estimated_opening_date = formData.estimatedOpeningDate || null
      } else {
        // Regular customer address
        registrationData.address_line1 = formData.addressLine1
        registrationData.address_line2 = formData.addressLine2
        registrationData.suburb = formData.suburb
        registrationData.postal_code = formData.postalCode
        registrationData.state = formData.state
      }

      await register(registrationData)
      toast.success(
        userType === "wholesale"
          ? "Registration successful! Your account is pending approval."
          : "Registration successful!"
      )
      router.push("/")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black items-start justify-center overflow-hidden">
        <Image
          src="/assets/sndurex/Group 164 (2).png"
          alt="St. Dreux Coffee Registration"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10" />
        <div className="absolute top-20 left-0 right-0 z-20 text-center px-8">
          <h1 className="text-white font-script text-7xl mb-2" style={{ fontFamily: 'cursive' }}>
            St. Dreux
          </h1>
          <p className="text-white tracking-[0.5em] text-sm font-light uppercase">COFFEE</p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center px-8 py-12 overflow-y-auto ${
        userType === "wholesale" ? "bg-[#0A1F44]" : "bg-white"
      }`}>
        <div className="w-full max-w-md">
          {/* User Type Toggle */}
          <div className="flex gap-0 mb-8 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setUserType("customer")}
              className={`flex-1 py-3 px-6 font-medium transition-colors rounded-t-lg ${
                userType === "customer"
                  ? "bg-white text-gray-900 border-b-2 border-gray-900"
                  : "bg-[#F5F5F0] text-gray-600 hover:bg-gray-50"
              }`}
            >
              Retail Customers
            </button>
            <button
              type="button"
              onClick={() => setUserType("wholesale")}
              className={`flex-1 py-3 px-6 font-medium transition-colors rounded-t-lg ${
                userType === "wholesale"
                  ? "bg-white text-gray-900 border-b-2 border-gray-900"
                  : "bg-[#F5F5F0] text-gray-600 hover:bg-gray-50"
              }`}
            >
              Wholesale
            </button>
          </div>

          {/* Wholesale Type Tabs - Only show when wholesale is selected */}
          {userType === "wholesale" && (
            <div className="mb-6">
              <label className={`block mb-2 font-medium ${
                userType === "wholesale" ? "text-white" : "text-gray-700"
              }`}>
                Premium or Essential Wholesaler
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWholesaleType("premium")}
                  className={`flex-1 py-2 px-4 font-medium transition-colors rounded-lg ${
                    wholesaleType === "premium"
                      ? "bg-[#2952E6] text-white"
                      : "bg-[#0F2C5C] text-white/70 hover:bg-[#1e3a6b]"
                  }`}
                >
                  Premium
                </button>
                <button
                  type="button"
                  onClick={() => setWholesaleType("partial")}
                  className={`flex-1 py-2 px-4 font-medium transition-colors rounded-lg ${
                    wholesaleType === "partial"
                      ? "bg-[#2952E6] text-white"
                      : "bg-[#0F2C5C] text-white/70 hover:bg-[#1e3a6b]"
                  }`}
                >
                  Essential
                </button>
              </div>
              <p className={`text-sm mt-2 ${
                userType === "wholesale" ? "text-white/70" : "text-gray-500"
              }`}>
                {wholesaleType === "premium" 
                  ? "Full Service Wholesaler" 
                  : "Half Service"}
              </p>
            </div>
          )}

          <div className="mb-8">
            <h2 className={`text-3xl font-bold mb-6 ${
              userType === "wholesale" ? "text-white" : "text-gray-900"
            }`}>
              Register as {userType === "wholesale" 
                ? (wholesaleType === "premium" ? "Full Service Wholesaler" : "Half Service")
                : "Retail Customer"}
            </h2>
          </div>


          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className={`w-full py-6 border-2 rounded-lg font-medium flex items-center justify-center gap-3 ${
                userType === "wholesale"
                  ? "border-white text-white hover:bg-white/10 bg-transparent"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
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
              className={`w-full py-6 font-medium rounded-lg flex items-center justify-center gap-3 ${
                userType === "wholesale"
                  ? "bg-white text-gray-900 hover:bg-white/90"
                  : "bg-black hover:bg-gray-900 text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Sign up with Apple
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {userType === "wholesale" ? (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="px-4 py-6 bg-[#0F2C5C] border-[#1e3a6b] text-white placeholder:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Input
                  type="text"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="px-4 py-6 bg-[#0F2C5C] border-[#1e3a6b] text-white placeholder:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ) : (
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-6 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="tel"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={`px-4 py-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  userType === "wholesale"
                    ? "bg-[#0F2C5C] border-[#1e3a6b] text-white placeholder:text-white"
                    : "bg-gray-50 border border-gray-200"
                }`}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`px-4 py-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  userType === "wholesale"
                    ? "bg-[#0F2C5C] border-[#1e3a6b] text-white placeholder:text-white"
                    : "bg-gray-50 border border-gray-200"
                }`}
                required
              />
            </div>

            <div>
              <Input
                type="text"
                placeholder={userType === "wholesale" ? "Address Line 1" : "Address"}
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className={`w-full px-4 py-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  userType === "wholesale"
                    ? "bg-[#0F2C5C] border-[#1e3a6b] text-white placeholder:text-white"
                    : "bg-gray-50 border border-gray-200"
                }`}
                required
              />
            </div>

            {userType === "wholesale" && (
              <div>
                <Input
                  type="text"
                  placeholder="Address Line 2"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full px-4 py-6 bg-[#0F2C5C] border-[#1e3a6b] text-white placeholder:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}


            {userType === "customer" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Suburb"
                    value={formData.suburb}
                    onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                    className="w-full px-4 py-6 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Postal Code"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-6 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-6 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}
            {userType === "wholesale" && (
              <div>
                <Input
                  type="text"
                  placeholder="Suburb"
                  value={formData.suburb}
                  onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                  className="w-full px-4 py-6 bg-[#0F2C5C] border-[#1e3a6b] text-white placeholder:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {userType === "wholesale" && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Postal Code"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="px-4 py-6 bg-[#0F2C5C] border-[#1e3a6b] text-white placeholder:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="px-4 py-6 bg-[#0F2C5C] border-[#1e3a6b] text-white placeholder:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Wholesale-specific additional fields */}
            {userType === "wholesale" && (
              <>
                {/* Preferred Contact Method */}
                <div>
                  <Select
                    value={formData.preferredContactMethod}
                    onValueChange={(value) => setFormData({ ...formData, preferredContactMethod: value })}
                  >
                    <SelectTrigger className="w-full px-4 py-6 bg-[#0F2C5C] border-[#1e3a6b] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Nominate preferred contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* New or Existing Business */}
                <div>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                  >
                    <SelectTrigger className="w-full px-4 py-6 bg-[#0F2C5C] border-[#1e3a6b] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="New or Existing Business" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Existing">Existing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estimated Opening Date */}
                <div>
                  <Input
                    type="date"
                    placeholder="Estimated Opening Date"
                    value={formData.estimatedOpeningDate}
                    onChange={(e) => setFormData({ ...formData, estimatedOpeningDate: e.target.value })}
                    className="w-full px-4 py-6 bg-[#0F2C5C] border-[#1e3a6b] text-white placeholder:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            )}

            {userType === "wholesale" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="px-4 py-6 bg-[#0F2C5C] border-[#1e3a6b] text-white placeholder:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Re - Enter Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="px-4 py-6 bg-[#0F2C5C] border-[#1e3a6b] text-white placeholder:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <p className="text-xs mt-1 text-white">
                  Password should at least be 8 characters long
                </p>
              </>
            ) : (
              <>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-6 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs mt-1 text-gray-500">
                    Password should at least be 8 characters long
                  </p>
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Re - Enter Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-6 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, agreeToTerms: checked as boolean })
                }
                className={userType === "wholesale" ? "border-gray-400" : ""}
              />
              <label htmlFor="terms" className={`text-sm ${
                userType === "wholesale" ? "text-white" : "text-gray-600"
              }`}>
                {userType === "wholesale" ? (
                  <>
                    I agree to all{" "}
                    <Link href="/terms" className="text-white hover:underline">
                      Terms
                    </Link>
                    ,{" "}
                    <Link href="/privacy" className="text-white hover:underline">
                      Privacy Policy
                    </Link>
                    {" "}and{" "}
                    <Link href="/fees" className="text-white hover:underline">
                      Fees
                    </Link>
                  </>
                ) : (
                  <>
                    I agree to all{" "}
                    <Link href="/terms" className="text-blue-500 hover:underline">
                      Terms & Conditions
                    </Link>
                    ,{" "}
                    <Link href="/privacy" className="text-blue-500 hover:underline">
                      Privacy Policy
                    </Link>
                  </>
                )}
              </label>
            </div>

            <Button
              type="submit"
              className="w-full py-6 bg-[#2952E6] hover:bg-[#1e3fb3] text-white font-semibold rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <p className={`text-center mt-6 ${
            userType === "wholesale" ? "text-white" : "text-gray-600"
          }`}>
            Already have an account?{" "}
            <Link href="/auth/login" className={`font-semibold hover:underline ${
              userType === "wholesale" ? "text-white" : "text-[#2952E6]"
            }`}>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  )
}

