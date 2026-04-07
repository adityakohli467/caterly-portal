"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

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
    customer_firstname?: string
    customer_lastname?: string
    company_name?: string
    items?: OrderItem[]
    subtotal?: string
    wholesale_discount?: string
    coupon_discount?: string
    coupon_code?: string
    gst?: string
    delivery_fee?: string
    total?: string
    location_name?: string
    location_company_name?: string
    location_abn?: string
    location_email?: string
    location_address?: string
    location_phone?: string
}

export default function InvoicePage() {
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
            toast.error("Failed to load invoice")
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

    const parseP = (v: any) => parseFloat(String(v || "0").replace(/[^\d.-]/g, "")) || 0

    // Use item.total as it correctly includes base price, options, and quantity
    const trueSubtotal = order.items?.reduce((sum, item) => {
        return sum + parseP(item.total)
    }, 0) || 0

    const deliveryFee = parseP(order.delivery_fee)
    const couponDiscount = parseP(order.coupon_discount)

    const subtotalAfterCoupon = Math.max(0, trueSubtotal - couponDiscount)

    // Recalculate GST accurately (11% of subtotal)
    const gst = trueSubtotal * 0.11

    // Final Total verification
    const total = subtotalAfterCoupon + deliveryFee

    const preDiscountSubtotal = trueSubtotal

    return (
        <div className="min-h-screen bg-gray-50 py-10 print:bg-white print:py-0">
            <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none p-10 print:p-0">

                {/* Print Button Wrapper */}
                <div className="flex justify-end mb-6 print:hidden">
                    <Button onClick={() => window.print()} className="bg-[#E03A3E] hover:bg-[#cc3236] text-white">
                        <Printer className="mr-2 h-4 w-4" /> Print Invoice
                    </Button>
                </div>

                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b pb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-[#E03A3E] uppercase tracking-wider">Invoice</h1>
                        <p className="text-gray-500 mt-2">Order #{order.order_id}</p>
                    </div>
                    <div className="text-right text-gray-600 flex flex-col items-end">
                        <div className="mb-4">
                            <Image
                                src="/assets/images/cat.svg"
                                alt="Caterly Logo"
                                width={150}
                                height={65}
                                priority
                            />
                        </div>
                        <p className="font-semibold text-black">{order.location_company_name || 'Caterly'}</p>
                        {order.location_address ? (
                            order.location_address.split('\n').map((line, idx) => (
                                <p key={idx}>{line}</p>
                            ))
                        ) : (
                            <>
                                <p>123 Catering Way</p>
                                <p>Sydney, NSW 2000</p>
                            </>
                        )}
                        <p>{order.location_email || 'contact@caterly.com.au'}</p>
                        {order.location_phone && <p>{order.location_phone}</p>}
                        <p>ABN: {order.location_abn || 'XX XXX XXX XXX'}</p>
                    </div>                </div>

                {/* Customer & Invoice Details */}
                <div className="flex justify-between items-start py-8">
                    <div>
                        <h3 className="text-gray-500 font-medium mb-1 uppercase text-sm tracking-wider">Bill To:</h3>
                        <p className="font-semibold text-lg text-black">
                            {order.customer_firstname || order.customer_lastname
                                ? `${order.customer_firstname || ""} ${order.customer_lastname || ""}`.trim()
                                : order.delivery_address.split(",")[0] || "Customer"}
                        </p>
                        {order.company_name && <p className="text-gray-700">{order.company_name}</p>}
                        <p className="text-gray-600 max-w-xs">{order.delivery_address}</p>
                        <p className="text-gray-600">{order.delivery_phone}</p>
                        <p className="text-gray-600">{order.delivery_email}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-gray-500 font-medium mb-1 uppercase text-sm tracking-wider">Invoice Info:</h3>
                        <p className="text-gray-600">
                            <span className="font-semibold text-black">Date:</span>{" "}
                            {new Date(order.date_added).toLocaleDateString("en-AU")}
                        </p>
                        {order.delivery_date_time && (
                            <p className="text-gray-600 mt-1">
                                <span className="font-semibold text-black">Delivery Date:</span>{" "}
                                {new Date(order.delivery_date_time).toLocaleDateString("en-AU")}
                            </p>
                        )}
                        <p className="text-gray-600 mt-1">
                            <span className="font-semibold text-black">Status:</span>{" "}
                            <span className={order.order_status === 2 ? "text-green-600 font-semibold" : "text-[#E03A3E] font-semibold"}>
                                {order.order_status === 0 ? "Cancelled" : order.order_status === 1 ? "Payment Pending" : order.order_status === 2 ? "Paid" : "Processed"}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Invoice Items */}
                <div className="mt-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="py-3 font-semibold text-gray-700">Description</th>
                                <th className="py-3 font-semibold text-gray-700 text-center">Qty</th>
                                <th className="py-3 font-semibold text-gray-700 text-right">Unit Price</th>
                                <th className="py-3 font-semibold text-gray-700 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item, index) => {
                                let parsedOptions: any[] = []
                                if (typeof item.options === "string") {
                                    try { parsedOptions = JSON.parse(item.options) } catch { }
                                } else if (Array.isArray(item.options)) {
                                    parsedOptions = item.options
                                }

                                return (
                                    <tr key={index} className="border-b border-gray-100">
                                        <td className="py-4 pr-4">
                                            <p className="font-medium text-black">{item.product_name}</p>
                                            {(parsedOptions.length > 0 || (item.delivery_frequency && item.delivery_frequency !== "One Time")) && (
                                                <div className="mt-1 text-sm text-gray-500">
                                                    {parsedOptions.map((opt, idx) => (
                                                        <span key={idx} className="block">
                                                            - {opt.name || opt.option_name}: {opt.value || opt.option_value}
                                                        </span>
                                                    ))}
                                                    {item.delivery_frequency && item.delivery_frequency !== "One Time" && (
                                                        <span className="block text-blue-600 mt-1">
                                                            Delivery: {item.delivery_frequency}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {item.item_comments && (
                                                <div className="mt-2">
                                                    <span className="block text-gray-600 text-xs italic font-medium bg-gray-50 p-1.5 rounded">
                                                        Item Comment: {item.item_comments}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 text-center text-gray-700">{item.quantity}</td>
                                        <td className="py-4 text-right text-gray-700">${(parseP(item.total) / (item.quantity || 1)).toFixed(2)}</td>
                                        <td className="py-4 text-right font-medium text-black">${parseP(item.total).toFixed(2)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mt-8 flex justify-end">
                    <div className="w-1/2 md:w-1/3">
                        <div className="flex justify-between py-2 text-gray-600">
                            <span>Subtotal:</span>
                            <span>${preDiscountSubtotal.toFixed(2)}</span>
                        </div>

                        {couponDiscount > 0 && (
                            <div className="flex justify-between py-2 text-green-600">
                                <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}:</span>
                                <span>-${couponDiscount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between py-2 text-gray-600">
                            <span>Delivery Fee:</span>
                            <span>${deliveryFee.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between py-2 text-gray-600 border-b pb-4">
                            <span>GST Included (11%):</span>
                            <span>${gst.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between py-4 text-xl font-bold text-black border-b-2">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>

                        <div className="text-center text-sm text-gray-500 mt-4">
                            Amount in AUD
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
                    <p>Thank you for your business!</p>
                    <p className="mt-1">If you have any questions about this invoice, please contact {order.location_email || 'contact@caterly.com.au'}</p>
                </div>

            </div>
        </div>
    )
}
