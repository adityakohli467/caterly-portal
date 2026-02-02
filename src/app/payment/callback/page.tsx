"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { api } from "@/lib/api"
import { useCartStore } from "@/store/cart"
import { toast } from "sonner"

function PaymentCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { clearCart } = useCartStore()

    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing')
    const [message, setMessage] = useState('Processing your payment...')

    useEffect(() => {
        const processCallback = async () => {
            try {
                // Get all query parameters
                const params = new URLSearchParams(searchParams.toString())

                // Call backend to verify payment status
                const response = await api.get(`/store/payment/fatzebra/callback?${params.toString()}`)

                if (response.data?.success || response.data?.status === 'success') {
                    setStatus('success')
                    setMessage('Payment successful!')

                    // Clear cart on successful payment
                    clearCart()

                    // Get order ID from response or params
                    const orderId = response.data?.order_id || searchParams.get('order_id')

                    // Redirect to success page after a short delay
                    setTimeout(() => {
                        if (orderId) {
                            router.push(`/payment/success?order_id=${orderId}`)
                        } else {
                            router.push('/payment/success')
                        }
                    }, 2000)
                } else {
                    setStatus('failed')
                    setMessage(response.data?.message || 'Payment failed. Please try again.')

                    // Redirect to payment page after delay
                    setTimeout(() => {
                        const orderId = response.data?.order_id || searchParams.get('order_id')
                        if (orderId) {
                            router.push(`/payment?order_id=${orderId}`)
                        } else {
                            router.push('/checkout')
                        }
                    }, 3000)
                }
            } catch (error: any) {
                console.error('Payment callback error:', error)
                setStatus('failed')
                const errorMsg = error.response?.data?.message || error.message || 'Failed to verify payment'
                setMessage(errorMsg)
                toast.error(errorMsg)

                // Redirect to checkout after delay
                setTimeout(() => {
                    router.push('/checkout')
                }, 3000)
            }
        }

        processCallback()
    }, [searchParams, router, clearCart])

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center space-y-6 p-8">
                {status === 'processing' && (
                    <>
                        <Loader2 className="h-16 w-16 mx-auto animate-spin text-[#E03A3E]" />
                        <h2 className="text-2xl font-bold text-black">Processing Payment</h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
                        <h2 className="text-2xl font-bold text-black">Payment Successful!</h2>
                        <p className="text-gray-600">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting to confirmation page...</p>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <XCircle className="h-16 w-16 mx-auto text-red-500" />
                        <h2 className="text-2xl font-bold text-black">Payment Failed</h2>
                        <p className="text-gray-600">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting...</p>
                    </>
                )}
            </div>
        </div>
    )
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#E03A3E]" />
            </div>
        }>
            <PaymentCallbackContent />
        </Suspense>
    )
}
