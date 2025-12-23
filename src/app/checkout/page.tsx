"use client"

import { useState, useEffect } from "react"
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
import { Minus, Plus, Trash2, ShoppingCart, X, Upload } from "lucide-react"
import { getProductImageUrl } from "@/lib/product-utils"
import { Textarea } from "@/components/ui/textarea"

interface Product {
  product_id: number
  product_name: string
  product_price: string
  product_image?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, getTotalPrice, getItemPrice, addItem, clearCart } = useCartStore()
  const { isAuthenticated, user, customer, checkAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState<any>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false)
  const [subscriptionFrequency, setSubscriptionFrequency] = useState("One Time")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [deliveryNotesImage, setDeliveryNotesImage] = useState<File | null>(null)
  const [deliveryNotesImagePreview, setDeliveryNotesImagePreview] = useState<string | null>(null)

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
      if (!isAuthenticated) {
        router.push("/auth/login?redirect=/checkout")
        return
      }
      
      // Verify token is still valid
      try {
        await checkAuth()
        // If checkAuth fails, it will clear auth state
        if (!useAuthStore.getState().isAuthenticated) {
          router.push("/auth/login?redirect=/checkout")
          return
        }
      } catch (error) {
        // Token expired or invalid - redirect to login
        router.push("/auth/login?redirect=/checkout")
        return
      }

      if (items.length === 0) {
        router.push("/cart")
        return
      }

      fetchRelatedProducts()
      const currentUser = useAuthStore.getState().user
      if (currentUser?.email) {
        setBillingData(prev => ({
          ...prev,
          email: currentUser.email || "",
        }))
      }
    }
    
    verifyAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Separate effect for cart items check
  useEffect(() => {
    if (items.length === 0 && isAuthenticated) {
      router.push("/cart")
    }
  }, [items.length, isAuthenticated, router])

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
    const shippingFee = shippingMethod === "standard" ? 10 : 0
    const gst = afterDiscount * 0.1 // 10% GST
    const total = afterDiscount + gst + shippingFee

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
        options: item.options || [],
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

      const orderPayload: any = {
        items: orderItems,
        delivery_address: deliveryAddress,
        delivery_fee: totals.shippingFee,
        payment_method: "card",
        coupon_code: couponApplied?.code || null,
        postcode: billingData.postcode,
        notes: deliveryNotes || null,
      }

      const response = await api.post("/store/orders", orderPayload)

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

  const totals = calculateTotal()

  return (
    <div className="flex flex-col bg-white">
      {/* You May Also Like Section */}
      {relatedProducts.length > 0 && (
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You may also like</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {relatedProducts.map((product) => (
                <Card key={product.product_id} className="min-w-[200px] flex-shrink-0">
                  <div className="relative aspect-square bg-gray-100">
                    {getProductImageUrl(product) ? (
                      <Image
                        src={getProductImageUrl(product)!}
                        alt={product.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm mb-1">{product.product_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">${parseFloat(product.product_price).toFixed(2)}</p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => addItem({
                        product_id: product.product_id,
                        product_name: product.product_name,
                        product_price: product.product_price,
                        product_image: getProductImageUrl(product),
                      })}
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
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing Details</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billing-firstname">First Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="billing-firstname"
                            value={billingData.firstName}
                            onChange={(e) => setBillingData({ ...billingData, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="billing-lastname">Last Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="billing-lastname"
                            value={billingData.lastName}
                            onChange={(e) => setBillingData({ ...billingData, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="billing-phone">Phone <span className="text-red-500">*</span></Label>
                        <Input
                          id="billing-phone"
                          type="tel"
                          value={billingData.phone}
                          onChange={(e) => setBillingData({ ...billingData, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="billing-country">Country Region</Label>
                        <Select value={billingData.country} onValueChange={(value) => setBillingData({ ...billingData, country: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="New Zealand">New Zealand</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="billing-street">House number & street name <span className="text-red-500">*</span></Label>
                        <Input
                          id="billing-street"
                          value={billingData.streetAddress}
                          onChange={(e) => setBillingData({ ...billingData, streetAddress: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="billing-apartment">Apartment, suite, unit, etc (optional)</Label>
                        <Input
                          id="billing-apartment"
                          value={billingData.apartment}
                          onChange={(e) => setBillingData({ ...billingData, apartment: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="billing-suburb">Suburb <span className="text-red-500">*</span></Label>
                        <Input
                          id="billing-suburb"
                          value={billingData.suburb}
                          onChange={(e) => setBillingData({ ...billingData, suburb: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="billing-state">State <span className="text-red-500">*</span></Label>
                        <Select value={billingData.state} onValueChange={(value) => setBillingData({ ...billingData, state: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NSW">NSW</SelectItem>
                            <SelectItem value="VIC">VIC</SelectItem>
                            <SelectItem value="QLD">QLD</SelectItem>
                            <SelectItem value="SA">SA</SelectItem>
                            <SelectItem value="WA">WA</SelectItem>
                            <SelectItem value="TAS">TAS</SelectItem>
                            <SelectItem value="NT">NT</SelectItem>
                            <SelectItem value="ACT">ACT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="billing-postcode">Postcode <span className="text-red-500">*</span></Label>
                        <Input
                          id="billing-postcode"
                          value={billingData.postcode}
                          onChange={(e) => setBillingData({ ...billingData, postcode: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="billing-email">Email Address</Label>
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

                {/* Ship to Different Address */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <input
                        type="radio"
                        id="ship-different"
                        checked={shipToDifferentAddress}
                        onChange={(e) => setShipToDifferentAddress(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="ship-different" className="font-normal cursor-pointer text-lg">
                        Ship to a different Address?
                      </Label>
                    </div>

                    {shipToDifferentAddress && (
                      <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="shipping-firstname">First Name</Label>
                            <Input
                              id="shipping-firstname"
                              value={shippingData.firstName}
                              onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="shipping-lastname">Last Name</Label>
                            <Input
                              id="shipping-lastname"
                              value={shippingData.lastName}
                              onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="shipping-phone">Phone</Label>
                          <Input
                            id="shipping-phone"
                            type="tel"
                            value={shippingData.phone}
                            onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="shipping-country">Country Region</Label>
                          <Select value={shippingData.country} onValueChange={(value) => setShippingData({ ...shippingData, country: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Australia">Australia</SelectItem>
                              <SelectItem value="New Zealand">New Zealand</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="shipping-street">House number & street name</Label>
                          <Input
                            id="shipping-street"
                            value={shippingData.streetAddress}
                            onChange={(e) => setShippingData({ ...shippingData, streetAddress: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="shipping-apartment">Apartment, suite, unit, etc (optional)</Label>
                          <Input
                            id="shipping-apartment"
                            value={shippingData.apartment}
                            onChange={(e) => setShippingData({ ...shippingData, apartment: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="shipping-suburb">Suburb</Label>
                          <Input
                            id="shipping-suburb"
                            value={shippingData.suburb}
                            onChange={(e) => setShippingData({ ...shippingData, suburb: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="shipping-state">State</Label>
                          <Select value={shippingData.state} onValueChange={(value) => setShippingData({ ...shippingData, state: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NSW">NSW</SelectItem>
                              <SelectItem value="VIC">VIC</SelectItem>
                              <SelectItem value="QLD">QLD</SelectItem>
                              <SelectItem value="SA">SA</SelectItem>
                              <SelectItem value="WA">WA</SelectItem>
                              <SelectItem value="TAS">TAS</SelectItem>
                              <SelectItem value="NT">NT</SelectItem>
                              <SelectItem value="ACT">ACT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="shipping-postcode">Postcode</Label>
                          <Input
                            id="shipping-postcode"
                            value={shippingData.postcode}
                            onChange={(e) => setShippingData({ ...shippingData, postcode: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="shipping-email">Email Address</Label>
                          <Input
                            id="shipping-email"
                            type="email"
                            value={shippingData.email}
                            onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Delivery Notes */}
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Notes</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="delivery-notes">Delivery Notes (Optional)</Label>
                        <Textarea
                          id="delivery-notes"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder="Add any special delivery instructions..."
                          rows={4}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="delivery-notes-image">Attach Image (Optional)</Label>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
                      {items.map((item) => {
                        const cartItemId = item.cart_item_id || generateCartItemId(item.product_id, item.options)
                        const itemPrice = getItemPrice(item)
                        return (
                          <div key={cartItemId} className="flex gap-4 pb-4 border-b">
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
                            <div className="flex-1">
                              <h3 className="font-bold text-sm mb-1">{item.product_name}</h3>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center border rounded">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateQuantity(cartItemId, item.quantity - 1)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="px-2 text-sm">{item.quantity}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateQuantity(cartItemId, item.quantity + 1)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm">${(itemPrice * item.quantity).toFixed(2)}</span>
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

                    {/* Delivery Frequency */}
                    <div className="mb-6">
                      <Label className="mb-2 block">Delivery Frequency</Label>
                      <Select value={subscriptionFrequency} onValueChange={setSubscriptionFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="One Time">One Time</SelectItem>
                          <SelectItem value="2 Weeks">Every 2 Weeks</SelectItem>
                          <SelectItem value="4 Weeks">Every 4 Weeks</SelectItem>
                          <SelectItem value="8 Weeks">Every 8 Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Coupon Code */}
                    <div className="mb-6">
                      <Label className="mb-2 block">Coupon Code</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                          disabled={!!couponApplied || validatingCoupon}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !couponApplied && !validatingCoupon) {
                              handleApplyCoupon()
                            }
                          }}
                        />
                        {couponApplied ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleRemoveCoupon}
                            disabled={validatingCoupon}
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleApplyCoupon}
                            disabled={!couponCode.trim() || validatingCoupon}
                          >
                            {validatingCoupon ? "Validating..." : "Apply"}
                          </Button>
                        )}
                      </div>
                      {couponApplied && (
                        <div className="text-sm text-green-600">
                          <p>✅ Coupon "{couponApplied.code}" applied!</p>
                          <p className="text-xs text-gray-600">
                            {couponApplied.type === 'P' 
                              ? `${couponApplied.value}% discount`
                              : `$${couponApplied.value} discount`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2 mb-6 pb-6 border-b">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${totals.subtotal.toFixed(2)}</span>
                      </div>
                      {totals.wholesaleDiscount > 0 && (
                        <div className="flex justify-between text-sm text-blue-600">
                          <span>Wholesale Discount</span>
                          <span>-${totals.wholesaleDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      {totals.couponDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>
                            Coupon Discount {couponApplied?.code && `(${couponApplied.code})`}
                          </span>
                          <span>-${totals.couponDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>GST (10%)</span>
                        <span>${totals.gst.toFixed(2)}</span>
                      </div>
                      {totals.shippingFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Shipping</span>
                          <span>${totals.shippingFee.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between text-lg font-bold mb-6">
                      <span>Total</span>
                      <span>${totals.total.toFixed(2)}</span>
                    </div>

                    {/* Shipping Options */}
                    <div className="mb-6">
                      <Label className="mb-3 block">Shipping</Label>
                      <div className="space-y-3">
                        <label className="flex items-start space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="shipping"
                            value="pickup"
                            checked={shippingMethod === "pickup"}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium">Local Pickup</span>
                            <p className="text-xs text-gray-600 mt-1">
                              St Dreux Coffee Roasters<br />
                              3/93 Jedda Rd, Prestons NSW 2170
                            </p>
                          </div>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="shipping"
                            value="standard"
                            checked={shippingMethod === "standard"}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Standard Shipping - $10.00</span>
                        </label>
                      </div>
                    </div>

                    {/* Payment Section */}
                    <div className="mb-6">
                      <Label className="mb-3 block">Payment (Credit/Debit Card)</Label>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="card-number" className="text-sm">Card number</Label>
                          <Input
                            id="card-number"
                            placeholder="1234 1234 1234 1234"
                            value={paymentData.cardNumber}
                            onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                            maxLength={19}
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiration-date" className="text-sm">Expiration date</Label>
                          <Input
                            id="expiration-date"
                            placeholder="MM/YY"
                            value={paymentData.expirationDate}
                            onChange={(e) => setPaymentData({ ...paymentData, expirationDate: e.target.value })}
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="security-code" className="text-sm">Security code</Label>
                          <Input
                            id="security-code"
                            placeholder="CVC"
                            value={paymentData.securityCode}
                            onChange={(e) => setPaymentData({ ...paymentData, securityCode: e.target.value })}
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#2952E6] hover:bg-[#1e3fb3] text-white py-6 text-lg"
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
      </section>
    </div>
  )
}
