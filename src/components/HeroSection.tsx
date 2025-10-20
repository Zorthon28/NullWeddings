"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Icons } from "./ui/icons";
import { Button } from "./ui/button";
import { Ornament } from "./Ornament";
import { ScrollIndicator } from "./ScrollIndicator";
import { CountdownTimer } from "./CountdownTimer";
import { HeroSectionProps, TimeLeft } from "../types/heroTypes";
import { useAdmin } from "../contexts/AdminContext";
import {
  WEDDING_DATE,
  BACKGROUND_IMAGES,
  RSVP_BUTTON_TEXT,
  INSTAGRAM_SHARE_URL,
  FACEBOOK_SHARE_URL,
  IMAGE_CHANGE_INTERVAL,
  TIMER_INTERVAL,
} from "../constants/heroConstants";

/**
 * HeroSection component displaying the main wedding hero with countdown and navigation.
 * @param props - Component props (currently none, but interface defined for future extensibility)
 * @returns JSX.Element
 */
export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const { settings } = useAdmin();

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    const now = new Date().getTime();
    const distance = WEDDING_DATE - now;

    if (distance > 0) {
      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  });

  return (
    <section
      id="hero"
      className="relative h-screen flex items-center justify-center overflow-hidden"
      style={
        !settings.showBackgroundImage
          ? {
              background:
                "linear-gradient(135deg, hsl(220, 13%, 18%) 0%, hsl(220, 13%, 12%) 100%)",
            }
          : undefined
      }
    >
      {/* Background Image with Next.js Image */}
      {settings.showBackgroundImage && (
        <Image
          src={settings.selected_background}
          alt="Wedding background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}

      {/* Overlay for better text readability - only when background image is shown */}
      {settings.showBackgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      )}

      {/* Decorative elements - hidden on mobile */}
      <div
        className="absolute inset-0 opacity-10 hidden md:block"
        aria-hidden="true"
      >
        <div
          className={`absolute top-20 left-20 w-32 h-32 border-2 border-gold rounded-full ${
            shouldReduceMotion ? "" : "animate-pulse"
          }`}
        ></div>
        <div
          className={`absolute bottom-20 right-20 w-40 h-40 border-2 border-gold rounded-full ${
            shouldReduceMotion ? "" : "animate-pulse"
          }`}
          style={{ animationDelay: shouldReduceMotion ? "0s" : "1s" }}
        ></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 border border-gold rotate-45"></div>
        <div className="absolute top-1/3 right-10 w-20 h-20 border border-gold rotate-12"></div>
      </div>

      {/* Golden ornamental dividers */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-gold to-transparent"
        aria-hidden="true"
      ></div>
      <div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-32 bg-gradient-to-t from-transparent via-gold to-transparent"
        aria-hidden="true"
      ></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Top ornament */}
        <Ornament className="mb-8" />

        {/* Names */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-wide">
          {settings.names}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gold font-light tracking-widest mb-8">
          {settings.subtitle}
        </p>

        {/* Countdown Timer */}
        {settings.showCountdown && (
          <CountdownTimer
            timeLeft={timeLeft}
            shouldReduceMotion={!!shouldReduceMotion}
          />
        )}

        {/* Date */}
        <div className="text-white/90 text-base md:text-lg lg:text-xl font-light mb-6">
          <p className="mb-2">{settings.weddingDate}</p>
          <p className="text-xs md:text-sm lg:text-base text-white/70">
            {settings.invitationText}
          </p>
        </div>

        {/* RSVP Button */}
        {settings.showRSVP && (
          <div className="mb-6">
            <Button
              className="bg-gold hover:bg-gold/80 text-black font-semibold px-8 py-3 rounded-full text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black"
              onClick={() => {
                // Scroll to RSVP section or open form
                const rsvpSection = document.getElementById("rsvp");
                if (rsvpSection) {
                  rsvpSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const rsvpSection = document.getElementById("rsvp");
                  if (rsvpSection) {
                    rsvpSection.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }}
              aria-label="Ir a la sección de RSVP"
            >
              {RSVP_BUTTON_TEXT}
            </Button>
          </div>
        )}

        {/* Social Sharing Icons */}
        <div className="flex justify-center space-x-6 mb-8">
          <a
            href={INSTAGRAM_SHARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black rounded"
            aria-label="Compartir en Instagram"
          >
            <Icons.instagram className="w-8 h-8" />
          </a>
          <a
            href={FACEBOOK_SHARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black rounded"
            aria-label="Compartir en Facebook"
          >
            <Icons.facebook className="w-8 h-8" />
          </a>
        </div>

        {/* Bottom ornament */}
        <Ornament className="mt-8" />

        {/* Scroll indicator */}
        <ScrollIndicator
          onClick={() => {
            const nextSection = document.getElementById("itinerary");
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
          shouldReduceMotion={!!shouldReduceMotion}
        />
      </div>
    </section>
  );
}
