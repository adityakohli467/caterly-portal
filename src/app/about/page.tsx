"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function AboutPage() {
  const roastingSteps = [
    {
      title: "Sourcing & Green-bean Inspection",
      description: "We start with carefully selected lots — single origins and trusted microlots. Each shipment is inspected for uniformity, moisture, and cup potential before we ever roast a batch."
    },
    {
      title: "Roasting Process",
      description: "Our roasters carefully monitor temperature curves and development time to bring out the best characteristics of each bean origin."
    },
    {
      title: "Quality Control",
      description: "Every batch is cupped and evaluated to ensure consistency and quality before packaging."
    }
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] sm:h-[700px] bg-black">
        <div className="absolute inset-0">
          <Image
            src="/assets/sndurex/Wireframe - 37.png"
            alt="The CaterlyStory"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
        <div className="relative container mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <p className="text-lg sm:text-xl mb-3 font-light italic" style={{ color: '#C4A484' }}>People. Passion. Purpose.</p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6">
              The CaterlyStory
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Crafted with passion, enjoyed in sip. Taste the difference.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-[#2952E6] hover:bg-[#1e3fb3] text-white px-8 py-6 text-lg">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              At CaterlyCoffee, everything starts with <span className="font-semibold italic" style={{ color: '#C4A484' }}>passion</span> — for people, for craft, and for the perfect cup. With decades of experience and a love for coffee's rich heritage, we bring together growers, baristas, and café owners to create something truly special.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Rooted in integrity and creativity, we build lasting partnerships and a community that shares our love for great coffee. Inspired by St. Dreux, the patron saint of coffeehouses, we carry forward his spirit of devotion and purpose — one cup at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Our Roasting Process Section */}
      <section className="py-20 bg-[#2952E6]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden order-2 lg:order-1">
              <Image
                src="/assets/sndurex/Image (26).png"
                alt="Sourcing & Green-bean Inspection"
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="text-white order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm mb-2 text-white/80 italic">Our Roasting Process</p>
              <h2 className="text-4xl font-bold mb-6">
                Sourcing & Green-bean Inspection
              </h2>
              <p className="text-white/90 mb-8 leading-relaxed">
                We start with carefully selected lots — single origins and trusted microlots. Each shipment is inspected for uniformity, moisture, and cup potential before we ever roast a batch.
              </p>

              <div className="flex gap-3">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full bg-white text-[#2952E6] hover:bg-white/90 border-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full bg-white text-[#2952E6] hover:bg-white/90 border-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values/Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              Rooted in integrity and creativity
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              We build lasting partnerships and a community that shares our love for great coffee. Inspired by St. Dreux, the patron saint of coffee-holics, we carry forward his spirit of devotion and purpose — one cup at a time.
            </p>
            <Link href="/wholesale">
              <Button size="lg" className="bg-[#2952E6] hover:bg-[#1e3fb3] text-white px-8">
                Partner With Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

