import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home } from "lucide-react"
import { CardPaymentForm } from "./CardPaymentForm"

interface OrderItem {
  product_name: string
  quantity: number
  price: number
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: number | null
  orderTotal: number
  customerName: string
  items: OrderItem[]
  onSuccess: () => void
}

export function PaymentModal({
  isOpen,
  onClose,
  orderId,
  orderTotal,
  customerName,
  items,
  onSuccess,
}: PaymentModalProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [localItems, setLocalItems] = useState<OrderItem[]>([])
  const router = useRouter()

  if (!orderId) return null

  const handlePaymentSuccess = () => {
    setLocalItems([...items]) // Capture items before they are cleared from the store
    setShowSuccess(true)
    onSuccess() // Clear cart etc. in parent
  }

  const handleGoHome = () => {
    onClose()
    router.push("/")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !showSuccess) onClose()
    }}>
      <DialogContent className="sm:max-w-[480px] bg-white border-none shadow-2xl p-0 overflow-hidden rounded-2xl">
        {!showSuccess ? (
          <>
            <div className="bg-[#E03A3E] p-6 text-white text-center">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center text-white">Secure Payment</DialogTitle>
                <DialogDescription className="text-white/80 text-center">
                  Please enter your card details to complete order #{orderId}
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-6">
              <CardPaymentForm
                orderId={orderId}
                orderTotal={orderTotal}
                customerName={customerName}
                onSuccess={handlePaymentSuccess}
                onCancel={onClose}
              />
            </div>
          </>
        ) : (
          <div className="p-8 text-center space-y-6 flex flex-col items-center max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">Order successfully placed</h2>
              <p className="text-sm text-gray-500">Thank you for your purchase!</p>
            </div>

            <div className="w-full bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
              <div className="flex justify-between text-xs border-b border-gray-200 pb-2 mb-2">
                <span className="text-gray-500 uppercase tracking-wider font-semibold">Order Details</span>
                <span className="font-bold text-gray-900">#{orderId}</span>
              </div>
              
              <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {localItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-left">
                    <div className="flex-1 pr-4">
                      <span className="font-medium text-gray-800">{item.product_name}</span>
                      <span className="text-gray-500 text-xs block">Qty: {item.quantity}</span>
                    </div>
                    <span className="text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-gray-900 font-bold">Total Amount</span>
                <span className="text-lg font-bold text-[#E03A3E]">${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleGoHome}
              className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white py-5 text-lg font-bold uppercase tracking-wide"
            >
              OK
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
