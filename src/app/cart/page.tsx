"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCartStore, generateCartItemId } from "@/store/cart"
import { useAuthStore } from "@/store/auth"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, getTotalPrice, getItemPrice, getTotalItems } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/cart")
      return
    }
    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <Card className="border-[#F2CACA] bg-white">
            <CardContent className="py-16 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-[#E03A3E] mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-black">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Start adding some delicious items to your cart!
              </p>
              <Button
                onClick={() => router.push("/shop")}
                className="bg-[#E03A3E] hover:bg-[#cc3236] text-white"
              >
                Browse Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-black">
          Shopping Cart <span className="text-[#E03A3E] text-xl font-semibold">({getTotalItems()})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="border-[#F2CACA] bg-white">
              <CardHeader>
                <CardTitle className="text-black">
                  Cart Items ({getTotalItems()})
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-[#F2CACA]">
                {items.map((item) => {
                  const cartItemId =
                    item.cart_item_id ||
                    generateCartItemId(item.product_id, item.options)
                  const itemPrice = getItemPrice(item)

                  return (
                    <div
                      key={cartItemId}
                      className="py-4 flex flex-col sm:flex-row gap-4"
                    >
                      <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-100 rounded flex-shrink-0 border">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-base sm:text-lg text-black">
                            {item.product_name}
                          </h3>

                          {/* Options */}
                          {item.options && item.options.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {item.options.map((option, idx) => (
                                <p
                                  key={idx}
                                  className="text-xs sm:text-sm text-gray-600"
                                >
                                  {option.option_name}: {option.option_value}
                                  {Number.parseFloat(option.option_price || "0") > 0 && (
                                    <span className="text-gray-500">
                                      {option.option_price_prefix === "+" ? " (+$" : " (-$"}
                                      {Number.parseFloat(option.option_price).toFixed(2)})
                                    </span>
                                  )}
                                </p>
                              ))}
                            </div>
                          )}

                          <p className="text-[#E03A3E] font-bold mt-1 text-sm sm:text-base">
                            ${itemPrice.toFixed(2)} each
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center border rounded">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(cartItemId, item.quantity - 1)}
                                className="h-8 w-8 p-0 hover:bg-[#FDECEC]"
                              >
                                <Minus className="h-4 w-4 text-[#E03A3E]" />
                              </Button>
                              <span className="px-3 sm:px-4 font-medium text-sm sm:text-base text-black">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(cartItemId, item.quantity + 1)}
                                className="h-8 w-8 p-0 hover:bg-[#FDECEC]"
                              >
                                <Plus className="h-4 w-4 text-[#E03A3E]" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(cartItemId)}
                              className="text-[#E03A3E] hover:text-[#cc3236] h-8"
                            >
                              <Trash2 className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Remove</span>
                            </Button>
                          </div>
                        </div>

                        {/* Line Total */}
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-base sm:text-lg text-black">
                            ${(itemPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="border-[#F2CACA] bg-white">
              <CardHeader>
                <CardTitle className="text-black">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-black">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-medium">$10.00</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#E03A3E]">
                      ${(getTotalPrice() + 10.0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white"
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-[#E03A3E] text-[#E03A3E] hover:bg-[#FDECEC]"
                  onClick={() => router.push("/shop")}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
