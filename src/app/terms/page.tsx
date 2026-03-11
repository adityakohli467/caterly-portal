"use client"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-6 border border-gray-300 p-10">

        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-2">
          Terms & Conditions
        </h1>

        {/* Subtitle */}
        <p className="text-center text-sm text-gray-700 mb-10">
          Catering Service Agreement – Caterly
        </p>

        {/* Content */}
        <div className="space-y-6 text-sm text-gray-800 leading-relaxed">

          <div>
            <h3 className="font-semibold">1. Orders and Confirmation</h3>
            <p>
              All catering orders must be placed through our website, email, or
              direct enquiry. Orders are considered confirmed only once Caterly
              has acknowledged the order and payment or deposit has been received
              where applicable.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">2. Minimum Notice</h3>
            <p>
              Orders should be placed at least 24 to 48 hours in advance depending
              on the catering package. Larger events may require additional notice
              to ensure availability and preparation.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">3. Payment Terms</h3>
            <p>
              Full payment or a deposit may be required to confirm an order.
              Payments can be made through the payment methods available on our
              website or as agreed during booking.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">4. Cancellation and Changes</h3>
            <p>
              Any cancellations or changes to an order must be made at least
              24 hours prior to the scheduled delivery or event time.
            </p>
            <p className="mt-1">
              Late cancellations may incur charges depending on preparation
              and costs already incurred.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">5. Delivery</h3>
            <p>
              Caterly aims to deliver orders at the requested time. While we
              strive for punctual delivery, delays may occur due to traffic or
              unforeseen circumstances.
            </p>
            <p className="mt-1">
              Delivery fees may apply depending on location.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">6. Dietary Requirements</h3>
            <p>
              We strive to accommodate dietary requirements where possible.
              Customers must inform us of any allergies or special dietary needs
              when placing an order.
            </p>
            <p className="mt-1">
              While care is taken during preparation, Caterly cannot guarantee
              that food is completely free from allergens.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">7. Staffing and Venue Hire</h3>
            <p>
              Where staff hire or venue hire services are provided, specific
              arrangements including timings, responsibilities, and additional
              charges will be agreed upon at the time of booking.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">8. Liability</h3>
            <p>
              Caterly will not be liable for any loss, damage, or injury
              resulting from the misuse or improper handling of food once it
              has been delivered or served.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">9. Pricing</h3>
            <p>
              All prices listed are subject to change without notice. Prices
              confirmed at the time of order will remain valid for that order.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">10. Acceptance of Terms</h3>
            <p>
              By placing an order with Caterly, customers acknowledge that they
              have read and agreed to these Terms and Conditions.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}