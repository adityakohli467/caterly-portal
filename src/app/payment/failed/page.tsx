"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { XCircle } from "lucide-react"

function PaymentFailedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("order_id")
  const ref = searchParams.get("ref")
  const reason = searchParams.get("reason")

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-16 text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-6">
            We were unable to process your payment. Please try again or use a different payment method.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Order ID: #{orderId}
            </p>
          )}
          {(ref || reason) && (
             <div className="bg-gray-100 p-4 rounded text-xs text-left mb-6 overflow-auto">
               <p className="font-mono text-gray-500">Debug Info:</p>
               {ref && <p className="font-mono">Ref: {ref}</p>}
               {reason && <p className="font-mono">Reason: {reason}</p>}
             </div>
          )}
          <p className="text-sm text-gray-500 mb-8">
            If this problem persists, please contact support.
          </p>
          <div className="flex gap-4 justify-center">
            {orderId && (
              <Button 
                onClick={() => router.push(`/payment?order_id=${orderId}`)}
                className="bg-[#E03A3E] hover:bg-[#cc3236] text-white"
              >
                Try Again
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/contact")}>
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => router.push("/shop")}>
              Return to Shop
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  )
}
