"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, Package, MapPin, FileText, CheckCircle2, XCircle, Clock } from "lucide-react"
import { PaymentModal } from "@/components/checkout/PaymentModal"
import { getProductImageUrl } from "@/lib/product-utils"

interface OrderItem {
  product_id: number
  product_name: string
  quantity: number
  price: string
  total: string
  delivery_frequency?: string
  options?: any[] | string
  item_comments?: string
}

interface Order {
  order_id: number
  order_total: string
  order_status: number
  delivery_address: string
  delivery_phone: string
  delivery_email: string
  delivery_date_time: string
  order_comments: string
  date_added: string
  items?: OrderItem[]
  subtotal?: string
  wholesale_discount?: string
  coupon_discount?: string
  coupon_code?: string
  gst?: string
  delivery_fee?: string
  total?: string
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string
  const { checkAuth, user } = useAuthStore()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        await checkAuth()
        if (!useAuthStore.getState().isAuthenticated) {
          router.push("/auth/login")
          return
        }
        fetchOrder()
      } catch {
        router.push("/auth/login")
      }
    }
    init()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/store/orders/${orderId}`)
      setOrder(response.data.order)
    } catch (error: any) {
      toast.error("Failed to load order")
      router.push("/account")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#E03A3E]" />
      </div>
    )
  }

  if (!order) return null

  const getStatusDisplay = () => {
    switch (order.order_status) {
      case 2:
        return { 
          text: "Paid", 
          color: "text-green-600 bg-green-50 border-green-200", 
          icon: <CheckCircle2 className="h-4 w-4" /> 
        }
      case 0:
        return { 
          text: "Cancelled", 
          color: "text-red-600 bg-red-50 border-red-200", 
          icon: <XCircle className="h-4 w-4" /> 
        }
      case 1:
      default:
        return { 
          text: "Payment Pending", 
          color: "text-[#E03A3E] bg-red-50 border-[#F2CACA]", 
          icon: <Clock className="h-4 w-4" /> 
        }
    }
  }

  const status = getStatusDisplay()

  const parseP = (v: any) => parseFloat(String(v || "0").replace(/[^\d.-]/g, "")) || 0

  // Use item.total as it correctly includes base price, options, and quantity
  const trueSubtotal = order.items?.reduce((sum, item) => {
    return sum + parseP(item.total)
  }, 0) || 0

  const deliveryFee = parseP(order.delivery_fee)
  const couponDiscount = parseP(order.coupon_discount)

  const subtotalAfterCoupon = Math.max(0, trueSubtotal - couponDiscount)

  // Recalculate GST accurately (10% of subtotal)
  const gst = trueSubtotal * 0.1

  // Final Total verification
  const total = subtotalAfterCoupon + deliveryFee

  const preDiscountSubtotal = trueSubtotal

  return (
    <div className="w-full min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Back and Actions */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/account">
            <Button variant="outline" className="border-gray-300 text-white bg-[#E03A3E] hover:bg-[#cc3236]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => window.open(`/orders/${order.order_id}/invoice`, "_blank")}
            className="border-gray-300 text-white bg-[#E03A3E] hover:bg-[#cc3236]"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Invoice
          </Button>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold text-black">Order #{order.order_id}</h1>
        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold ${status.color}`}>
          {status.icon}
          {status.text}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order Items */}
            <Card className="bg-white border border-[#F2CACA]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Package className="text-[#E03A3E]" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.items?.map((item, index) => {
                  let parsedOptions: any[] = []
                  if (typeof item.options === "string") {
                    try { parsedOptions = JSON.parse(item.options) } catch { }
                  } else if (Array.isArray(item.options)) {
                    parsedOptions = item.options
                  }

                  return (
                    <div key={index} className="flex justify-between items-start py-4 border-b last:border-b-0">
                      <div>
                        <p className="font-semibold text-black">{item.product_name}</p>

                        {(parsedOptions.length > 0 || (item.delivery_frequency && item.delivery_frequency !== "One Time")) && (
                          <div className="mt-1 mb-2 space-y-1">
                            {parsedOptions.map((opt, idx) => (
                              <div key={idx} className="text-xs text-gray-500">
                                - {opt.name || opt.option_name}: {opt.value || opt.option_value}
                              </div>
                            ))}
                            {item.delivery_frequency && item.delivery_frequency !== "One Time" && (
                              <div className="text-xs text-blue-600 font-medium">
                                Delivery: {item.delivery_frequency}
                              </div>
                            )}
                          </div>
                        )}

                        {item.item_comments && (
                          <div className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded italic font-medium">
                            Item Comment: {item.item_comments}
                          </div>
                        )}

                        <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-black">${parseP(item.total).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">${(parseP(item.total) / (item.quantity || 1)).toFixed(2)} each</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card className="bg-white border border-[#F2CACA]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <MapPin className="text-[#E03A3E]" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-black">
                <p><b>Address:</b> {order.delivery_address}</p>
                <p><b>Phone:</b> {order.delivery_phone}</p>
                <p><b>Email:</b> {order.delivery_email}</p>
                {order.delivery_date_time && (
                  <p>
                    <b>Delivery:</b>{" "}
                    {new Date(order.delivery_date_time).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT - Order Summary */}
          <Card className="bg-white border border-[#F2CACA] sticky top-24 h-fit">
            <CardHeader>
              <CardTitle className="text-black">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-black">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${preDiscountSubtotal.toFixed(2)}</span>
              </div>

              {/* Only show coupon if one was actually applied */}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon{order.coupon_code ? ` (${order.coupon_code})` : ""}</span>
                  <span>- ${couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-500">
                <span>GST (10%)</span>
                <span>${gst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>

              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {Number(order.order_status) !== 2 && Number(order.order_status) !== 0 && (
                <Button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full mt-2 bg-[#E03A3E] hover:bg-[#cc3236] text-white font-bold py-5"
                >
                  Make Payment
                </Button>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {order && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          orderId={order.order_id}
          orderTotal={total}
          customerName={user?.username || order.delivery_email}
          items={order.items?.map(item => ({
            product_name: item.product_name,
            quantity: item.quantity,
            price: parseP(item.total) / (item.quantity || 1)
          })) || []}
          onSuccess={() => {
            fetchOrder()
            // Keep modal open to show success state, but clear cart is not needed here
          }}
        />
      )}
    </div>
  )
}
