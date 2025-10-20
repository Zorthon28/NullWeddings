/**
 * TypeScript interfaces and types for the HeroSection component.
 */

/** Time left object structure */
export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Props for the HeroSection component */
export interface HeroSectionProps {
  // No props currently, but interface defined for future extensibility
}

/** Props for the Ornament component */
export interface OrnamentProps {
  className?: string;
}

/** Props for the ScrollIndicator component */
export interface ScrollIndicatorProps {
  onClick: () => void;
  shouldReduceMotion: boolean;
}

/** Props for the CountdownTimer component */
export interface CountdownTimerProps {
  timeLeft: TimeLeft;
  shouldReduceMotion: boolean;
}
