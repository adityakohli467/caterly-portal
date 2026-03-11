"use client"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-6 border border-gray-300 p-10">

        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-2">
          Refund Policy
        </h1>

        {/* Subtitle */}
        <p className="text-center text-sm text-gray-700 mb-10">
          Caterly – Catering Services <br />
          Last updated: March 2025
        </p>

        {/* Content */}
        <div className="space-y-6 text-sm text-gray-800 leading-relaxed">

          <div>
            <h3 className="font-semibold">1. Order Cancellations</h3>
            <p>
              Customers may cancel their order by providing notice at least
              24 hours before the scheduled delivery or event time.
              Orders cancelled within this timeframe may be eligible
              for a full refund or credit.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">2. Late Cancellations</h3>
            <p>
              Cancellations made less than 24 hours before the delivery
              or event time may not be eligible for a refund, as food
              preparation and operational costs may have already been incurred.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">3. Changes to Orders</h3>
            <p>
              Customers may request changes to their order before the
              preparation process begins. Caterly will do its best to
              accommodate changes depending on availability and notice provided.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">4. Refund Eligibility</h3>
            <p>
              Refunds may be issued if:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>An order is cancelled within the permitted timeframe</li>
              <li>Caterly is unable to fulfil the order</li>
              <li>There is a verified issue with the order upon delivery</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">5. Non Refundable Situations</h3>
            <p>
              Refunds will not be provided for:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Late cancellations</li>
              <li>Incorrect order details provided by the customer</li>
              <li>Change of mind after food has been prepared or delivered</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">6. Processing of Refunds</h3>
            <p>
              Approved refunds will be processed using the original
              payment method. Processing times may vary depending on
              the payment provider.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Contact Us</h3>
            <p>
              If you have any questions regarding refunds or cancellations,
              please contact our team and we will be happy to assist.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}