"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Lock, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"

interface FatZebraPaymentFormProps {
    orderId: number
    amount: number
    onSuccess: () => void
    onError: (error: string) => void
}

export function FatZebraPaymentForm({ orderId, amount, onSuccess, onError }: FatZebraPaymentFormProps) {
    const [loading, setLoading] = useState(false)

    const handlePayment = async () => {
        setLoading(true)

        try {
            console.log('Initiating payment for order:', orderId)

            // Call backend API with authentication to get Fat Zebra payment URL
            const response = await api.get(`/store/payment/${orderId}/fatzebra`)

            console.log('Response received:', response.data)

            // Extract payment URL from response
            // Backend should return JSON with payment_url field
            let paymentUrl = null

            if (response.data?.payment_url) {
                paymentUrl = response.data.payment_url
            } else if (response.data?.paymentUrl) {
                paymentUrl = response.data.paymentUrl
            } else if (response.data?.url) {
                paymentUrl = response.data.url
            } else if (typeof response.data === 'string' && response.data.startsWith('http')) {
                paymentUrl = response.data
            }

            if (paymentUrl) {
                console.log('Redirecting to Fat Zebra:', paymentUrl)
                // Redirect to Fat Zebra payment page
                window.location.href = paymentUrl
            } else {
                console.error('Payment URL not found in response:', response.data)
                throw new Error("Payment URL not received from server")
            }
        } catch (error: any) {
            setLoading(false)
            console.error('Payment error:', error)
            console.error('Error response:', error.response)

            // Handle specific error messages
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.")
                // Optionally redirect to login
                setTimeout(() => {
                    window.location.href = '/auth/login?redirect=/payment'
                }, 2000)
            } else {
                const errorMsg = error.response?.data?.message || error.message || "Failed to initiate payment"
                toast.error(errorMsg)
            }
            onError(error.response?.data?.message || error.message || "Failed to initiate payment")
        }
    }

    return (
        <div className="space-y-6">
            {/* Payment Information */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                    <CreditCard className="h-5 w-5 text-[#E03A3E]" />
                    <div>
                        <h3 className="font-semibold text-black">Secure Payment</h3>
                        <p className="text-sm text-gray-600">You will be redirected to Fat Zebra's secure payment page</p>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Amount to Pay:</span>
                        <span className="text-2xl font-bold text-[#E03A3E]">${amount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> After clicking "Proceed to Payment", you'll be redirected to Fat Zebra's secure payment page to complete your transaction.
                    </p>
                </div>
            </div>

            {/* Payment Button */}
            <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full !bg-[#E03A3E] !hover:bg-[#cc3236] text-white"
                size="lg"
                style={{ fontFamily: 'Albert Sans', fontWeight: 600 }}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirecting to Payment...
                    </>
                ) : (
                    <>
                        <Lock className="w-4 h-4 mr-2" />
                        Proceed to Payment
                    </>
                )}
            </Button>

            {/* Security Notice */}
            <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Your payment is secured by Fat Zebra's encrypted payment gateway
            </p>
        </div>
    )
}
