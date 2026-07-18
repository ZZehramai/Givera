
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

type ProgressBarProps = {
  value: number;
  label?: string;
  className?: string;
};

export function ProgressBar({ value, label, className = "" }: ProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`h-1.5 overflow-hidden rounded-full bg-[#e8e9e4] ${className}`}
      role="progressbar"
      aria-label={label ?? "Progress"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}>
      
      <motion.div
        className="h-full rounded-full bg-[#16734e]"
        initial={shouldReduceMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: clamped / 100 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        style={{ transformOrigin: "left" }} />
      
    </div>);

}