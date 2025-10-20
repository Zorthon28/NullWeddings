"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Icons } from "./ui/icons";
import { Ornament } from "./Ornament";
import { useAdmin } from "@/contexts/AdminContext";

interface Registry {
  id: string;
  name: string;
  url: string;
  icon: keyof typeof Icons;
  description: string;
}

const registries: Registry[] = [
  {
    id: "amazon",
    name: "Amazon",
    url: "https://www.amazon.com/wedding/registry/example",
    icon: "amazon",
    description: "Find everything from kitchen essentials to home decor",
  },
  {
    id: "zola",
    name: "Zola",
    url: "https://www.zola.com/registry/example",
    icon: "zola",
    description: "Curated wedding registry with unique gifts",
  },
];

export default function GiftRegistry() {
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
        id="gift-registry"
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
              Gift Registry
            </motion.h2>
            <motion.p
              className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto"
              variants={{
                hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {settings.giftRegistryMessage ||
                "Your presence is our greatest gift, but if you'd like to give something special, we've created registries at these wonderful stores"}
            </motion.p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {registries.map((registry, index) => {
                const IconComponent = Icons[registry.icon];
                return (
                  <motion.div
                    key={registry.id}
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
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                          <IconComponent className="w-12 h-12 text-gold" />
                        </div>
                        <CardTitle className="text-2xl text-gray-800">
                          {registry.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-gray-600 mb-6">
                          {registry.description}
                        </p>
                        <a
                          href={registry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-gold hover:bg-gold/80 text-black font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-white"
                        >
                          View Registry
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
