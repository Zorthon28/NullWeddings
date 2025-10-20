"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import PhotoGallery from "@/components/PhotoGallery";
import ItinerarySection from "@/components/ItinerarySection";
import GuestBook from "@/components/GuestBook";
import GiftRegistry from "@/components/GiftRegistry";
import AccommodationSection from "@/components/AccommodationSection";
import RSVPSection from "@/components/RSVPSection";
import ContactSection from "@/components/ContactSection";
import { useAdmin } from "@/contexts/AdminContext";

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-2 border-blue-500 opacity-20"></div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Preparing your special day...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We're getting everything ready for you
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { settings, isLoading } = useAdmin();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000); // Minimum delay of 1 second

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || isPageLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <div className="transition-all duration-500 ease-in-out">
        {settings.showPhotoGallery && (
          <div className="animate-fade-in">
            <PhotoGallery />
          </div>
        )}
        {settings.showItinerary && (
          <div className="animate-fade-in">
            <ItinerarySection />
          </div>
        )}
        {settings.showGuestBook && (
          <div className="animate-fade-in">
            <GuestBook />
          </div>
        )}
        {settings.showGiftRegistry && (
          <div className="animate-fade-in">
            <GiftRegistry />
          </div>
        )}
        {settings.showAccommodation && (
          <div className="animate-fade-in">
            <AccommodationSection />
          </div>
        )}
        {settings.showRSVP && (
          <div className="animate-fade-in">
            <RSVPSection />
          </div>
        )}
        {settings.showContact && (
          <div className="animate-fade-in">
            <ContactSection />
          </div>
        )}
      </div>
    </div>
  );
}
