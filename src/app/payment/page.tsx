"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth"
import { useCartStore } from "@/store/cart"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { CheckCircle2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { FatZebraPaymentForm } from "@/components/FatZebraPaymentForm"

function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const { isAuthenticated, checkAuth } = useAuthStore()
  const { clearCart } = useCartStore()

  const [order, setOrder] = useState<any>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      // First, try to restore auth from localStorage
      try {
        await checkAuth()
      } catch (error) {
        console.error("Auth check error:", error)
      }

      // Now check if authenticated (after checkAuth has run)
      const currentAuthState = useAuthStore.getState()
      if (!currentAuthState.isAuthenticated) {
        router.push("/auth/login?redirect=/payment" + (orderId ? `?order_id=${orderId}` : ""))
        return
      }

      if (orderId) fetchOrder()
    }

    verifyAuth()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoadingOrder(true)
      const response = await api.get(`/store/orders/${orderId}`)
      setOrder(response.data.order)
    } catch (error) {
      console.error("Failed to fetch order:", error)
      toast.error("Failed to load order details")
    } finally {
      setLoadingOrder(false)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    clearCart()
    setTimeout(() => {
      router.push(`/payment/success?order_id=${orderId}`)
    }, 1500)
  }

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error)
  }

  if (!isAuthenticated) return null

  // Use 'total' from backend as it appears to be the correct value (e.g. 46.00), 
  // whereas 'calculated_total' and 'subtotal' are artificially inflated (e.g. 118, 108).
  const finalTotal = Number(order?.total || order?.calculated_total || 0)

  // Use delivery fee from backend
  const deliveryFee = Number(order?.delivery_fee || 0)

  // Derive logical subtotal to ensure the UI is consistent (Total - Delivery = Subtotal)
  // We ignore order.subtotal (108) because it is incorrect.
  const subtotal = Math.max(0, finalTotal - deliveryFee)

  // Estimate GST from the corrected subtotal for display purposes (10%)
  // We cannot use order.gst (11.69) because it is based on the inflated subtotal (108).
  const gst = subtotal * 0.1

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">

        {/* Back */}
        <div className="mb-6">
          <Link href={`/orders/${orderId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-black">
            <ArrowLeft className="h-4 w-4" />
            Back to Order
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-black">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Payment Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white border border-[#F2CACA] shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-[#E03A3E]">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">

                {loadingOrder ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#E03A3E]" />
                    Loading payment gateway...
                  </div>
                ) : paymentSuccess ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-black">Payment Successful!</h3>
                    <p className="text-gray-600">Redirecting...</p>
                  </div>
                ) : (
                  <div className="payment-form-wrapper text-black">
                    <FatZebraPaymentForm
                      orderId={parseInt(orderId || "0")}
                      amount={finalTotal}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24 bg-white border border-[#F2CACA] rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#E03A3E]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-black">

                {loadingOrder ? (
                  <div className="text-center py-10 text-gray-500">
                    Loading order summary...
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {gst > 0 && (
                      <div className="flex justify-between">
                        <span>GST (10%)</span>
                        <span>${gst.toFixed(2)}</span>
                      </div>
                    )}

                    {deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}

              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Force payment input labels to BLACK */}
      <style jsx global>{`
        .payment-form-wrapper label,
        .payment-form-wrapper span,
        .payment-form-wrapper p,
        .payment-form-wrapper h1,
        .payment-form-wrapper h2,
        .payment-form-wrapper h3 {
          color: black !important;
        }
        .payment-form-wrapper input {
          color: black !important;
        }
      `}</style>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#E03A3E]" />
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  )
}
