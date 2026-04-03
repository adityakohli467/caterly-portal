"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Lock } from "lucide-react"

interface CardPaymentFormProps {
  orderId: number
  orderTotal: number
  customerName: string
  onSuccess: () => void
  onCancel: () => void
}

export function CardPaymentForm({ orderId, orderTotal, customerName, onSuccess, onCancel }: CardPaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    country: "AU"
  })

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "").slice(0, 16)
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.slice(i, i + 4))
    }

    if (parts.length > 0) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    let v = value.replace(/\D/g, "").slice(0, 4)
    
    // Month validation (cap at 12, floor at 01)
    if (v.length >= 2) {
      let month = v.slice(0, 2)
      const m = parseInt(month)
      if (m > 12) month = "12"
      else if (m === 0 && month.length === 2) month = "01"
      v = month + v.slice(2)
    }

    // Only add separator if we have year digits, which allows easy backspacing of the month
    if (v.length > 2) {
      return v.slice(0, 2) + " / " + v.slice(2)
    }
    return v
  }

  const handlePayNow = async () => {
    const cardNumber = formData.cardNumber.replace(/\s/g, "")
    const expiryInput = formData.expiry
    const cvv = formData.cvv

    // Format MM / YY to MM/YYYY for Fat Zebra
    const expiryParts = expiryInput.split("/").map(p => p.trim())
    let cardExpiry = ""
    if (expiryParts.length === 2) {
      const month = expiryParts[0].padStart(2, "0")
      let year = expiryParts[1]
      if (year.length === 2) year = "20" + year
      cardExpiry = `${month}/${year}`
    }

    if (!cardNumber || !cardExpiry || !cvv) {
      toast.error("Please fill in all card details correctly")
      return
    }

    setLoading(true)
    try {
      const res = await api.post(`/store/payment/${orderId}/fatzebra-charge`, {
        card_holder: customerName || "Customer",
        card_number: cardNumber,
        card_expiry: cardExpiry,
        cvv: cvv,
        ip_address: "127.0.0.1"
      })

      if (res.data.success) {
        toast.success("Payment successful!")
        onSuccess()
      } else {
        toast.error(res.data.message || "Payment failed")
      }
    } catch (err: any) {
      console.error("Payment error:", err)
      toast.error(err.response?.data?.message || "Payment gateway error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="card_number" className="text-black font-medium">Card number</Label>
          <div className="relative">
            <Input
              id="card_number"
              placeholder="1234 1234 1234 1234"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
              className="pr-36 text-black border-gray-200 focus:ring-[#E03A3E] focus:border-[#E03A3E]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-60">
              <img src="https://img.icons8.com/color/48/visa.png" className="h-6" alt="Visa" />
              <img src="https://img.icons8.com/color/48/mastercard.png" className="h-6" alt="Mastercard" />
              <img src="https://img.icons8.com/color/48/amex.png" className="h-6" alt="Amex" />
              <img src="https://img.icons8.com/color/48/discover.png" className="h-6" alt="Discover" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="card_expiry" className="text-black font-medium">Expiration date</Label>
            <Input
              id="card_expiry"
              placeholder="MM / YY"
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: formatExpiry(e.target.value) })}
              className="text-black border-gray-200 focus:ring-[#E03A3E] focus:border-[#E03A3E]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvv" className="text-black font-medium">Security code</Label>
            <Input
              id="cvv"
              placeholder="CVC"
              maxLength={4}
              value={formData.cvv}
              onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, "") })}
              className="text-black border-gray-200 focus:ring-[#E03A3E] focus:border-[#E03A3E]"
            />
          </div>
        </div>

      </div>

      <div className="pt-4 space-y-3">
        <Button
          onClick={handlePayNow}
          disabled={loading}
          className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white py-6 text-lg font-bold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${orderTotal.toFixed(2)}`
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
          className="w-full text-gray-500 hover:text-black"
        >
          Cancel
        </Button>
      </div>

      <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" />
        Secure payment via Fat Zebra
      </p>
    </div>
  )
}
