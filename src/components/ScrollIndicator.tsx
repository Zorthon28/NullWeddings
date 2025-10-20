import React from "react";
import { motion } from "framer-motion";
import { ScrollIndicatorProps } from "../types/heroTypes";

/**
 * ScrollIndicator component for navigating to the next section.
 * @param onClick - Function to handle click events
 * @param shouldReduceMotion - Whether to reduce motion for accessibility
 */
export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  onClick,
  shouldReduceMotion,
}) => {
  return (
    <motion.div
      className="mt-8 flex justify-center cursor-pointer"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="Desplazarse a la siguiente sección"
    >
      <div className={shouldReduceMotion ? "" : "animate-bounce"}>
        <div className="w-6 h-10 border-2 border-gold rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-gold rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );
};
