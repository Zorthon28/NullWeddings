"use client";

import { useState, useEffect } from "react";
import { MapPin, Menu, X } from "lucide-react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center items-center gap-8">
          <button
            onClick={() => scrollToSection("hero")}
            className={`text-sm font-medium transition-all duration-300 ease-in-out hover:text-gold ${
              isScrolled ? "text-gray-800" : "text-white"
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => scrollToSection("itinerary")}
            className={`text-sm font-medium transition-all duration-300 ease-in-out hover:text-gold ${
              isScrolled ? "text-gray-800" : "text-white"
            }`}
          >
            Itinerario
          </button>
          <button
            onClick={() => scrollToSection("location")}
            className={`text-sm font-medium transition-all duration-300 ease-in-out hover:text-gold flex items-center gap-1 ${
              isScrolled ? "text-gray-800" : "text-white"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Ubicación
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center">
          <div
            className={`font-serif text-lg ${isScrolled ? "text-gray-800" : "text-white"}`}
          >
            K & G
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`transition-colors duration-300 ${
              isScrolled ? "text-gray-800" : "text-white"
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 animate-fade-in">
            <button
              onClick={() => scrollToSection("hero")}
              className="block w-full text-left py-3 px-4 text-gray-800 hover:bg-gold/10 hover:text-gold rounded transition-all duration-300 ease-in-out"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection("itinerary")}
              className="block w-full text-left py-3 px-4 text-gray-800 hover:bg-gold/10 hover:text-gold rounded transition-all duration-300 ease-in-out"
            >
              Itinerario
            </button>
            <button
              onClick={() => scrollToSection("location")}
              className="block w-full text-left py-3 px-4 text-gray-800 hover:bg-gold/10 hover:text-gold rounded transition-all duration-300 ease-in-out flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Ubicación
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
