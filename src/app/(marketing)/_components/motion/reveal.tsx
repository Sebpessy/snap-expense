"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Section-level reveal wrapper. Fades + slides up its children when they
 * scroll into view. Triggers once per page load. Honors prefers-reduced-motion
 * automatically — falls back to a plain opacity transition.
 *
 * Usage:
 *   <Reveal>
 *     <Hero />
 *   </Reveal>
 *
 *   <Reveal y={12} delay={0.1}>...</Reveal>
 */
export function Reveal({
  children,
  delay = 0,
  y = 48,
  duration = 0.75,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : y,
      scale: reduce ? 1 : 0.97,
      filter: reduce ? "none" : "blur(6px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: reduce ? 0.2 : duration,
        delay,
        ease: [0.22, 0.61, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
