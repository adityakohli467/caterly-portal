"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth"
import { useCartStore } from "@/store/cart"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { CheckCircle2, ArrowLeft, Loader2, Lock, AlertCircle } from "lucide-react"
import Link from "next/link"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

// ─── Stripe Checkout Form ─────────────────────────────────────────────

function StripeCheckoutForm({ orderId, onSuccess }: { orderId: number; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?order_id=${orderId}`,
        },
        redirect: "if_required",
      })

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please try again.")
        setProcessing(false)
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Verify with backend
        try {
          await api.post("/store/payment/verify", {
            payment_intent_id: paymentIntent.id,
            order_id: orderId,
          })
        } catch {
          // Webhook will handle it even if verify call fails
        }
        onSuccess()
      } else {
        setErrorMessage("Payment requires additional action. Please try again.")
        setProcessing(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred")
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white py-4 rounded-lg text-lg font-semibold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
      >
        {processing ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center gap-2 justify-center">
            <Lock className="h-4 w-4" />
            Pay Now
          </span>
        )}
      </Button>

      <p className="text-xs text-center text-gray-400">
        Payments are securely processed by Stripe. Your card details never touch our servers.
      </p>
    </form>
  )
}

// ─── Main Payment Page Content ────────────────────────────────────────

function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderIdParam = searchParams.get("order_id")
  const successParam = searchParams.get("success")
  const orderId = orderIdParam ? parseInt(orderIdParam) : null

  const { isAuthenticated, checkAuth } = useAuthStore()
  const { clearCart } = useCartStore()

  const [order, setOrder] = useState<any>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [creatingIntent, setCreatingIntent] = useState(false)
  const [intentError, setIntentError] = useState<string | null>(null)

  useEffect(() => {
    // If redirected back with success param from Stripe redirect
    if (successParam === "true" && orderId) {
      setPaymentSuccess(true)
      clearCart()
      const piId = searchParams.get("payment_intent")
      if (piId) {
        api.post("/store/payment/verify", { payment_intent_id: piId, order_id: orderId }).catch(() => {})
      }
      setLoadingOrder(false)
      return
    }

    const verifyAuth = async () => {
      try {
        await checkAuth()
      } catch {}

      const currentAuthState = useAuthStore.getState()

      if (!currentAuthState.isAuthenticated && !orderIdParam) {
        router.push("/auth/login?redirect=/payment")
        return
      }

      if (orderId) {
        fetchOrder(orderId, currentAuthState.isAuthenticated)
      } else {
        setLoadingOrder(false)
        if (currentAuthState.isAuthenticated) {
          toast.error("Invalid or missing order ID")
        }
      }
    }

    verifyAuth()
  }, [orderIdParam])

  const fetchOrder = async (id: number, authenticated: boolean) => {
    try {
      setLoadingOrder(true)
      const authToken = searchParams.get("auth")
      const endpoint = authenticated
        ? `/store/orders/${id}`
        : `/store/orders/guest/${id}${authToken ? `?auth=${authToken}` : ''}`
      const response = await api.get(endpoint)
      const fetchedOrder = response.data.order
      setOrder(fetchedOrder)

      // If order is not yet paid, create a payment intent
      if (fetchedOrder.payment_status !== 'paid' && fetchedOrder.order_status !== 2) {
        await createPaymentIntent(id, fetchedOrder)
      }
    } catch (error: any) {
      console.error("Failed to fetch order:", error)
      toast.error("Failed to load order details")
    } finally {
      setLoadingOrder(false)
    }
  }

  const createPaymentIntent = async (id: number, orderData: any) => {
    setCreatingIntent(true)
    setIntentError(null)
    try {
      const email = orderData.customer_order_email || orderData.email || ""
      const res = await api.post("/store/payment/create-intent", {
        order_id: id,
        email,
      })
      if (res.data.success && res.data.client_secret) {
        setClientSecret(res.data.client_secret)
      } else {
        setIntentError(res.data.message || "Failed to initialize payment")
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to initialize payment gateway"
      setIntentError(typeof msg === 'string' ? msg : 'Order is already paid')
      if (msg === 'Order is already paid' || (typeof msg === 'object' && msg?.message === 'Order already paid')) {
        setOrder((prev: any) => prev ? { ...prev, payment_status: 'paid' } : prev)
      }
    } finally {
      setCreatingIntent(false)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    clearCart()
    toast.success("Payment successful!")
    setTimeout(() => {
      router.push(`/payment/success?order_id=${orderId}`)
    }, 2000)
  }

  // ─── Price breakdown ────────────────────────────────────────────────
  // Always use fresh data from the API order response to avoid stale totals
  const parsePrice = (val: any) => {
    if (typeof val === 'number') return val
    if (!val) return 0
    return parseFloat(String(val).replace(/[^\d.-]/g, '')) || 0
  }

  const deliveryFee = parsePrice(order?.delivery_fee)
  const couponDiscount = parsePrice(order?.coupon_discount || 0)
  const afterDiscount = parsePrice(order?.after_discount || order?.subtotal || 0)
  const preDiscountSubtotal = order?.after_wholesale_discount ? parsePrice(order.after_wholesale_discount) : afterDiscount + couponDiscount
  const gst = preDiscountSubtotal / 11
  const finalTotal = parsePrice(order?.order_total) || (afterDiscount + deliveryFee)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/account" className="inline-flex items-center gap-2 text-gray-600 hover:text-black">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
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
                {loadingOrder || creatingIntent ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#E03A3E]" />
                    {creatingIntent ? "Initializing secure payment..." : "Loading order..."}
                  </div>
                ) : !orderId ? (
                  <div className="flex flex-col items-center justify-center py-12 text-red-500">
                    <p className="text-lg font-bold">Invalid Order ID</p>
                    <p className="text-sm">Please return to your orders and try again.</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/account')}>
                      Go to Orders
                    </Button>
                  </div>
                ) : paymentSuccess ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-black">Payment Successful!</h3>
                    <p className="text-gray-600 mt-2">Your order has been paid. Redirecting...</p>
                  </div>
                ) : order?.payment_status === 'paid' || order?.order_status === 2 ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-black">This order is already paid.</h3>
                    <Button
                      className="mt-4 bg-[#E03A3E] hover:bg-[#cc3236] text-white"
                      onClick={() => router.push(`/orders/${orderId}`)}
                    >
                      View Order Details
                    </Button>
                  </div>
                ) : intentError ? (
                  <div className="text-center py-10">
                    <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
                    <p className="text-red-600 font-medium">{intentError}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => orderId && order && createPaymentIntent(orderId, order)}
                    >
                      Retry
                    </Button>
                  </div>
                ) : clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "stripe",
                        variables: {
                          colorPrimary: "#E03A3E",
                          borderRadius: "8px",
                        },
                      },
                    }}
                  >
                    <StripeCheckoutForm orderId={orderId} onSuccess={handlePaymentSuccess} />
                  </Elements>
                ) : null}
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
                  <div className="text-center py-10 text-gray-500">Loading order summary...</div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${preDiscountSubtotal.toFixed(2)}</span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon{order?.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                        <span>- ${couponDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {gst > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>GST Included</span>
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