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
          Event Booking Agreement – Tarator Café <br />
          75 Dorcas Street, South Melbourne
        </p>

        {/* Content */}
        <div className="space-y-6 text-sm text-gray-800 leading-relaxed">

          <div>
            <h3 className="font-semibold">1. Securing Your Booking</h3>
            <p>
              A non-refundable $2,500 deposit is required to confirm your event date.
              This amount will be credited toward your final bill.
            </p>
            <p className="mt-1">
              Payment may be made via direct debit or cash. Credit card payments incur
              a 1% processing fee.
            </p>
            <p className="mt-1">
              In the event of cancellation, the deposit is non-refundable unless
              otherwise agreed in writing.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">2. Final Payment</h3>
            <p>
              Full payment of the estimated event balance is due seven (7) days prior
              to your event date. Failure to make payment on time may result in
              cancellation of your booking.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">3. Event Details</h3>
            <p>
              Final guest count, menu selections, timeline, and setup details must be
              submitted no later than ten (10) days before your event.
            </p>
            <p className="mt-1">
              All confirmed guest numbers will be included in food and beverage
              estimates.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">4. Event Duration & Timing</h3>
            <p>
              Venue hire allows for 4.5 hours from 5:00PM onward.
            </p>
            <p className="mt-1">
              Early starts or extended durations incur a $300 per additional hour.
            </p>
            <p className="mt-1">
              Bar service concludes at 12:00AM, with alcohol service ending at
              11:55PM per licensing regulations.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">5. Public Holiday Surcharge</h3>
            <p>
              Bookings on public holidays will incur a 15% surcharge.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">6. Responsible Service</h3>
            <p>
              Tarator Café reserves the right to refuse service to guests who appear
              intoxicated or disorderly.
            </p>
            <p className="mt-1">
              Our team or third-party security may remove guests for safety reasons.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">7. Food & Beverage</h3>
            <p>
              Tarator Café is the exclusive provider of all catering.
            </p>
            <p className="mt-1">
              Celebration cakes are permitted with prior approval. A $2 per person
              cakeage fee applies.
            </p>
            <p className="mt-1">
              No leftover food or drink may be removed from the premises in accordance
              with health regulations.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">8. Setup & Pack-down</h3>
            <p>
              Access to the venue for setup may be arranged in consultation with our
              Events Manager.
            </p>
            <p className="mt-1">
              A 45-minute bump-out period is granted following your event.
            </p>
            <p className="mt-1">
              Exceeding this time incurs a $500 per hour surcharge.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">9. Guest Conduct & Damages</h3>
            <p>
              Clients are responsible for guest behavior and any damages or missing
              items.
            </p>
            <p className="mt-1">
              A $450 breakages deposit is required and may be used toward necessary
              repairs or replacements.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">10. Decor Guidelines</h3>
            <p>
              No nails, tacks, or adhesive tape may be used.
            </p>
            <p className="mt-1">
              Candles must be enclosed in jars.
            </p>
            <p className="mt-1">
              A cleanup or damage fee will apply for non-compliance.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">11. Entertainment</h3>
            <p>
              All entertainment must be approved in advance.
            </p>
            <p className="mt-1">
              Noise levels must be maintained at respectful background levels.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">12. Venue Capacity</h3>
            <p>
              The maximum number of guests permitted on-site is 150, in accordance
              with fire safety and licensing regulations.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">13. Liability</h3>
            <p>
              Tarator Café is not responsible for loss, damage, or theft of personal
              items left before, during, or after your event.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">14. Smoke-Free Policy</h3>
            <p>
              Tarator Café maintains a strictly smoke-free environment.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">15. COVID-19 Contingencies</h3>
            <p>
              Should your event be cancelled due to Stage 4 or higher COVID
              restrictions, clients may reschedule or opt for a refund minus 15%
              to cover out-of-pocket expenses.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">16. Sweet Table Restrictions</h3>
            <p>
              If offering a lolly or sweet table, only individually wrapped items
              may be served.
            </p>
            <p className="mt-1">
              Chewing gum is not permitted.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Contact & Confirmation</h3>
            <p>
              To confirm your booking, submit this signed agreement and deposit to
              Tarator Café.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
