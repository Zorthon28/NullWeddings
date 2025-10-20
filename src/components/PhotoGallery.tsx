"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useAdmin } from "@/contexts/AdminContext";

/**
 * PhotoGallery component displaying a carousel of wedding photos.
 * @returns JSX.Element
 */
export default function PhotoGallery() {
  const shouldReduceMotion = useReducedMotion();
  const { settings } = useAdmin();

  const weddingImages = settings.gallery_images || [];

  return (
    <section
      id="photo-gallery"
      className="py-16 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={shouldReduceMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Our Love Story
          </h2>
          <p className="text-lg text-gray-600">
            A glimpse into our beautiful moments together
          </p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 },
          }}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {weddingImages.map((src, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={src}
                      alt={`Wedding photo ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
