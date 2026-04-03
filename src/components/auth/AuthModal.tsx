"use client"

import React, { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuthStore } from "@/store/auth"
import { useAuthModalStore } from "@/store/auth-modal"
import { toast } from "sonner"

const FORM_STORAGE_KEY = "caterly_register_form"
const defaultRegisterForm = {
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

export function AuthModal() {
  const router = useRouter()
  const pathname = usePathname()
  const { isOpen, view, closeModal, setView } = useAuthModalStore()
  const { login, register, isAuthenticated } = useAuthStore()

  // Login State
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [isLoginLoading, setIsLoginLoading] = useState(false)

  // Register State
  const [registerForm, setRegisterForm] = useState(() => {
    if (typeof window === "undefined") return defaultRegisterForm
    try {
      const saved = sessionStorage.getItem(FORM_STORAGE_KEY)
      if (saved) return { ...defaultRegisterForm, ...JSON.parse(saved) }
    } catch { }
    return defaultRegisterForm
  })
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)

  // Persist register form
  useEffect(() => {
    try {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(registerForm))
    } catch { }
  }, [registerForm])

  // Close modal if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      closeModal()
    }
  }, [isAuthenticated, isOpen, closeModal])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoginLoading(true)

    try {
      await login(loginForm.username, loginForm.password)
      toast.success("Login successful")
      closeModal()

      // Attempt manual refresh of the page or just clear checkout items if needed
      // Currently using window.location.reload() for a full application state refresh (if necessary depending on use case), but next router is better
      router.refresh()
    } catch {
      toast.error("Invalid credentials")
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleRegisterChange = (key: string, value: any) => {
    setRegisterForm((prev: typeof defaultRegisterForm) => ({ ...prev, [key]: value }))
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !registerForm.fullName ||
      !registerForm.phoneNumber ||
      !registerForm.email ||
      !registerForm.address ||
      !registerForm.suburb ||
      !registerForm.state ||
      !registerForm.postalCode
    ) {
      toast.error("Please fill all required fields")
      return
    }

    if (registerForm.password.length < 8) {
      toast.error("Password should be at least 8 characters long")
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (!registerForm.agree) {
      toast.error("Please agree to Terms & Conditions")
      return
    }

    setIsRegisterLoading(true)

    try {
      const [firstname, ...lastnameParts] = registerForm.fullName.split(" ")
      const lastname = lastnameParts.join(" ").trim() || firstname.trim() || ""

      const registrationData: any = {
        firstname: firstname.trim(),
        lastname: lastname || firstname.trim(),
        email: registerForm.email,
        username: registerForm.email,
        password: registerForm.password,
        telephone: registerForm.phoneNumber,
        address_line1: registerForm.address,
        suburb: registerForm.suburb,
        postal_code: registerForm.postalCode,
        state: registerForm.state,
      }

      await register(registrationData)

      // Save registration data to localStorage so checkout can pre-fill it
      try {
        const [fn, ...lnParts] = registerForm.fullName.trim().split(" ")
        localStorage.setItem("caterly_checkout_prefill", JSON.stringify({
          firstName: fn || "",
          lastName: lnParts.join(" ") || "",
          email: registerForm.email,
          phone: registerForm.phoneNumber,
          streetAddress: registerForm.address,
          suburb: registerForm.suburb,
          state: registerForm.state,
          postcode: registerForm.postalCode,
        }))
      } catch { }

      toast.success("Thank you for registering with us.")
      closeModal()
      router.refresh()
    } catch (error: any) {
      const message = error.message || "Registration failed"
      if (message.toLowerCase().includes("email") && (message.toLowerCase().includes("exists") || message.toLowerCase().includes("already"))) {
        toast.error("the email already existed")
      } else {
        toast.error(message)
      }
    } finally {
      setIsRegisterLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-[480px] p-0 border-none bg-white rounded-2xl overflow-hidden shadow-2xl">
        <DialogTitle className="sr-only">{view === "login" ? "Login" : "Register"}</DialogTitle>
        <DialogDescription className="sr-only">Authenticate to Caterly</DialogDescription>

        {/* Logo Only */}
        <div className="flex items-center justify-center pt-8 pb-2">
          <Image
            src="/assets/images/cat.svg"
            alt="Caterly logo"
            width={140}
            height={80}
            priority
          />
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">

          {view === "login" ? (
            /* ================= LOGIN VIEW ================= */
            <div className="w-full">
              <h1 className="text-[24px] font-semibold text-black mb-6 text-center">
                Welcome Back
              </h1>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-black">
                    Email
                  </label>
                  <Input
                    placeholder="Enter Here"
                    value={loginForm.username}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, username: e.target.value })
                    }
                    className="h-[44px] rounded-[10px] border border-[#F2CFCF] text-black focus:ring-1 focus:ring-[#E03A3E] focus:border-[#E03A3E]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-black">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter Here"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    className="h-[44px] rounded-[10px] border border-[#F2CFCF] text-black focus:ring-1 focus:ring-[#E03A3E] focus:border-[#E03A3E]"
                    required
                  />
                </div>

                <div className="flex justify-end -mt-2">
                  <Link
                    href="/auth/forgot-password"
                    onClick={() => closeModal()}
                    className="text-[13px] text-[#E03A3E] font-medium hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoginLoading}
                  className="h-[48px] w-full rounded-[10px] bg-[#E03A3E] hover:bg-[#cc3236] text-white text-[16px] font-semibold transition"
                >
                  {isLoginLoading ? "Logging in..." : "Login"}
                </Button>
              </form>

              <div className="mt-6 flex flex-col gap-4 text-center">
                <p className="text-[14px] text-gray-500">
                  Not a member yet?{" "}
                  <button onClick={() => setView('register')} className="font-semibold text-black hover:text-[#E03A3E] transition">
                    Register now
                  </button>
                </p>

                {pathname.includes('checkout') && (
                  <div className="pt-4 border-t border-[#F2CFCF]">
                    <p className="text-[13px] text-gray-500 mb-3 text-center">Or continue without an account</p>
                    <Button
                      type="button"
                      onClick={() => closeModal()}
                      variant="outline"
                      className="h-[44px] w-full rounded-[10px] bg-transparent border-[#E03A3E] text-[#E03A3E] hover:bg-[#FDECEC] hover:text-[#E03A3E] text-[14px] font-semibold"
                    >
                      Checkout as Guest
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= REGISTER VIEW ================= */
            <div className="w-full">
              <h1 className="text-[24px] font-semibold text-black mb-6 text-center">
                Create an Account
              </h1>

              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                {/* Full Name */}
                <div className="space-y-1">
                  <Input
                    placeholder="Full Name"
                    value={registerForm.fullName}
                    onChange={(e) => handleRegisterChange("fullName", e.target.value)}
                    className="h-[44px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                    required
                  />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Phone Number"
                    value={registerForm.phoneNumber}
                    onChange={(e) => handleRegisterChange("phoneNumber", e.target.value)}
                    className="h-[44px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={registerForm.email}
                    onChange={(e) => handleRegisterChange("email", e.target.value)}
                    className="h-[44px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                    required
                  />
                </div>

                {/* Address */}
                <Input
                  placeholder="Address"
                  value={registerForm.address}
                  onChange={(e) => handleRegisterChange("address", e.target.value)}
                  className="h-[44px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                  required
                />

                {/* Suburb & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Suburb"
                    value={registerForm.suburb}
                    onChange={(e) => handleRegisterChange("suburb", e.target.value)}
                    className="h-[44px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                    required
                  />
                  <Input
                    placeholder="State"
                    value={registerForm.state}
                    onChange={(e) => handleRegisterChange("state", e.target.value)}
                    className="h-[44px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                    required
                  />
                </div>

                {/* Postal Code */}
                <Input
                  placeholder="Postal Code"
                  value={registerForm.postalCode}
                  onChange={(e) => handleRegisterChange("postalCode", e.target.value)}
                  className="h-[44px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                  required
                />

                {/* Password */}
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={registerForm.password}
                    onChange={(e) => handleRegisterChange("password", e.target.value)}
                    className="h-[44px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
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
                  value={registerForm.confirmPassword}
                  onChange={(e) => handleRegisterChange("confirmPassword", e.target.value)}
                  className="h-[44px] rounded-[10px] border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#E03A3E] focus:ring-1 focus:ring-[#E03A3E]"
                  required
                />

                {/* Terms */}
                <div className="flex items-center gap-2 mt-4">
                  <Checkbox
                    id="terms-agree"
                    checked={registerForm.agree}
                    onCheckedChange={(checked) => handleRegisterChange("agree", checked)}
                  />
                  <label htmlFor="terms-agree" className="text-[13px] text-gray-700 cursor-pointer">
                    I agree to all{" "}
                    <Link href="/terms" onClick={() => closeModal()} className="text-[#E03A3E] font-medium hover:underline">
                      Terms & Conditions
                    </Link>
                    ,{" "}
                    <Link href="/privacy" onClick={() => closeModal()} className="text-[#E03A3E] font-medium hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isRegisterLoading}
                  className="mt-6 w-full h-[48px] rounded-[10px] bg-[#E03A3E] hover:bg-[#cc3236] text-white text-[16px] font-semibold transition"
                >
                  {isRegisterLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>

              {/* Footer */}
              <p className="mt-6 text-[14px] text-center text-gray-500">
                Already have an account?{" "}
                <button onClick={() => setView('login')} className="text-[#E03A3E] font-semibold hover:underline transition">
                  Login
                </button>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
