"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/store/auth"
import { toast } from "sonner"
import { Mail, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const forgotPassword = useAuthStore((state) => state.forgotPassword)

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await forgotPassword(email)
      setEmailSent(true)
      toast.success("Password reset link sent to your email!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ===== MOBILE banner ===== */}
      <div className="lg:hidden px-4 pt-6">
        <div className="relative w-full h-[180px] rounded-[16px] overflow-hidden">
          <img
            src="/assets/images/log.png"
            alt="Caterly background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/assets/images/cat.svg"
              alt="Caterly logo"
              className="w-[160px] h-auto"
            />
          </div>
        </div>
      </div>

      {/* ===== DESKTOP split layout ===== */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left — brand image */}
        <div className="w-1/2 relative">
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

        {/* Right — form */}
        <div className="w-1/2 flex items-center justify-center">
          <FormSection
            email={email}
            setEmail={setEmail}
            handleSubmit={handleSubmit}
            loading={loading}
            emailSent={emailSent}
            router={router}
          />
        </div>
      </div>

      {/* ===== MOBILE form ===== */}
      <div className="lg:hidden px-4 mt-10">
        <FormSection
          email={email}
          setEmail={setEmail}
          handleSubmit={handleSubmit}
          loading={loading}
          emailSent={emailSent}
          router={router}
        />
      </div>
    </div>
  )
}

/* ===== Form component ===== */
function FormSection({ email, setEmail, handleSubmit, loading, emailSent, router }: any) {
  return (
    <div className="w-full max-w-[420px]">
      <h1 className="text-[28px] font-semibold text-black mb-2">
        Forgot Password
      </h1>
      <p className="text-[14px] text-gray-500 mb-6">
        {emailSent
          ? "Check your inbox for the reset link."
          : "Enter your email address and we'll send you a password reset link."}
      </p>

      {emailSent ? (
        /* ── Success state ── */
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-3 bg-green-50 border border-green-200 rounded-[12px] px-6 py-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
            <p className="text-green-800 text-sm leading-relaxed">
              A password reset link has been sent to{" "}
              <span className="font-semibold">{email}</span>.<br />
              Please check your email and follow the instructions.
            </p>
          </div>

          <Button
            onClick={() => router.push("/auth/login")}
            className="h-[52px] w-full rounded-[12px] bg-[#E03A3E] text-white text-[16px] font-semibold hover:bg-[#cc3236]"
          >
            Back to Login
          </Button>
        </div>
      ) : (
        /* ── Email form ── */
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[16px] font-semibold text-black">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[48px] rounded-[10px] border border-[#F2CFCF] text-black pl-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-[52px] w-full rounded-[12px] bg-[#E03A3E] text-white text-[16px] font-semibold hover:bg-[#cc3236]"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-[14px] text-gray-500">
        Remember your password?{" "}
        <Link href="/auth/login" className="font-semibold text-black hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}
