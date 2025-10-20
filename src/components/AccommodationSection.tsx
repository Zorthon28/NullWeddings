"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MapPin, ExternalLink } from "lucide-react";
import { Ornament } from "./Ornament";
import { useAdmin } from "@/contexts/AdminContext";

interface Hotel {
  id: string;
  name: string;
  address: string;
  description: string;
  mapsUrl: string;
  bookingUrl: string;
  priceRange: string;
}

const hotels: Hotel[] = [
  {
    id: "hotel1",
    name: "Grand Plaza Hotel",
    address: "123 Main Street, Downtown",
    description:
      "Luxury hotel with stunning views, spa, and fine dining. Walking distance to venue.",
    mapsUrl: "https://maps.google.com/?q=Grand+Plaza+Hotel",
    bookingUrl: "https://booking.com/hotel/grand-plaza",
    priceRange: "$200-350/night",
  },
  {
    id: "hotel2",
    name: "Riverside Inn",
    address: "456 River Road, Riverside",
    description:
      "Charming boutique hotel with river views and personalized service.",
    mapsUrl: "https://maps.google.com/?q=Riverside+Inn",
    bookingUrl: "https://booking.com/hotel/riverside-inn",
    priceRange: "$150-250/night",
  },
  {
    id: "hotel3",
    name: "City Center Suites",
    address: "789 Center Ave, City Center",
    description:
      "Modern suites with full kitchens, perfect for longer stays. Close to public transport.",
    mapsUrl: "https://maps.google.com/?q=City+Center+Suites",
    bookingUrl: "https://booking.com/hotel/city-center-suites",
    priceRange: "$120-200/night",
  },
];

export default function AccommodationSection() {
  const { settings } = useAdmin();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const openMaps = (url: string) => {
    window.open(url, "_blank");
  };

  const openBooking = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Section Separator */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="h-px w-32 bg-gold/30"></div>
            <div className="mx-6 w-2 h-2 bg-gold rotate-45"></div>
            <div className="h-px w-32 bg-gold/30"></div>
          </div>
        </div>
      </div>

      <section
        ref={sectionRef}
        id="accommodation"
        className={`section-spacing bg-white transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  staggerChildren: shouldReduceMotion ? 0 : 0.2,
                },
              },
            }}
          >
            <Ornament className="mb-8" />
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4"
              variants={{
                hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              Accommodation
            </motion.h2>
            <motion.p
              className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto"
              variants={{
                hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {settings.accommodationMessage ||
                "We've partnered with these wonderful hotels near the venue. Book early to secure your stay for our special day."}
            </motion.p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={shouldReduceMotion ? "visible" : "hidden"}
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: shouldReduceMotion ? 0 : 0.6,
                        delay: shouldReduceMotion ? 0 : index * 0.1,
                      },
                    },
                  }}
                >
                  <Card className="bg-white border-2 border-gray-200 hover:border-gold transition-all duration-300 ease-in-out hover:shadow-2xl shadow-lg h-full">
                    <CardHeader className="text-center border-b border-gray-100 pb-6 p-6 md:p-8">
                      <div className="flex items-center justify-center mb-4">
                        <div className="h-px w-12 bg-gold"></div>
                        <div className="mx-3 w-2 h-2 bg-gold rotate-45"></div>
                        <div className="h-px w-12 bg-gold"></div>
                      </div>
                      <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        {hotel.name}
                      </CardTitle>
                      <p className="text-sm md:text-base text-gray-600 font-medium">
                        {hotel.priceRange}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5 p-6 md:p-8">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800 text-sm md:text-base">
                            {hotel.address}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm md:text-base text-gray-600">
                        {hotel.description}
                      </p>

                      <div className="space-y-3">
                        <button
                          onClick={() => openMaps(hotel.mapsUrl)}
                          className="elegant-button w-full text-sm md:text-base"
                        >
                          <MapPin className="w-4 h-4 mr-2 inline" />
                          View on Maps
                        </button>
                        <button
                          onClick={() => openBooking(hotel.bookingUrl)}
                          className="elegant-button w-full text-sm md:text-base bg-gold hover:bg-gold/80"
                        >
                          <ExternalLink className="w-4 h-4 mr-2 inline" />
                          Book Now
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
