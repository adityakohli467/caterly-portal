"use client"

import { useState, useEffect, useRef } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Lock, AlertCircle } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface CardPaymentFormProps {
  orderId: number
  orderTotal: number
  customerName: string
  onSuccess: () => void
  onCancel: () => void
}

function StripePaymentForm({ orderId, orderTotal, onSuccess, onCancel }: {
  orderId: number
  orderTotal: number
  onSuccess: () => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?order_id=${orderId}`,
        },
        redirect: "if_required",
      })

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please try again.")
        setLoading(false)
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        try {
          await api.post("/store/payment/verify", {
            payment_intent_id: paymentIntent.id,
            order_id: orderId,
          })
        } catch {
          // Webhook will handle it
        }
        toast.success("Payment successful!")
        onSuccess()
      } else {
        setErrorMessage("Payment requires additional action.")
        setLoading(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <PaymentElement options={{ layout: "tabs" }} />

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="pt-4 space-y-3">
        <Button
          type="submit"
          disabled={!stripe || !elements || loading}
          className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white py-6 text-lg font-bold disabled:opacity-50"
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
          type="button"
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
        Secure payment via Stripe
      </p>
    </form>
  )
}

export function CardPaymentForm({ orderId, orderTotal, customerName, onSuccess, onCancel }: CardPaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const paymentIntentIdRef = useRef<string | null>(null)
  const paymentSucceededRef = useRef(false)

  useEffect(() => {
    const initPayment = async () => {
      try {
        const res = await api.post("/store/payment/create-intent", {
          order_id: orderId,
          email: "",
        })
        if (res.data.success && res.data.client_secret) {
          setClientSecret(res.data.client_secret)
          paymentIntentIdRef.current = res.data.payment_intent_id || null
        } else {
          setError(res.data.message || "Failed to initialize payment")
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || "Failed to initialize payment"
        setError(typeof msg === 'string' ? msg : 'Payment initialization failed')
      } finally {
        setLoading(false)
      }
    }
    initPayment()

    // Cleanup: cancel the intent if component unmounts without successful payment
    return () => {
      if (paymentIntentIdRef.current && !paymentSucceededRef.current) {
        api.post("/store/payment/cancel-intent", {
          payment_intent_id: paymentIntentIdRef.current,
        }).catch(() => {
          // Non-critical cleanup
        })
      }
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#E03A3E] mb-3" />
        <p className="text-sm text-gray-500">Initializing secure payment...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="h-8 w-8 mx-auto text-red-400 mb-2" />
        <p className="text-red-600 text-sm">{error}</p>
        <Button variant="ghost" onClick={onCancel} className="mt-3">
          Cancel
        </Button>
      </div>
    )
  }

  if (!clientSecret) return null

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#E03A3E",
            borderRadius: "8px",
          },
        },
      }}
    >
      <StripePaymentForm
        orderId={orderId}
        orderTotal={orderTotal}
        onSuccess={() => {
          paymentSucceededRef.current = true
          onSuccess()
        }}
        onCancel={onCancel}
      />
    </Elements>
  )
}

