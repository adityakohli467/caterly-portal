"use client"

export default function FoodSafetyPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-6 border border-gray-300 p-10">

        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-2">
          Food Safety & Allergen Disclaimer
        </h1>

        {/* Subtitle */}
        <p className="text-center text-sm text-gray-700 mb-10">
          Caterly – Catering Services<br />
          Last updated: March 2025
        </p>

        {/* Content */}
        <div className="space-y-6 text-sm text-gray-800 leading-relaxed">

          <div>
            <h3 className="font-semibold">1. Food Preparation</h3>
            <p>
              At Caterly, we take food safety seriously and follow strict hygiene
              and food handling standards during preparation, storage, and
              delivery to ensure the quality and safety of our food.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">2. Allergen Information</h3>
            <p>
              Our food may contain or come into contact with common allergens
              including nuts, dairy, gluten, eggs, soy, seafood, and other
              ingredients.
            </p>
            <p className="mt-1">
              While we take reasonable precautions to minimise cross
              contamination, we cannot guarantee that any item is completely
              free from allergens.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">3. Customer Responsibility</h3>
            <p>
              Customers with food allergies or specific dietary requirements
              must inform us at the time of placing the order. We will do our
              best to accommodate requests where possible.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">4. Cross Contamination</h3>
            <p>
              Our kitchen handles a variety of ingredients and allergens.
              Despite careful preparation procedures, cross contamination
              may occur.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">5. Food Storage and Consumption</h3>
            <p>
              Once food has been delivered, it is the customer's responsibility
              to ensure that food is stored, handled, and consumed
              appropriately.
            </p>
            <p className="mt-1">
              Caterly is not responsible for any issues arising from improper
              storage or handling after delivery.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">6. Limitation of Liability</h3>
            <p>
              Caterly shall not be held liable for allergic reactions or
              health issues resulting from the consumption of food where
              allergen information has not been disclosed at the time
              of ordering.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}