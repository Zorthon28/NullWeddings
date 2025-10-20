import React from "react";
import { motion } from "framer-motion";
import { CountdownTimerProps } from "../types/heroTypes";
import { COUNTDOWN_LABEL } from "../constants/heroConstants";

/**
 * CountdownTimer component displaying the time left until the wedding.
 * @param timeLeft - Object containing days, hours, minutes, and seconds
 * @param shouldReduceMotion - Whether to reduce motion for accessibility
 */
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  timeLeft,
  shouldReduceMotion,
}) => {
  return (
    <motion.div
      className="text-white/90 text-center mb-6"
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
        visible: { opacity: 1, y: 0 },
      }}
      role="timer"
      aria-live="polite"
      aria-label={`Cuenta regresiva: ${timeLeft.days} días, ${timeLeft.hours} horas, ${timeLeft.minutes} minutos, ${timeLeft.seconds} segundos`}
    >
      <p className="text-lg md:text-xl lg:text-2xl font-light mb-4">
        {COUNTDOWN_LABEL}
      </p>
      <div className="flex justify-center space-x-4 md:space-x-8">
        <div className="text-center">
          <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-gold">
            {timeLeft.days}
          </div>
          <div className="text-xs md:text-sm text-white/70">Días</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-gold">
            {timeLeft.hours}
          </div>
          <div className="text-xs md:text-sm text-white/70">Horas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-gold">
            {timeLeft.minutes}
          </div>
          <div className="text-xs md:text-sm text-white/70">Minutos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-gold">
            {timeLeft.seconds}
          </div>
          <div className="text-xs md:text-sm text-white/70">Segundos</div>
        </div>
      </div>
    </motion.div>
  );
};
