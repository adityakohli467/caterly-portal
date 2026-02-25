"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, Package, MapPin } from "lucide-react"

interface OrderItem {
  product_id: number
  product_name: string
  quantity: number
  price: string
  total: string
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
  const { checkAuth } = useAuthStore()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    /* 🔴 FORCE WHITE BACKGROUND */
    <div className="w-full min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Back */}
        <Link href="/account">
          <Button
            variant="outline"
            className="mb-6 border-gray-300 text-white bg-red-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>

        {/* Header */}
        <h1 className="text-3xl font-bold text-black">
          Order #{order.order_id}
        </h1>
        <p className="mt-2 font-semibold text-[#E03A3E]">
          Payment Pending
        </p>

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
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-4 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold text-black">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-black">
                        ${parseFloat(item.total).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${parseFloat(item.price).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
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
                <p className="text-black"><b className="text-black">Address:</b> {order.delivery_address}</p>
                <p className="text-black"><b className="text-black">Phone:</b> {order.delivery_phone}</p>
                <p className="text-black"><b className="text-black">Email:</b> {order.delivery_email}</p>
                <p className="text-black">
                  <b className="text-black">Delivery:</b>{" "}
                  {new Date(order.delivery_date_time).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT - SUMMARY */}
          <Card className="bg-white border border-[#F2CACA] sticky top-24">
            <CardHeader>
              <CardTitle className="text-black">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-black">
              <div className="flex justify-between text-black">
                <span className="text-black">Subtotal</span>
                <span className="text-black">${order.subtotal}</span>
              </div>
              {/* 
              <div className="flex justify-between text-black">
                <span className="text-black">Wholesale Discount</span>
                <span className="text-black">- $0.00</span>
              </div> */}

              <div className="flex justify-between text-black">
                <span className="text-black">
                  Coupon{order.coupon_code ? ` (${order.coupon_code})` : ''}
                </span>
                <span className="text-black">- ${parseFloat(order.coupon_discount || '0').toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-black">
                <span className="text-black">GST (10%)</span>
                <span className="text-black">${order.gst}</span>
              </div>

              <div className="flex justify-between text-black">
                <span className="text-black">Delivery</span>
                <span className="text-black">${order.delivery_fee}</span>
              </div>

              <div className="border-t pt-3 flex justify-between text-lg font-bold text-black">
                <span className="text-black">Total</span>
                <span className="text-black">${order.total}</span>
              </div>

              <Button
                onClick={() => router.push(`/payment?order_id=${order.order_id}`)}
                className="w-full mt-4 bg-[#E03A3E] hover:bg-[#cc3236] text-white"
              >
                Make Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
