"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { Children } from "react";

/**
 * Infinite horizontal marquee. Duplicates its children so the scroll loops
 * seamlessly. On reduced-motion, falls back to static (no scroll).
 *
 * Usage:
 *   <Marquee gap={3} duration={30}>
 *     <span>Item A</span>
 *     <span>Item B</span>
 *     ...
 *   </Marquee>
 *
 * The gap prop is in rem units (e.g. 3 = gap-12). Duration in seconds.
 */
export function Marquee({
  children,
  duration = 30,
  className,
}: {
  children: ReactNode;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const items = Children.toArray(children);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {/* Soft edge fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent"
      />

      <motion.div
        className="flex w-max items-center gap-8 sm:gap-12"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {/* Duplicate the items twice so x:-50% lands at a seamless loop point */}
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex flex-shrink-0 items-center gap-8 sm:gap-12">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
