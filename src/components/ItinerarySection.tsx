"use client";

import { useEffect, useRef, useState } from "react";
import EventCard from "./EventCard";
import { useAdmin } from "@/contexts/AdminContext";

export default function ItinerarySection() {
  const { settings } = useAdmin();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  const events = [
    {
      title: "Ceremonia Civil",
      date: "Viernes, 21 de Noviembre 2025",
      time: "01:00 PM",
      location: "Otay delegation Centenario",
      address:
        "Instituto Politécnico Nacional, Mesa de Otay, 22430 Tijuana, B.C.",
      description: "Acompáñanos en este momento especial",
      mapsUrl: "https://maps.app.goo.gl/i1DVMHvJBYmWYq5u7",
      transportation: ["Car", "Taxi", "Public Transport"],
      parking: "Free parking available on-site",
    },
    {
      title: "Cena de Celebración",
      date: "Viernes, 21 de Noviembre 2025",
      time: "07:00 PM",
      location: "Moma Sushi + Pizza Landmark",
      address: "Blvd. Agua Caliente 10223, Calete, 22044 Tijuana, B.C.",
      description: "Celebremos juntos con una velada inolvidable",
      mapsUrl: "https://maps.app.goo.gl/xJxUWXEgdnEnkEES7",
      transportation: ["Car", "Taxi", "Uber/Lyft"],
      parking: "Valet parking available for $10",
    },
  ];

  return (
    <>
      {/* Section Separator */}
      <div className="bg-ivory py-12">
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
        id="itinerary"
        className={`section-spacing bg-ivory transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="h-px w-20 bg-gold"></div>
              <div className="mx-4 w-3 h-3 border-2 border-gold rotate-45"></div>
              <div className="h-px w-20 bg-gold"></div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
              Itinerario
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              {settings.itineraryMessage ||
                "Únete a nosotros en estos momentos especiales que hemos preparado con todo nuestro amor"}
            </p>
          </div>

          {/* Event Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {events.map((event, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <EventCard {...event} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
