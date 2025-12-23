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
import { PinPaymentForm } from "@/components/PinPaymentForm"

function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const { isAuthenticated } = useAuthStore()
  const { clearCart } = useCartStore()
  const [order, setOrder] = useState<any>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/payment" + (orderId ? `?order_id=${orderId}` : ""))
      return
    }

    if (orderId) {
      fetchOrder()
    }
  }, [isAuthenticated, orderId])

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/store/orders/${orderId}`)
      setOrder(response.data.order)
    } catch (error) {
      console.error("Failed to fetch order:", error)
      toast.error("Failed to load order details")
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    clearCart()
    // Redirect to success page after a short delay
    setTimeout(() => {
      router.push(`/payment/success?order_id=${orderId}`)
    }, 2000)
  }

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error)
    // Error is already shown via toast in PinPaymentForm
  }

  if (!isAuthenticated) {
    return null
  }

  if (order?.order_status === 2) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-3xl font-bold mb-4">Order Already Paid</h2>
            <p className="text-gray-600 mb-6">
              This order has already been paid.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/account")}>
                View Orders
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        {orderId ? (
          <Link href={`/orders/${orderId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Order
          </Link>
        ) : (
          <Link href="/checkout" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Checkout
          </Link>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-8">Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {paymentSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
                  <p className="text-gray-600">Redirecting...</p>
                </div>
              ) : (
                <PinPaymentForm
                  orderId={parseInt(orderId || "0")}
                  amount={Number.parseFloat(order?.total || order?.order_total || "0")}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order ID</span>
                    <span className="font-medium">#{order.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${Number.parseFloat(order.subtotal || order.order_total || "0").toFixed(2)}</span>
                  </div>
                  {order.wholesale_discount && parseFloat(order.wholesale_discount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Wholesale Discount</span>
                      <span>-${Number.parseFloat(order.wholesale_discount).toFixed(2)}</span>
                    </div>
                  )}
                  {order.coupon_discount && parseFloat(order.coupon_discount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Coupon Discount {order.coupon_code && `(${order.coupon_code})`}
                      </span>
                      <span>-${Number.parseFloat(order.coupon_discount).toFixed(2)}</span>
                    </div>
                  )}
                  {order.after_discount && (
                    <div className="flex justify-between">
                      <span>After Discount</span>
                      <span>${Number.parseFloat(order.after_discount).toFixed(2)}</span>
                    </div>
                  )}
                  {order.gst && parseFloat(order.gst) > 0 && (
                    <div className="flex justify-between">
                      <span>GST (10%)</span>
                      <span>${Number.parseFloat(order.gst).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>${Number.parseFloat(order.delivery_fee || "0").toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${Number.parseFloat(order.total || order.order_total || "0").toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Loading order details...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  )
}
