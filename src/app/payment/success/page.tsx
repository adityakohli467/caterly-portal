"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useCartStore } from "@/store/cart"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCartStore()
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderType, setOrderType] = useState<string | null>(null)
  const transactionId = searchParams.get("transaction_id")
  const paymentIntentId = searchParams.get("payment_intent_id")
  const orderIdParam = searchParams.get("order_id")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrderType(localStorage.getItem("caterly_last_order_type"))
    }
  }, [])

  useEffect(() => {
    if (paymentIntentId && orderIdParam) {
      setOrderId(orderIdParam)
      verifyPayment()
    } else {
      setVerifying(false)
      toast.error("Missing payment information")
    }
  }, [paymentIntentId, orderIdParam])

  useEffect(() => {
    // Clear cart on successful payment
    if (verified) {
      clearCart()
    }
  }, [verified, clearCart])

  const verifyPayment = async () => {
    if (!paymentIntentId || !orderIdParam) return

    try {
      // Verify payment with backend
      const response = await api.post("/store/payment/verify", {
        payment_intent_id: paymentIntentId,
        order_id: parseInt(orderIdParam),
      })

      if (response.data.success) {
        setVerified(true)
        toast.success("Payment successful!")
      } else {
        toast.error("Payment verification failed")
      }
    } catch (error: any) {
      console.error("Payment verification error:", error)
      toast.error(error.response?.data?.message || "Failed to verify payment")
    } finally {
      setVerifying(false)
    }
  }

  if (verifying) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-16 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-[#2952E6] animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!verified) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-16 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">
              We couldn't verify your payment. Please contact support if you have been charged.
            </p>
            {paymentIntentId && (
              <p className="text-sm text-gray-500 mb-6">
                Payment Intent ID: {paymentIntentId.substring(0, 20)}...
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/account")}>
                View Orders
              </Button>
              <Button variant="outline" onClick={() => router.push("/contact")}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-16 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your order #{orderId} has been paid successfully.
            {orderType === "subscription" && " You can now manage your food subscription in your account settings."}
          </p>
          {paymentIntentId && (
            <p className="text-sm text-gray-500 mb-6">
              Payment Intent ID: {paymentIntentId.substring(0, 20)}...
            </p>
          )}
          <p className="text-sm text-gray-500 mb-8">
            You will receive a confirmation email shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push(orderType === "subscription" ? "/account?tab=subscriptions" : "/account")}
              className="bg-[#2952E6] hover:bg-[#1e3fb3]"
            >
              {orderType === "subscription" ? "Manage Subscriptions" : "View Orders"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/shop")}>
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-12 w-12 mx-auto text-[#2952E6] animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}

