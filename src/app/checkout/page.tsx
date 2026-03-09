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
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Minus, Plus, Trash2, ShoppingCart, X, Upload, Check, Tag } from "lucide-react"
import { getProductImageUrl } from "@/lib/product-utils"
import { Textarea } from "@/components/ui/textarea"

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
  const { items, updateQuantity, removeItem, getTotalPrice, getItemPrice, addItem, clearCart, updateDeliveryFrequency, updateDeliveryStartDate } = useCartStore()
  const { isAuthenticated, user, customer, checkAuth } = useAuthStore()
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
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [deliveryNotesImage, setDeliveryNotesImage] = useState<File | null>(null)
  const [deliveryNotesImagePreview, setDeliveryNotesImagePreview] = useState<string | null>(null)

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
    state: "",
    postcode: "",
    email: "",
  })

  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "Australia",
    streetAddress: "",
    apartment: "",
    suburb: "",
    state: "",
    postcode: "",
    email: "",
  })

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expirationDate: "",
    securityCode: "",
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
            state:
              currentCustomer?.state ||
              currentCustomer?.province ||
              localPrefill.state ||
              "",
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

  // Separate effect for cart items check
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

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

    // Calculate coupon discount (applied after wholesale discount)
    let couponDiscount = 0
    if (couponApplied) {
      if (couponApplied.type === 'P') {
        // Percentage discount - use value (percentage) not discount_amount
        couponDiscount = afterWholesaleDiscount * (couponApplied.value / 100)
      } else if (couponApplied.type === 'F') {
        // Fixed amount discount - use discount_amount
        couponDiscount = couponApplied.discount_amount || 0
      }
      // Ensure discount doesn't exceed afterWholesaleDiscount
      couponDiscount = Math.min(couponDiscount, afterWholesaleDiscount)
    }

    const afterDiscount = afterWholesaleDiscount - couponDiscount
    const shippingFee = shippingMethod === "standard" ? 50 : 0
    const gst = afterDiscount * 0.1 // 10% GST (display only, not added to total)
    const total = afterDiscount + shippingFee // GST is shown but not charged separately

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

      // Validate coupon with backend
      const response = await api.post("/store/coupons/validate", {
        coupon_code: couponCode.trim(),
        order_total: afterWholesaleDiscount, // Pass after wholesale discount
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

  const handleSelectCoupon = async (coupon: Coupon) => {
    setCouponCode(coupon.code)
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

      // Validate coupon with backend
      const response = await api.post("/store/coupons/validate", {
        coupon_code: coupon.code,
        order_total: afterWholesaleDiscount,
      })

      if (response.data.valid && response.data.coupon) {
        setCouponApplied({
          code: response.data.coupon.code,
          type: response.data.coupon.type === 'percentage' ? 'P' : 'F',
          discount_amount: response.data.coupon.discount_amount,
          value: response.data.coupon.value,
        })
        toast.success(`Coupon "${response.data.coupon.code}" applied successfully!`)
        setShowCoupons(false) // Hide coupon list after applying
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
    setLoading(true)

    try {
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: getItemPrice(item), // Include calculated price with options
        options: item.options || [],
        delivery_frequency: item.delivery_frequency || "One Time", // Per-item frequency
        delivery_start_date: item.delivery_frequency && item.delivery_frequency !== "One Time" ? item.delivery_start_date : null, // Per-item start date
      }))

      const totals = calculateTotal()
      // Build delivery address properly
      const addressParts: string[] = []
      if (shipToDifferentAddress) {
        if (shippingData.streetAddress) addressParts.push(shippingData.streetAddress)
        if (shippingData.apartment) addressParts.push(shippingData.apartment)
        if (shippingData.suburb) addressParts.push(shippingData.suburb)
        if (shippingData.state) addressParts.push(shippingData.state)
        if (shippingData.postcode) addressParts.push(shippingData.postcode)
      } else {
        if (billingData.streetAddress) addressParts.push(billingData.streetAddress)
        if (billingData.apartment) addressParts.push(billingData.apartment)
        if (billingData.suburb) addressParts.push(billingData.suburb)
        if (billingData.state) addressParts.push(billingData.state)
        if (billingData.postcode) addressParts.push(billingData.postcode)
      }
      const deliveryAddress = addressParts.join(", ") || billingData.streetAddress || ""

      // Find first subscription item to get frequency/start date for top level
      const subItem = items.find(item => item.delivery_frequency && item.delivery_frequency !== "One Time")

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
        notes: deliveryNotes || null,
        // Requested subscription fields
        delivery_frequency: subItem ? subItem.delivery_frequency : "One Time",
        delivery_start_date: subItem ? (subItem.delivery_start_date || null) : null,
        subtotal: totals.afterDiscount,
        wholesale_discount: totals.wholesaleDiscount,
        coupon_discount: totals.couponDiscount,
        gst: totals.gst,
        gst_status: 1, // Assuming 1 as per requirement
        order_total: totals.total,
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
          // Silently fail - order is already created, image upload is optional
          console.log("Image upload skipped (optional):", uploadError)
        }
      }

      // Clear cart after successful order
      clearCart()

      // Set subscription flag if any item has a recurring frequency
      const isSubscription = items.some(item => item.delivery_frequency && item.delivery_frequency !== "One Time")
      if (typeof window !== "undefined") {
        localStorage.setItem("caterly_last_order_type", isSubscription ? "subscription" : "normal")
      }

      toast.success("Order placed successfully!")

      // Redirect to payment page
      setTimeout(() => {
        router.push(`/payment?order_id=${response.data.order_id}`)
      }, 1000)
    } catch (error: any) {
      console.error("Order creation error:", error)
      // Only show error if it's not a network/server error that might be temporary
      const errorMessage = error.response?.data?.message || error.message || "Failed to place order"
      // Don't show error toast if order might have been created (check response)
      if (!error.response || error.response.status < 500) {
        toast.error(errorMessage)
      } else {
        // Server error - might have been created, check with user
        toast.error("Order may have been placed. Please check your order history.")
      }
    } finally {
      setLoading(false)
    }
  }

  const totals = useMemo(() => calculateTotal(), [
    items,
    customer,
    couponApplied,
    shippingMethod,
  ])

  return (
    <div className="flex flex-col bg-white">
      {/* You May Also Like Section */}
      {relatedProducts.length > 0 && (
        <section className="py-10 bg-white border-b border-[#F2CACA]">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">
              You may also like
            </h2>

            <div className="flex gap-5 overflow-x-auto pb-4">
              {relatedProducts.map((product) => (
                <Card
                  key={product.product_id}
                  className="min-w-[200px] flex-shrink-0 border border-[#F2CACA] bg-white shadow-sm rounded-xl"
                >
                  <div className="relative aspect-square bg-[#F9F9F9] rounded-t-xl overflow-hidden">
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

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm text-[#1A1A1A] mb-1">
                      {product.product_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      ${parseFloat(product.product_price).toFixed(2)}
                    </p>

                    <Button
                      size="sm"
                      className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white"
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


      {/* Main Checkout Content */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <form onSubmit={handlePlaceOrder}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Billing and Shipping */}
              <div className="lg:col-span-2 space-y-6">
                {/* Billing Details */}
                <Card className="border-[#F2CACA] bg-white">
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold text-[#E03A3E] mb-6">Delivery Details</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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

                      {/* <div>
                        <Label htmlFor="billing-country" className="text-black">Country Region</Label>
                        <Select value={billingData.country} onValueChange={(value) => setBillingData({ ...billingData, country: value })}>
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="New Zealand">New Zealand</SelectItem>
                          </SelectContent>
                        </Select>
                      </div> */}

                      <div>
                        <Label htmlFor="billing-street" className="text-black">Street Address <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="billing-state" className="text-black">State <span className="text-red-500">*</span></Label>
                        <Select value={billingData.state} onValueChange={(value) => setBillingData({ ...billingData, state: value })}>
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* <SelectItem value="NSW">NSW</SelectItem> */}
                            <SelectItem value="VIC">VIC</SelectItem>
                            {/* <SelectItem value="QLD">QLD</SelectItem>
                            <SelectItem value="SA">SA</SelectItem>
                            <SelectItem value="WA">WA</SelectItem>
                            <SelectItem value="TAS">TAS</SelectItem>
                            <SelectItem value="NT">NT</SelectItem>
                            <SelectItem value="ACT">ACT</SelectItem> */}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="billing-postcode" className="text-black">Postcode <span className="text-red-500">*</span></Label>
                        <Input
                          id="billing-postcode"
                          value={billingData.postcode}
                          onChange={(e) => setBillingData({ ...billingData, postcode: e.target.value })}
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
                    </div>
                  </CardContent>
                </Card>



                {/* Delivery Notes */}
                <Card className="border-[#F2CACA] bg-white">
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold text-[#E03A3E] mb-6">Delivery Notes</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="delivery-notes" className="text-black">Delivery Notes (Optional)</Label>
                        <Textarea
                          id="delivery-notes"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder="Add any special delivery instructions..."
                          rows={4}
                          className="mt-2"
                        />
                      </div>
                      {/* <div>
                        <Label htmlFor="delivery-notes-image" className="text-black">Attach Image (Optional)</Label>
                        <div className="mt-2">
                          {deliveryNotesImagePreview ? (
                            <div className="relative inline-block">
                              <img
                                src={deliveryNotesImagePreview}
                                alt="Delivery notes preview"
                                className="max-w-full h-48 object-contain border rounded"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                              </div>
                              <input
                                id="delivery-notes-image"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            </label>
                          )}
                        </div>
                      </div> */}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-[#F2CACA] bg-white text-black">
                  <CardContent className="pt-6 text-black">

                    <h2 className="text-2xl font-bold text-[#E03A3E] mb-6">
                      Order Summary
                    </h2>

                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
                      {items.map((item) => {
                        const cartItemId =
                          item.cart_item_id ||
                          generateCartItemId(item.product_id, item.options)
                        const itemPrice = getItemPrice(item)

                        return (
                          <div key={cartItemId} className="flex gap-4 pb-4 border-b border-[#F2CACA]">
                            <div className="relative w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                              {item.product_image ? (
                                <Image
                                  src={item.product_image}
                                  alt={item.product_name}
                                  fill
                                  className="object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div className="flex-1 text-black">
                              <h3 className="font-semibold text-sm mb-1 text-black">
                                {item.product_name}
                              </h3>

                              {/* Display Options & Frequency */}
                              {(item.options && item.options.length > 0 || item.delivery_frequency && item.delivery_frequency !== "One Time") && (
                                <div className="mb-2 space-y-1">
                                  {item.options?.map((opt, idx) => (
                                    <div key={idx} className="text-xs text-gray-600 flex justify-between">
                                      <span>{opt.option_name}: {opt.option_value}</span>
                                      {parseFloat(opt.option_price) > 0 && (
                                        <span>({opt.option_price_prefix}${parseFloat(opt.option_price).toFixed(2)})</span>
                                      )}
                                    </div>
                                  ))}
                                  {item.delivery_frequency && item.delivery_frequency !== "One Time" && (
                                    <div className="text-xs text-blue-600 font-medium pt-1">
                                      Delivery: {item.delivery_frequency}
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center border rounded border-gray-300">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateQuantity(cartItemId, item.quantity - 1)
                                    }
                                    className="h-6 w-6 p-0 text-black"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>

                                  <span className="px-2 text-sm text-black">
                                    {item.quantity}
                                  </span>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateQuantity(cartItemId, item.quantity + 1)
                                    }
                                    className="h-6 w-6 p-0 text-black"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-black">
                                    ${(itemPrice * item.quantity).toFixed(2)}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(cartItemId)}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>


                          </div>
                        )
                      })}
                    </div>

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
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
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
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar animate-in fade-in slide-in-from-top-1">
                              {availableCoupons.length > 0 ? (
                                availableCoupons.map((coupon) => (
                                  <div
                                    key={coupon.id || coupon.code}
                                    onClick={() => {
                                      setCouponCode(coupon.code)
                                    }}
                                    className="border border-dashed border-gray-300 rounded-md p-2 hover:bg-red-50 hover:border-[#E03A3E] cursor-pointer transition-colors flex items-center gap-3 group"
                                  >
                                    <div className="bg-red-100 text-[#E03A3E] p-1.5 rounded group-hover:bg-red-200 transition-colors">
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
                                      {coupon.description && (
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{coupon.description}</p>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 px-3 bg-gray-50 rounded-md border border-dashed border-gray-300">
                                  <p className="text-sm text-gray-600">No coupons available at the moment</p>
                                  <p className="text-xs text-gray-500 mt-1">Check back later for special offers!</p>
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
                        <span>Subtotal</span>
                        <span>${mounted ? totals.subtotal.toFixed(2) : '0.00'}</span>
                      </div>

                      {totals.wholesaleDiscount > 0 && (
                        <div className="flex justify-between text-sm text-blue-600">
                          <span>Wholesale Discount</span>
                          <span>- ${mounted ? totals.wholesaleDiscount.toFixed(2) : '0.00'}</span>
                        </div>
                      )}

                      {totals.couponDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>
                            Coupon Discount {couponApplied?.code && `(${couponApplied.code})`}
                          </span>
                          <span>- ${mounted ? totals.couponDiscount.toFixed(2) : '0.00'}</span>
                        </div>
                      )}
                      {totals.shippingFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Delivery Fee</span>
                          <span>${mounted ? totals.shippingFee.toFixed(2) : '0.00'}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>GST (10%)</span>
                        <span>${mounted ? totals.gst.toFixed(2) : '0.00'}</span>
                      </div>


                    </div>

                    <div className="flex justify-between text-lg font-bold mb-6 text-black">
                      <span>Total</span>
                      <span>${mounted ? totals.total.toFixed(2) : '0.00'}</span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white py-6 text-lg rounded-lg font-semibold"
                      disabled={loading}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {loading ? "Placing Order..." : "Place Order"}
                    </Button>

                  </CardContent>
                </Card>
              </div>

            </div>
          </form>
        </div>
      </section >
    </div >
  )
}