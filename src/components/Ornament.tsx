import React from "react";
import { motion } from "framer-motion";
import { OrnamentProps } from "../types/heroTypes";

/**
 * Ornament component for decorative elements in the hero section.
 * @param className - Optional CSS classes for styling
 */
export const Ornament: React.FC<OrnamentProps> = ({ className = "" }) => {
  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      aria-hidden="true"
    >
      <div className="h-px w-12 md:w-16 bg-gold"></div>
      <div className="mx-3 md:mx-4 w-3 h-3 border-2 border-gold rotate-45"></div>
      <div className="h-px w-12 md:w-16 bg-gold"></div>
    </motion.div>
  );
};
