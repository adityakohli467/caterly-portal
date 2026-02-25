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


function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderIdParam = searchParams.get("order_id")
  const orderId = orderIdParam ? parseInt(orderIdParam) : null

  const { isAuthenticated, checkAuth } = useAuthStore()
  const { clearCart } = useCartStore()

  const [order, setOrder] = useState<any>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(true)

  useEffect(() => {
    console.log("PaymentPage: Initializing with order_id:", orderIdParam, "parsed:", orderId)

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
        router.push("/auth/login?redirect=/payment" + (orderIdParam ? `?order_id=${orderIdParam}` : ""))
        return
      }

      if (orderId) {
        fetchOrder(orderId)
      } else {
        setLoadingOrder(false)
        toast.error("Invalid or missing order ID")
      }
    }

    verifyAuth()
  }, [orderIdParam])

  const fetchOrder = async (id: number) => {
    try {
      setLoadingOrder(true)
      const response = await api.get(`/store/orders/${id}`)
      console.log("Fetched order:", response.data.order)
      setOrder(response.data.order)
    } catch (error) {
      console.error("Failed to fetch order:", error)
      toast.error("Failed to load order details")
    } finally {
      setLoadingOrder(false)
    }
  }

  /* Automatic redirect disabled to favor direct card form
  useEffect(() => {
    if (!loadingOrder && order && order.payment_status !== 'paid' && !paymentSuccess) {
      const timer = setTimeout(() => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
        window.location.href = `${baseUrl}/store/payment/${orderId}/fatzebra-hpp`;
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [loadingOrder, order, paymentSuccess, orderId]);
  */



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
                ) : !orderId ? (
                  <div className="flex flex-col items-center justify-center py-12 text-red-500">
                    <p className="text-lg font-bold">Invalid Order ID</p>
                    <p className="text-sm">Please return to your orders and try again.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push('/account')}
                    >
                      Go to Orders
                    </Button>
                  </div>
                ) : paymentSuccess ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-black">Payment Successful!</h3>
                    <p className="text-gray-600">Your order has been paid. Redirecting...</p>
                  </div>
                ) : order?.payment_status === 'paid' ? (
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
                ) : (
                  <div className="payment-form-wrapper text-black max-w-md mx-auto py-4">
                    <h3 className="text-xl font-bold mb-6 text-center">Credit Card Payment</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-left">Card Holder Name</label>
                        <input
                          type="text"
                          id="card_holder"
                          className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#E03A3E] focus:border-[#E03A3E] outline-none"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-left">Card Number</label>
                        <input
                          type="text"
                          id="card_number"
                          className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#E03A3E] focus:border-[#E03A3E] outline-none"
                          placeholder="4111 1111 1111 1111"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-left">Expiry (MM/YYYY)</label>
                          <input
                            type="text"
                            id="card_expiry"
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#E03A3E] focus:border-[#E03A3E] outline-none"
                            placeholder="12/2026"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-left">CVV</label>
                          <input
                            type="text"
                            id="cvv"
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#E03A3E] focus:border-[#E03A3E] outline-none"
                            placeholder="123"
                          />
                        </div>
                      </div>

                      <Button
                        id="pay-button"
                        className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white py-6 text-lg h-auto mt-6"
                        onClick={async () => {
                          const button = document.getElementById('pay-button') as HTMLButtonElement;
                          const cardHolder = (document.getElementById('card_holder') as HTMLInputElement).value;
                          const cardNumber = (document.getElementById('card_number') as HTMLInputElement).value.replace(/\s/g, '');
                          const cardExpiry = (document.getElementById('card_expiry') as HTMLInputElement).value;
                          const cvv = (document.getElementById('cvv') as HTMLInputElement).value;

                          if (!cardHolder || !cardNumber || !cardExpiry || !cvv) {
                            toast.error("Please fill in all card details");
                            return;
                          }

                          try {
                            button.disabled = true;
                            button.innerText = "Processing...";

                            const res = await api.post(`/store/payment/${orderId}/fatzebra-charge`, {
                              card_holder: cardHolder,
                              card_number: cardNumber,
                              card_expiry: cardExpiry,
                              cvv: cvv,
                              ip_address: '127.0.0.1' // In production, this should be the real client IP
                            });

                            if (res.data.success) {
                              setPaymentSuccess(true);
                              toast.success("Payment successful!");
                              clearCart();
                              setTimeout(() => {
                                router.push(`/orders/${orderId}`);
                              }, 3000);
                            } else {
                              toast.error(res.data.message || "Payment failed");
                              button.disabled = false;
                              button.innerText = "Pay Now";
                            }
                          } catch (err: any) {
                            console.error("Payment error:", err);
                            toast.error(err.response?.data?.message || "Payment gateway error");
                            button.disabled = false;
                            button.innerText = "Pay Now";
                          }
                        }}
                      >
                        Pay Now
                      </Button>

                      <p className="text-xs text-center text-gray-500 mt-4">
                        Securely processed by Fat Zebra. We do not store your card details.
                      </p>
                    </div>
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
