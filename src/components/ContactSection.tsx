"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icons } from "./ui/icons";
import { Ornament } from "./Ornament";
import { useAdmin } from "../contexts/AdminContext";

/**
 * ContactSection component displaying contact information and social sharing links.
 * @returns JSX.Element
 */
export default function ContactSection() {
  const shouldReduceMotion = useReducedMotion();
  const { settings } = useAdmin();

  return (
    <section
      id="contact"
      className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-12"
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
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            variants={{
              hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            Contact Information
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600"
            variants={{
              hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            For inquiries or more details about our special day
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 text-center"
          initial={shouldReduceMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: shouldReduceMotion ? 0 : 0.6 },
            },
          }}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Phone
              </h3>
              <p className="text-gray-600">
                {settings.contactPhone || "(555) 123-4567"}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Email
              </h3>
              <p className="text-gray-600">
                {settings.contactEmail || "info@wedding.com"}
              </p>
            </div>
          </div>

          {/* Social Sharing Icons */}
          <motion.div
            className="flex justify-center space-x-6 mt-8"
            variants={{
              hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
              visible: { opacity: 1, y: 0 },
            }}
            role="group"
            aria-label="Share on social media"
          >
            <a
              href="https://www.instagram.com/share?url=https://wedding.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-white rounded"
              aria-label="Share on Instagram"
            >
              <Icons.instagram className="w-8 h-8" />
            </a>
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https://wedding.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-white rounded"
              aria-label="Share on Facebook"
            >
              <Icons.facebook className="w-8 h-8" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
