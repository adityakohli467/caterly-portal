"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCartStore, generateCartItemId } from "@/store/cart"
import { useAuthStore } from "@/store/auth"
import { useAuthModalStore } from "@/store/auth-modal"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Minus, Plus, Trash2, ShoppingCart, X, Upload, Check, Tag } from "lucide-react"
import { getProductImageUrl } from "@/lib/product-utils"
import { Textarea } from "@/components/ui/textarea"
import { PaymentModal } from "@/components/checkout/PaymentModal"
import { getSydneyTodayString, isTimeSlotPassed } from "@/lib/date-utils"

interface Product {
  product_id: number
  product_name: string
  product_price: string
  product_image?: string
}

interface Coupon {
  coupon_id: number
  code: string
  type: string
  value: number
  discount_amount?: number
  min_order_value?: number
  max_discount?: number
  usage_limit?: number
  used_count?: number
  valid_from?: string
  valid_until?: string
  is_active: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, getTotalPrice, getItemPrice, addItem, clearCart, updateDeliveryFrequency, updateDeliveryStartDate, updateItemData } = useCartStore()
  const { isAuthenticated, user, customer, checkAuth } = useAuthStore()
  const { openModal: openAuthModal } = useAuthModalStore()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([])
  const [showCoupons, setShowCoupons] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState<any>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false)
  const [deliveryNotesImage, setDeliveryNotesImage] = useState<File | null>(null)
  const [deliveryNotesImagePreview, setDeliveryNotesImagePreview] = useState<string | null>(null)
  const [isSubscription, setIsSubscription] = useState(false)
  const [subscriptionFrequency, setSubscriptionFrequency] = useState("Every 1 Week")
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(getSydneyTodayString())
  const [deliveryDate, setDeliveryDate] = useState<string>("")
  const [deliveryTime, setDeliveryTime] = useState<string>("")
  const [postcodeError, setPostcodeError] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)

  // Fix hydration error - only render prices after client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const [billingData, setBillingData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "Australia",
    streetAddress: "",
    apartment: "",
    suburb: "",
    state: "VIC",
    postcode: "",
    email: "",
    deliveryNotes: "",
  })

  useEffect(() => {
    // Only run once on mount
    const verifyAuth = async () => {
      // First, try to restore auth from localStorage
      try {
        await checkAuth()
      } catch (error) {
        // checkAuth handles errors internally, but we catch here just in case
        console.error("Auth check error:", error)
      }

      fetchRelatedProducts()
      fetchCoupons()

      const currentAuthState = useAuthStore.getState()
      if (currentAuthState.isAuthenticated) {
        // Auto-fill billing data from customer information
        const currentUser = currentAuthState.user
        const currentCustomer = currentAuthState.customer

        // Also read registration data saved locally (most reliable source)
        let localPrefill: any = {}
        try {
          const saved = localStorage.getItem("caterly_checkout_prefill")
          if (saved) localPrefill = JSON.parse(saved)
        } catch { }

        if (currentUser || currentCustomer) {
          // Build first/last name — backend may return firstname/lastname separately
          const firstName =
            currentCustomer?.firstname ||
            currentCustomer?.first_name ||
            (currentCustomer?.full_name || currentCustomer?.name || "").split(" ")[0] ||
            localPrefill.firstName ||
            ""
          const lastName =
            currentCustomer?.lastname ||
            currentCustomer?.last_name ||
            (currentCustomer?.full_name || currentCustomer?.name || "")
              .split(" ").slice(1).join(" ") ||
            localPrefill.lastName ||
            ""

          setBillingData(prev => ({
            ...prev,
            firstName,
            lastName,
            email:
              currentUser?.email ||
              currentCustomer?.email ||
              localPrefill.email ||
              "",
            // Use localStorage as fallback for fields API may not return
            phone:
              currentCustomer?.telephone ||
              currentCustomer?.phone ||
              currentCustomer?.phone_number ||
              localPrefill.phone ||
              "",
            streetAddress:
              currentCustomer?.address_line1 ||
              currentCustomer?.address ||
              currentCustomer?.street_address ||
              localPrefill.streetAddress ||
              "",
            suburb:
              currentCustomer?.suburb ||
              currentCustomer?.city ||
              localPrefill.suburb ||
              "",
            state: "VIC",
            postcode:
              currentCustomer?.postal_code ||
              currentCustomer?.postcode ||
              currentCustomer?.zip_code ||
              localPrefill.postcode ||
              "",
          }))
        }
      }
    }

    verifyAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const [isOrderCompleted, setIsOrderCompleted] = useState(false)

  // Separate effect for cart items check
  useEffect(() => {
    // Only redirect if cart is empty AND we haven't completed an order
    if (items.length === 0 && !isPaymentModalOpen && !isOrderCompleted) {
      router.push("/cart")
    }
  }, [items.length, router, isPaymentModalOpen, isOrderCompleted])

  const fetchRelatedProducts = async () => {
    try {
      const response = await api.get("/store/products/featured", { params: { limit: 5 } })
      setRelatedProducts(response.data.products || [])
    } catch (error: any) {
      console.error("Failed to fetch related products:", error)
      // Don't show error - related products are optional
      setRelatedProducts([])
    }
  }

  const fetchCoupons = async () => {
    try {
      const response = await api.get("/store/coupons")
      if (response.data && Array.isArray(response.data)) {
        setAvailableCoupons(response.data)
      } else if (response.data && response.data.coupons) {
        setAvailableCoupons(response.data.coupons)
      }
    } catch (error: any) {
      console.error("Failed to fetch coupons:", error)
    }
  }

  const calculateTotal = () => {
    let subtotal = getTotalPrice()

    // Calculate wholesale discount based on customer type
    let wholesaleDiscount = 0
    const customerType = customer?.customer_type || ''
    const isWholesale = customerType && (customerType.includes('Wholesale') || customerType.includes('Wholesaler'))

    if (isWholesale) {
      const discountPercentage = customerType.includes('Full Service') ? 15 : 10
      wholesaleDiscount = subtotal * (discountPercentage / 100)
    }

    const afterWholesaleDiscount = subtotal - wholesaleDiscount

    // Move shipping fee calculation up so coupon can be applied against the combined total
    const shippingFee = shippingMethod === "standard" ? 50 : 0

    // Calculate coupon discount (applied after wholesale discount)
    let couponDiscount = 0
    if (couponApplied) {
      if (couponApplied.type === 'P') {
        // Percentage discount - use value (percentage) not discount_amount
        couponDiscount = afterWholesaleDiscount * (couponApplied.value / 100)
      } else if (couponApplied.type === 'F') {
        // Fixed amount discount - use value to allow applying to both products and shipping
        couponDiscount = couponApplied.value || 0
      }
      // Ensure discount doesn't exceed the combined total of products + shipping
      couponDiscount = Math.min(couponDiscount, afterWholesaleDiscount + shippingFee)
    }

    const total = Math.max(0, afterWholesaleDiscount + shippingFee - couponDiscount)
    const afterDiscount = Math.max(0, afterWholesaleDiscount - couponDiscount)
    const gst = afterWholesaleDiscount * 0.11 // 11% GST (calculated on subtotal before coupons)

    return {
      subtotal,
      wholesaleDiscount,
      couponDiscount,
      afterWholesaleDiscount,
      afterDiscount,
      shippingFee,
      gst,
      total,
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code")
      return
    }

    setValidatingCoupon(true)
    try {
      const subtotal = getTotalPrice()
      // Calculate wholesale discount first
      const customerType = customer?.customer_type || ''
      const isWholesale = customerType && (customerType.includes('Wholesale') || customerType.includes('Wholesaler'))
      let wholesaleDiscount = 0
      if (isWholesale) {
        const discountPercentage = customerType.includes('Full Service') ? 15 : 10
        wholesaleDiscount = subtotal * (discountPercentage / 100)
      }
      const afterWholesaleDiscount = subtotal - wholesaleDiscount

      // Validate coupon with backend - include shipping fee in order total
      const shippingFee = shippingMethod === "standard" ? 50 : 0
      const response = await api.post("/store/coupons/validate", {
        coupon_code: couponCode.trim(),
        order_total: afterWholesaleDiscount + shippingFee,
      })

      if (response.data.valid && response.data.coupon) {
        setCouponApplied({
          code: response.data.coupon.code,
          type: response.data.coupon.type === 'percentage' ? 'P' : 'F',
          discount_amount: response.data.coupon.discount_amount,
          value: response.data.coupon.value,
        })
        toast.success(`Coupon "${response.data.coupon.code}" applied successfully!`)
      } else {
        toast.error("Invalid or expired coupon code")
        setCouponApplied(null)
      }
    } catch (error: any) {
      console.error("Coupon validation error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to validate coupon"
      toast.error(errorMessage)
      setCouponApplied(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponApplied(null)
    setCouponCode("")
    toast.success("Coupon removed")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file")
        return
      }
      setDeliveryNotesImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setDeliveryNotesImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setDeliveryNotesImage(null)
    setDeliveryNotesImagePreview(null)
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate State field (Select doesn't support native required)
    if (!billingData.state) {
      toast.error("Please select a State before placing your order.")
      return
    }

    // Validate Postcode
    const postcode = parseInt(billingData.postcode)
    if (isNaN(postcode) || postcode < 3000 || postcode > 3207) {
      const errorMsg = "Sorry, this delivery address is outside our service area. Please call us on 1300 827 286 with our staff to discuss any available options."
      setPostcodeError(errorMsg)
      toast.error(errorMsg)
      return
    } else {
      setPostcodeError("")
    }

    // Validate Delivery Date and Time
    if (!isSubscription) {
      if (!deliveryDate) {
        toast.error("Please select a delivery date.")
        return
      }
      if (!deliveryTime) {
        toast.error("Please select a delivery time.")
        return
      }
    } else {
      if (!subscriptionStartDate) {
        toast.error("Please select a subscription start date.")
        return
      }
      if (!deliveryTime) {
        toast.error("Please select a delivery time for your subscription.")
        return
      }
    }

    setLoading(true)

    try {
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: getItemPrice(item), // Include calculated price with options
        options: item.options || [],
        delivery_frequency: item.delivery_frequency || "One Time",
        delivery_start_date: item.delivery_start_date || null,
        delivery_time: item.delivery_time || deliveryTime || null,
        item_comments: item.item_comments || null,
        special_instructions: item.item_comments || null,
        comments: item.item_comments || null,
        comment: item.item_comments || null,
        notes: item.item_comments || null,
      }))

      const totals = calculateTotal()
      // Build delivery address properly
      const addressParts: string[] = []
      if (billingData.streetAddress) addressParts.push(billingData.streetAddress)
      if (billingData.apartment) addressParts.push(billingData.apartment)
      if (billingData.suburb) addressParts.push(billingData.suburb)
      if (billingData.state) addressParts.push(billingData.state)
      if (billingData.postcode) addressParts.push(billingData.postcode)

      const deliveryAddress = addressParts.join(", ") || billingData.streetAddress || ""

      const orderPayload: any = {
        items: orderItems,
        firstname: billingData.firstName,
        lastname: billingData.lastName,
        email: billingData.email,
        telephone: billingData.phone,
        delivery_address: deliveryAddress,
        delivery_fee: totals.shippingFee,
        payment_method: "card",
        coupon_code: couponApplied?.code || null,
        postcode: billingData.postcode,
        delivery_frequency: isSubscription ? subscriptionFrequency : "One Time",
        delivery_start_date: isSubscription ? subscriptionStartDate : null,
        delivery_date: !isSubscription ? deliveryDate : null,
        delivery_time: deliveryTime || null,
        delivery_date_time: isSubscription
          ? (subscriptionStartDate && deliveryTime ? formatDateTime(subscriptionStartDate, deliveryTime) : `${subscriptionStartDate}T00:00:00`)
          : (deliveryDate && deliveryTime ? formatDateTime(deliveryDate, deliveryTime) : new Date().toISOString()),
        subtotal: totals.afterDiscount,
        wholesale_discount: totals.wholesaleDiscount,
        coupon_discount: totals.couponDiscount,
        gst: totals.gst,
        gst_status: 1,
        order_total: totals.total,
        billing_address: billingData.streetAddress,
        billing_city: billingData.suburb,
        billing_postcode: billingData.postcode,
        billing_state: billingData.state,
        shipping_address: deliveryAddress,
        shipping_postcode: billingData.postcode,
        delivery_notes: billingData.deliveryNotes,
      }

      // Use different endpoints for authenticated vs guest checkout
      let response;
      if (isAuthenticated) {
        response = await api.post("/store/orders", orderPayload);
      } else {
        response = await api.post("/store/orders/guest", orderPayload);
      }

      // Upload delivery notes image after order is created (silently fail if error)
      if (deliveryNotesImage && response.data.order_id) {
        try {
          const formData = new FormData()
          formData.append("image", deliveryNotesImage)
          await api.post(`/store/orders/${response.data.order_id}/upload-image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        } catch (uploadError) {
          console.log("Image upload skipped (optional):", uploadError)
        }
      }

      const isSubscriptionOrder = isSubscription || items.some(item => item.delivery_frequency && item.delivery_frequency !== "One Time")
      if (typeof window !== "undefined") {
        localStorage.setItem("caterly_last_order_type", isSubscriptionOrder ? "subscription" : "normal")
        localStorage.setItem(`caterly_order_totals_${response.data.order_id}`, JSON.stringify({
          subtotal: totals.subtotal,
          couponDiscount: totals.couponDiscount,
          couponCode: couponApplied?.code || null,
          afterDiscount: totals.afterDiscount,
          shippingFee: totals.shippingFee,
          gst: totals.gst,
          total: totals.total,
        }))
      }

      setCurrentOrderId(response.data.order_id)
      setIsPaymentModalOpen(true)
    } catch (error: any) {
      console.error("Order creation error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to place order"
      if (!error.response || error.response.status < 500) {
        toast.error(errorMessage)
      } else {
        toast.error("Order may have been placed. Please check your order history.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setIsOrderCompleted(true)
    clearCart()
    // Success state is now handled within PaymentModal
  }

  const formatDateTime = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return new Date().toISOString();
    try {
      const [time, ampm] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      return `${dateStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    } catch (e) {
      return new Date().toISOString();
    }
  };

  const totals = useMemo(() => calculateTotal(), [
    items,
    customer,
    couponApplied,
    shippingMethod,
  ])

  if (!mounted) return null

  return (
    <div className="flex flex-col bg-white">
      {/* Main Checkout Content */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6">
          {!isAuthenticated && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-[#FFF1F1] to-white border border-[#F2CACA] shadow-sm text-center">
              <p className="text-gray-800 text-sm md:text-base">
                <span className="font-medium">Already have an account?</span>{" "}
                <button type="button" onClick={() => openAuthModal('login')} className="text-[#E03A3E] font-extrabold hover:underline transition-all">
                  Sign In
                </button>{" "}
                <span className="mx-2 text-gray-300">|</span>
                <span className="font-medium">New here?</span>{" "}
                <button type="button" onClick={() => openAuthModal('register')} className="text-[#E03A3E] font-extrabold hover:underline transition-all">
                  Create Account
                </button>
              </p>
            </div>
          )}

          <form onSubmit={handlePlaceOrder}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Billing and Shipping */}
              <div className="lg:col-span-2 space-y-6">

                {/* Order Summary Items */}
                <Card className="border-[#F2CACA] bg-white text-black overflow-hidden">
                  <CardContent className="p-4 md:pt-6">
                    <h2 className="text-xl md:text-2xl font-bold text-[#E03A3E] mb-4 md:mb-6">Order Summary</h2>
                    {/* Desktop View Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-[#F2CACA] text-left text-xs uppercase tracking-wider text-gray-500">
                            <th className="pb-3 pr-4 font-semibold">Product</th>
                            <th className="pb-3 pr-4 font-semibold text-right w-[80px]">Price</th>
                            <th className="pb-3 pr-4 font-semibold text-center w-[120px]">Quantity</th>
                            <th className="pb-3 pr-4 font-semibold text-right w-[100px]">Total</th>
                            <th className="pb-3 pl-4 w-[40px]"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F2CACA]">
                          {items.map((item) => {
                            const cartItemId = item.cart_item_id || generateCartItemId(item.product_id, item.options)
                            const itemPrice = getItemPrice(item)
                            const itemTotal = itemPrice * item.quantity

                            return (
                              <tr key={cartItemId} className="text-sm">
                                <td className="py-4 pr-4 min-w-[250px]">
                                  <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 bg-gray-50 rounded overflow-hidden flex-shrink-0 border border-gray-100">
                                      {item.product_image ? (
                                        <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">No Pic</div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-bold text-[#1A237E] leading-tight text-sm">{item.product_name}</div>
                                      {item.options?.map((opt, idx) => (
                                        <div key={idx} className="text-[10px] text-gray-500">
                                          {opt.option_name}: {opt.option_value}
                                        </div>
                                      ))}
                                      {item.item_comments && (
                                        <div className="text-[11px] text-[#E03A3E] mt-1 italic font-medium">
                                          Note: {item.item_comments}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 pr-4 text-right font-medium text-gray-900">${itemPrice.toFixed(2)}</td>
                                <td className="py-4 pr-4">
                                  <div className="flex items-center justify-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(cartItemId, Math.max(1, item.quantity - 1))}
                                      className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:text-black hover:border-black transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="font-bold min-w-[20px] text-center text-sm">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(cartItemId, item.quantity + 1)}
                                      className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:text-black hover:border-black transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                                <td className="py-4 pr-4 text-right font-bold text-gray-900">${itemTotal.toFixed(2)}</td>
                                <td className="py-4 pl-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => removeItem(cartItemId)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                    title="Remove item"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View Item Cards */}
                    <div className="md:hidden space-y-6">
                      {items.map((item) => {
                        const cartItemId = item.cart_item_id || generateCartItemId(item.product_id, item.options)
                        const itemPrice = getItemPrice(item)
                        const itemTotal = itemPrice * item.quantity

                        return (
                          <div key={cartItemId} className="flex flex-col gap-4 border-b border-[#F2CACA] last:border-0 pb-6 last:pb-0">
                            <div className="flex gap-4">
                              <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                                {item.product_image ? (
                                  <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Pic</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="font-bold text-[#1A237E] text-base leading-tight truncate">{item.product_name}</div>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(cartItemId)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                {item.options?.map((opt, idx) => (
                                  <div key={idx} className="text-xs text-gray-500 mt-1">
                                    {opt.option_name}: {opt.option_value}
                                  </div>
                                ))}
                                {item.item_comments && (
                                  <div className="text-[11px] text-[#E03A3E] mt-2 italic font-medium bg-red-50/50 p-2 rounded-md">
                                    Note: {item.item_comments}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-4 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(cartItemId, Math.max(1, item.quantity - 1))}
                                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-600 active:bg-gray-100 shadow-sm"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold text-lg min-w-[20px] text-center">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(cartItemId, item.quantity + 1)}
                                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-600 active:bg-gray-100 shadow-sm"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500 mb-1">Item Total</div>
                                <div className="text-xl font-bold text-gray-900">${itemTotal.toFixed(2)}</div>
                                <div className="text-[10px] text-gray-400 font-medium">${itemPrice.toFixed(2)} each</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Purchase Options */}
                <Card className="border-[#F2CACA] bg-white">
                  <CardContent className="pt-6">
                    {/* Delivery Window Banner */}
                    <div className="mb-8 p-5 bg-[#FFF8F8] border-l-4 border-[#E03A3E] rounded-r-xl shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-[#E03A3E] text-white p-1 rounded-full mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <p className="text-xs md:text-sm text-gray-800 leading-relaxed font-medium">
                          <span className="font-bold text-[#E03A3E]">Standard 1-hour delivery window:</span> For example, a 10:00am selection means your delivery will arrive between 9:00am - 10:00am.
                        </p>
                      </div>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-[#E03A3E] mb-6">Purchase Options</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <button
                        type="button"
                        onClick={() => setIsSubscription(false)}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${!isSubscription
                          ? "border-[#E03A3E] bg-white text-black"
                          : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                          }`}
                      >
                        <span className="font-bold">One-Off Purchases</span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${!isSubscription ? "bg-[#E03A3E] text-white" : "border-2 border-gray-300 bg-white"}`}>
                          {!isSubscription ? <Check className="w-4 h-4" /> : null}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSubscription(true)}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${isSubscription
                          ? "border-[#E03A3E] bg-white text-black"
                          : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                          }`}
                      >
                        <span className="font-bold">Create Subscription</span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSubscription ? "bg-[#E03A3E] text-white" : "border-2 border-gray-300 bg-white"}`}>
                          {isSubscription ? <Check className="w-4 h-4" /> : null}
                        </div>
                      </button>
                    </div>

                    {!isSubscription ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                          <Label htmlFor="delivery-date" className="text-black mb-2 block">Delivery date</Label>
                          <Input
                            id="delivery-date"
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => {
                              const newDate = e.target.value;
                              setDeliveryDate(newDate);
                              // Reset time if it becomes invalid on the newly selected today
                              if (newDate === getSydneyTodayString() && deliveryTime && isTimeSlotPassed(newDate, deliveryTime)) {
                                setDeliveryTime("");
                              }
                            }}
                            min={getSydneyTodayString()}
                            required={!isSubscription}
                            className="bg-white border-gray-300 text-gray-900 focus:ring-[#E03A3E] focus:border-[#E03A3E]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="delivery-time" className="text-black mb-2 block">Delivery Time</Label>
                          <Select
                            value={deliveryTime}
                            onValueChange={setDeliveryTime}
                            required={!isSubscription}
                          >
                            <SelectTrigger id="delivery-time" className="bg-white border-gray-300 text-gray-900 focus:ring-[#E03A3E]">
                              <SelectValue placeholder="Add Time" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-gray-900 border-gray-200">
                              {Array.from({ length: 18 * 4 }).map((_, i) => {
                                const hour = Math.floor(i / 4) + 6
                                const minute = (i % 4) * 15
                                const h = hour > 12 ? hour - 12 : hour
                                const m = minute === 0 ? "00" : minute
                                const ampm = hour >= 12 ? "PM" : "AM"
                                const timeStr = `${h}:${m} ${ampm}`
                                const isPassed = isTimeSlotPassed(deliveryDate || getSydneyTodayString(), timeStr)

                                return (
                                  <SelectItem
                                    key={i}
                                    value={timeStr}
                                    disabled={isPassed}
                                    className={isPassed ? "opacity-50 cursor-not-allowed" : ""}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span>{timeStr}</span>
                                      {isPassed && <span className="text-[10px] ml-2 font-normal text-gray-400 italic">(Past)</span>}
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                          <Label htmlFor="frequency" className="text-[#E03A3E] font-bold text-lg mb-2 block">Choose your subscription</Label>
                          <Select
                            value={subscriptionFrequency}
                            onValueChange={setSubscriptionFrequency}
                          >
                            <SelectTrigger id="frequency" className="bg-white border-gray-300 text-gray-900 h-12 focus:ring-[#E03A3E]">
                              <SelectValue placeholder="Once a week" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-gray-900 border-gray-200">
                              <SelectItem value="Once a week">Once a week</SelectItem>
                              <SelectItem value="Every 2 Weeks">Every 2 Weeks</SelectItem>
                              <SelectItem value="Every 3 Weeks">Every 3 Weeks</SelectItem>
                              <SelectItem value="Every 4 Weeks">Every 4 Weeks</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start-date" className="text-[#E03A3E] font-bold text-lg mb-2 block">First Delivery Date</Label>
                            <Input
                              id="start-date"
                              type="date"
                              value={subscriptionStartDate}
                              onChange={(e) => {
                                const newDate = e.target.value;
                                setSubscriptionStartDate(newDate);
                                // Reset time if it becomes invalid on the newly selected today
                                if (newDate === getSydneyTodayString() && deliveryTime && isTimeSlotPassed(newDate, deliveryTime)) {
                                  setDeliveryTime("");
                                }
                              }}
                              min={getSydneyTodayString()}
                              className="bg-white border-gray-300 text-gray-900 h-10 focus:ring-[#E03A3E] focus:border-[#E03A3E]"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sub-time" className="text-[#E03A3E] font-bold text-lg mb-2 block">Delivery Time</Label>
                            <Select
                              value={deliveryTime}
                              onValueChange={setDeliveryTime}
                            >
                              <SelectTrigger id="sub-time" className="bg-white border-gray-300 text-gray-900 h-10 focus:ring-[#E03A3E]">
                                <SelectValue placeholder="Add Time" />
                              </SelectTrigger>
                              <SelectContent className="bg-white text-gray-900 border-gray-200">
                                {Array.from({ length: 18 * 4 }).map((_, i) => {
                                  const hour = Math.floor(i / 4) + 6
                                  const minute = (i % 4) * 15
                                  const h = hour > 12 ? hour - 12 : hour
                                  const m = minute === 0 ? "00" : minute
                                  const ampm = hour >= 12 ? "PM" : "AM"
                                  const timeStr = `${h}:${m} ${ampm}`
                                  const isPassed = isTimeSlotPassed(subscriptionStartDate || getSydneyTodayString(), timeStr)

                                  return (
                                    <SelectItem
                                      key={i}
                                      value={timeStr}
                                      disabled={isPassed}
                                      className={isPassed ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span>{timeStr}</span>
                                        {isPassed && <span className="text-[10px] ml-2 font-normal text-gray-400 italic">(Past)</span>}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Delivery Details */}
                <Card className="border-[#F2CACA] bg-white">
                  <CardContent className="p-4 md:pt-6">
                    <h2 className="text-xl md:text-2xl font-bold text-[#E03A3E] mb-6">Delivery Details</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billing-firstname" className="text-black">First Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="billing-firstname"
                            value={billingData.firstName}
                            onChange={(e) => setBillingData({ ...billingData, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="billing-lastname" className="text-black">Last Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="billing-lastname"
                            value={billingData.lastName}
                            onChange={(e) => setBillingData({ ...billingData, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="billing-phone" className="text-black">Phone <span className="text-red-500">*</span></Label>
                        <Input
                          id="billing-phone"
                          type="tel"
                          value={billingData.phone}
                          onChange={(e) => setBillingData({ ...billingData, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="billing-email" className="text-black">Email Address</Label>
                        <Input
                          id="billing-email"
                          type="email"
                          value={billingData.email}
                          onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="billing-street" className="text-black">Delivery Address <span className="text-red-500">*</span></Label>
                        <Input
                          id="billing-street"
                          value={billingData.streetAddress}
                          onChange={(e) => setBillingData({ ...billingData, streetAddress: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="billing-apartment" className="text-black">Apartment, suite, unit, etc (optional)</Label>
                        <Input
                          id="billing-apartment"
                          value={billingData.apartment}
                          onChange={(e) => setBillingData({ ...billingData, apartment: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="billing-suburb" className="text-black">Suburb <span className="text-red-500">*</span></Label>
                        <Input
                          id="billing-suburb"
                          value={billingData.suburb}
                          onChange={(e) => setBillingData({ ...billingData, suburb: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="billing-postcode" className="text-black">Postcode <span className="text-red-500">*</span></Label>
                        <Input
                          id="billing-postcode"
                          value={billingData.postcode}
                          onChange={(e) => {
                            setBillingData({ ...billingData, postcode: e.target.value })
                            const pc = parseInt(e.target.value)
                            if (e.target.value && (isNaN(pc) || pc < 3000 || pc > 3207)) {
                              setPostcodeError("Sorry, this delivery address is outside our service area. Please call us on 1300 827 286 with our staff to discuss any available options.")
                            } else {
                              setPostcodeError("")
                            }
                          }}
                          required
                          className={postcodeError ? "border-red-500" : ""}
                        />
                        {postcodeError && (
                          <p className="text-red-500 text-xs mt-1 font-medium leading-tight">
                            {postcodeError}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="billing-state" className="text-black">State <span className="text-red-500">*</span></Label>
                        <Input
                          id="billing-state"
                          value={billingData.state}
                          readOnly
                          className="bg-gray-50 border-gray-300 text-gray-900 cursor-not-allowed font-semibold"
                        />
                      </div>

                      <div className="pt-2">
                        <Label htmlFor="delivery-notes" className="text-black mb-2 block">Delivery Notes (Optional)</Label>
                        <Textarea
                          id="delivery-notes"
                          value={billingData.deliveryNotes}
                          onChange={(e) => setBillingData({ ...billingData, deliveryNotes: e.target.value })}
                          className="min-h-[100px] bg-white border-gray-300 text-gray-900 focus:ring-[#E03A3E] focus:border-[#E03A3E]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary and Action */}
              <div className="lg:col-span-1 mt-8 lg:mt-0">
                <Card className="lg:sticky lg:top-24 border-[#F2CACA] bg-white text-black">
                  <CardContent className="p-4 md:pt-6 text-black">
                    <h2 className="text-xl md:text-2xl font-bold text-[#E03A3E] mb-6">
                      Order Summary
                    </h2>

                    <div className="space-y-4 mb-6">
                      {/* Coupon Code Section */}
                      <div className="mb-6">
                        <Label className="mb-2 block text-gray-900">Coupon Code</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter coupon code"
                            disabled={!!couponApplied || validatingCoupon}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                if (!couponApplied && !validatingCoupon) {
                                  handleApplyCoupon()
                                }
                              }
                            }}
                            className="bg-white text-gray-900"
                          />
                          {couponApplied ? (
                            <Button
                              type="button"
                              onClick={handleRemoveCoupon}
                              disabled={validatingCoupon}
                              className="bg-[#E03A3E] hover:bg-[#cc3236] text-white"
                            >
                              Remove
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={!couponCode.trim() || validatingCoupon}
                              className="bg-[#E03A3E] hover:bg-[#cc3236] text-white"
                            >
                              {validatingCoupon ? "Validating..." : "Apply"}
                            </Button>
                          )}
                        </div>

                        {couponApplied && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-green-900">
                                Coupon "{couponApplied.code}" applied!
                              </p>
                              <p className="text-xs text-green-700 mt-0.5">
                                {couponApplied.type === 'P'
                                  ? `${couponApplied.value}% discount`
                                  : `$${couponApplied.value} discount`}
                              </p>
                            </div>
                          </div>
                        )}

                        {!couponApplied && (
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => setShowCoupons(!showCoupons)}
                              className="text-sm text-[#E03A3E] hover:text-[#cc3236] font-medium mb-2 flex items-center gap-1"
                            >
                              <Tag className="w-4 h-4" />
                              {showCoupons ? "Hide" : "View"} Available Coupons
                              {availableCoupons.length > 0 && (
                                <span className="ml-1 bg-red-100 text-[#E03A3E] text-xs px-2 py-0.5 rounded-full">
                                  {availableCoupons.length}
                                </span>
                              )}
                            </button>

                            {showCoupons && (
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                {availableCoupons.length > 0 ? (
                                  availableCoupons.map((coupon) => (
                                    <div
                                      key={coupon.id || coupon.code}
                                      onClick={() => {
                                        setCouponCode(coupon.code)
                                      }}
                                      className="border border-dashed border-gray-300 rounded-md p-2 hover:bg-red-50 hover:border-[#E03A3E] cursor-pointer transition-colors flex items-center gap-3 group"
                                    >
                                      <div className="bg-red-100 text-[#E03A3E] p-1.5 rounded">
                                        <Tag className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                          <span className="font-bold text-sm text-gray-800 truncate">{coupon.code}</span>
                                          <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                            {coupon.type === 'percentage' || coupon.type === 'P'
                                              ? `${parseFloat(coupon.value)}% OFF`
                                              : `$${parseFloat(coupon.value)} OFF`}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 px-3 bg-gray-50 rounded-md">
                                    <p className="text-sm text-gray-600">No coupons available</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Cost Breakdown */}
                      <div className="space-y-2 mb-6 pb-6 border-b border-[#F2CACA] text-black">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal (includes GST)</span>
                          <span>${totals.subtotal.toFixed(2)}</span>
                        </div>

                        {totals.wholesaleDiscount > 0 && (
                          <div className="flex justify-between text-sm text-blue-600">
                            <span>Wholesale Discount</span>
                            <span>- ${totals.wholesaleDiscount.toFixed(2)}</span>
                          </div>
                        )}

                        {totals.couponDiscount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>
                              Coupon Discount {couponApplied?.code && `(${couponApplied.code})`}
                            </span>
                            <span>- ${totals.couponDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        {totals.shippingFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Delivery Fee</span>
                            <span>${totals.shippingFee.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs text-gray-500 italic mt-2">
                          <span>Includes GST (11%)</span>
                          <span>${totals.gst.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-lg font-bold mb-6 pt-6 border-t border-[#F2CACA] text-black">
                      <span>Total</span>
                      <span>${totals.total.toFixed(2)}</span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white py-4 md:py-6 text-base md:text-lg rounded-lg font-semibold"
                      disabled={loading}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {loading ? "Processing..." : "Proceed to Payment"}
                    </Button>

                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* You May Also Like Section */}
      {relatedProducts.length > 0 && (
        <section className="py-10 bg-white border-t border-[#F2CACA]">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">
              You may also like
            </h2>

            <div className="flex gap-5 overflow-x-auto pb-4 items-stretch">
              {relatedProducts.map((product) => (
                <Card
                  key={product.product_id}
                  className="w-[220px] flex-shrink-0 border border-[#F2CACA] bg-white shadow-sm rounded-xl flex flex-col"
                >
                  <div className="relative bg-[#F9F9F9] rounded-t-xl overflow-hidden aspect-[4/3] w-full">
                    {getProductImageUrl(product) ? (
                      <Image
                        src={getProductImageUrl(product)!}
                        alt={product.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm text-[#1A1A1A] mb-1">
                      {product.product_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      ${parseFloat(product.product_price).toFixed(2)}
                    </p>

                    <Button
                      size="sm"
                      className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white mt-auto"
                      onClick={() =>
                        addItem({
                          product_id: product.product_id,
                          product_name: product.product_name,
                          product_price: product.product_price,
                          product_image: getProductImageUrl(product),
                        })
                      }
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderId={currentOrderId}
        orderTotal={totals.total}
        customerName={`${billingData.firstName} ${billingData.lastName}`}
        items={items.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          price: getItemPrice(item)
        }))}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}