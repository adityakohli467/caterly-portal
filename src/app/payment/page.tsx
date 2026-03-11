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

      // If not authenticated AND no order ID, redirect to login
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
      // Use guest endpoint if not authenticated
      const endpoint = authenticated ? `/store/orders/${id}` : `/store/orders/guest/${id}`
      const response = await api.get(endpoint)
      console.log("Fetched order:", response.data.order)
      setOrder(response.data.order)
    } catch (error: any) {
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



  // if (!isAuthenticated) return null

  // --- Price breakdown ---
  // Primary source: checkout-saved totals in localStorage (backend recalculates items incorrectly)
  // Fallback: derive from backend fields
  const parsePrice = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(String(val).replace(/[^\d.-]/g, '')) || 0;
  }

  let savedTotals: any = null
  if (typeof window !== 'undefined' && orderId) {
    try {
      const raw = localStorage.getItem(`caterly_order_totals_${orderId}`)
      if (raw) savedTotals = JSON.parse(raw)
    } catch { }
  }

  const deliveryFee = parsePrice(order?.delivery_fee)
  const couponDiscount = savedTotals
    ? savedTotals.couponDiscount
    : parsePrice(order?.coupon_discount || 0)
  const couponCodeDisplay = savedTotals?.couponCode || order?.coupon_code || null
  const afterDiscount = savedTotals
    ? savedTotals.afterDiscount
    : parsePrice(order?.after_discount || order?.subtotal || 0)
  const preDiscountSubtotal = savedTotals
    ? savedTotals.subtotal
    : (order?.after_wholesale_discount
      ? parsePrice(order.after_wholesale_discount)
      : afterDiscount + couponDiscount)
  const gst = savedTotals ? savedTotals.gst : afterDiscount * 0.1
  const finalTotal = savedTotals ? savedTotals.total : afterDiscount + deliveryFee

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">

        {/* Back */}
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
                  <div className="payment-form-wrapper text-black max-w-xl mx-auto py-4">
                    <h2 className="text-xl font-bold mb-6 text-left">Payment Details</h2>

                    <div className="space-y-6">
                      {/* Card Number */}
                      <div className="space-y-1.5 flex flex-col">
                        <label className="text-sm font-medium text-gray-700 text-left">Card number</label>
                        <div className="relative">
                          <input
                            type="text"
                            id="card_number"
                            className="w-full rounded-lg border border-gray-200 p-3.5 pr-36 transition-all focus:ring-2 focus:ring-[#E03A3E]/10 focus:border-[#E03A3E] outline-none text-base tracking-wider"
                            placeholder="1234 1234 1234 1234"
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length > 16) value = value.slice(0, 16);
                              const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                              e.target.value = formatted;

                              // Visual detection logic
                              const visa = document.getElementById('visa-icon');
                              const mc = document.getElementById('mc-icon');
                              const amex = document.getElementById('amex-icon');
                              const disc = document.getElementById('disc-icon');

                              [visa, mc, amex, disc].forEach(el => el?.classList.add('opacity-30', 'grayscale'));

                              if (value.startsWith('4')) visa?.classList.remove('opacity-30', 'grayscale');
                              else if (value.startsWith('5')) mc?.classList.remove('opacity-30', 'grayscale');
                              else if (value.startsWith('3')) amex?.classList.remove('opacity-30', 'grayscale');
                              else if (value.startsWith('6')) disc?.classList.remove('opacity-30', 'grayscale');
                            }}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                            <img id="visa-icon" src="https://img.icons8.com/color/48/visa.png" className="h-6 transition-all" alt="Visa" />
                            <img id="mc-icon" src="https://img.icons8.com/color/48/mastercard.png" className="h-6 transition-all" alt="Mastercard" />
                            <img id="amex-icon" src="https://img.icons8.com/color/48/amex.png" className="h-6 transition-all" alt="Amex" />
                            <img id="disc-icon" src="https://img.icons8.com/color/48/discover.png" className="h-6 transition-all" alt="Discover" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Expiration */}
                        <div className="space-y-1.5 flex flex-col">
                          <label className="text-sm font-medium text-gray-700 text-left">Expiration date</label>
                          <input
                            type="text"
                            id="card_expiry"
                            className="w-full rounded-lg border border-gray-200 p-3.5 transition-all focus:ring-2 focus:ring-[#E03A3E]/10 focus:border-[#E03A3E] outline-none"
                            placeholder="MM / YY"
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length > 4) value = value.slice(0, 4);
                              if (value.length >= 2) {
                                e.target.value = value.slice(0, 2) + ' / ' + value.slice(2);
                              } else {
                                e.target.value = value;
                              }
                            }}
                          />
                        </div>

                        {/* Security Code */}
                        <div className="space-y-1.5 flex flex-col">
                          <label className="text-sm font-medium text-gray-700 text-left">Security code</label>
                          <div className="relative">
                            <input
                              type="text"
                              id="cvv"
                              className="w-full rounded-lg border border-gray-200 p-3.5 pr-10 transition-all focus:ring-2 focus:ring-[#E03A3E]/10 focus:border-[#E03A3E] outline-none"
                              placeholder="CVC"
                              maxLength={4}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                              <svg width="28" height="20" viewBox="0 0 24 16" className="text-gray-400">
                                <path fill="currentColor" opacity="0.2" d="M2 0h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" />
                                <rect y="3" width="24" height="3" fill="currentColor" />
                                <rect x="16" y="10" width="5" height="3" rx="1" fill="white" />
                                <text x="16.5" y="12.5" fontSize="3" fontWeight="bold" fill="currentColor">123</text>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Country */}
                      <div className="space-y-1.5 flex flex-col">
                        <label className="text-sm font-medium text-gray-700 text-left">Country</label>
                        <select
                          id="country"
                          className="w-full rounded-lg border border-gray-200 p-3.5 appearance-none bg-white focus:ring-2 focus:ring-[#E03A3E]/10 focus:border-[#E03A3E] outline-none cursor-pointer"
                        >
                          <option value="AU">Australia</option>
                          <option value="IN">India</option>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                        </select>
                      </div>

                      <div className="pt-4">
                        <Button
                          id="pay-button"
                          className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white py-4 rounded-lg text-lg font-semibold transition-all shadow-lg active:scale-[0.98]"
                          onClick={async () => {
                            const button = document.getElementById('pay-button') as HTMLButtonElement;
                            const cardNumber = (document.getElementById('card_number') as HTMLInputElement).value.replace(/\s/g, '');
                            const expiryInput = (document.getElementById('card_expiry') as HTMLInputElement).value;
                            const cvv = (document.getElementById('cvv') as HTMLInputElement).value;

                            // Format MM / YY to MM/YYYY for Fat Zebra
                            const expiryParts = expiryInput.split('/').map(p => p.trim());
                            let cardExpiry = "";
                            if (expiryParts.length === 2) {
                              const month = expiryParts[0].padStart(2, '0');
                              let year = expiryParts[1];
                              if (year.length === 2) year = '20' + year;
                              cardExpiry = `${month}/${year}`;
                            }

                            if (!cardNumber || !cardExpiry || !cvv) {
                              toast.error("Please fill in all card details correctly");
                              return;
                            }

                            try {
                              button.disabled = true;
                              button.innerText = "Processing...";

                              const res = await api.post(`/store/payment/${orderId}/fatzebra-charge`, {
                                card_holder: order?.customer_order_name || 'Customer',
                                card_number: cardNumber,
                                card_expiry: cardExpiry,
                                cvv: cvv,
                                ip_address: '127.0.0.1'
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
                      </div>

                      {/* <p className="text-[11px] text-center text-gray-400 mt-6 leading-relaxed px-4">
                        By providing your card information, you allow CATERLY to charge your card for future payments in accordance with their terms.
                      </p> */}
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
                      <span>${preDiscountSubtotal.toFixed(2)}</span>
                    </div>

                    {/* Coupon row — only when a coupon was applied */}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon{order?.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                        <span>- ${couponDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {gst > 0 && (
                      <div className="flex justify-between text-gray-500">
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