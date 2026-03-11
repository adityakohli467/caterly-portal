"use client"

export default function DeliveryPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-6 border border-gray-300 p-10">

        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-2">
          Delivery Policy
        </h1>

        {/* Subtitle */}
        <p className="text-center text-sm text-gray-700 mb-10">
          Caterly – Catering Services<br />
          Last updated: March 2025
        </p>

        {/* Content */}
        <div className="space-y-6 text-sm text-gray-800 leading-relaxed">

          <div>
            <h3 className="font-semibold">1. Delivery Area</h3>
            <p>
              Caterly currently provides delivery services within Victoria
              metropolitan areas only. Deliveries outside the metropolitan
              area may not be available or may require special arrangements.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">2. Delivery Timeframes</h3>
            <p>
              We aim to deliver orders at the requested time to ensure food
              arrives fresh and ready to serve.
            </p>
            <p className="mt-1">
              Customers are encouraged to place orders at least 24 to 48 hours
              in advance to allow sufficient preparation time.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">3. Delivery Fees</h3>
            <p>
              Delivery fees may apply depending on the delivery location
              within the Victoria metro area. The applicable delivery fee
              will be confirmed at the time of order.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">4. Delivery Responsibility</h3>
            <p>
              Customers must ensure that someone is available at the delivery
              location to receive the order at the scheduled time. Caterly is
              not responsible for delays or issues if the delivery location
              is unattended.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">5. Delivery Delays</h3>
            <p>
              While we make every effort to deliver orders on time, delays may
              occasionally occur due to traffic, weather conditions, or other
              unforeseen circumstances.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">6. Incorrect Delivery Details</h3>
            <p>
              Customers are responsible for providing accurate delivery
              information including address, contact details, and delivery
              instructions. Caterly is not responsible for delivery issues
              caused by incorrect information.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">7. Food Handling After Delivery</h3>
            <p>
              Once the order has been delivered, it is the customer’s
              responsibility to ensure that the food is stored and handled
              appropriately.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Contact</h3>
            <p>
              If you have any questions regarding delivery or require special
              delivery arrangements within Victoria, please contact the
              Caterly team.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}