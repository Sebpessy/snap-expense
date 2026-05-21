"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Animated mesh-gradient background — three organic blurred color blobs that
 * slowly drift over the hero. Pure CSS gradients + framer transforms. Skipped
 * (still rendered, just static) on prefers-reduced-motion.
 */
export function Aurora({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const drift = (a: number, b: number) =>
    reduce ? { x: 0, y: 0 } : { x: [0, a, 0], y: [0, b, 0] };

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {/* Purple blob — drifts up-right */}
      <motion.div
        className="absolute h-[70vh] w-[70vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(106,59,200,0.55), transparent 70%)",
          left: "-15%",
          top: "5%",
          filter: "blur(70px)",
        }}
        animate={drift(80, 40)}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Teal blob — drifts diagonal */}
      <motion.div
        className="absolute h-[60vh] w-[60vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(40,212,225,0.45), transparent 70%)",
          right: "-10%",
          top: "20%",
          filter: "blur(70px)",
        }}
        animate={drift(-70, 60)}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Amber blob — drifts side-to-side at the bottom */}
      <motion.div
        className="absolute h-[50vh] w-[50vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.32), transparent 70%)",
          left: "25%",
          bottom: "-15%",
          filter: "blur(80px)",
        }}
        animate={
          reduce ? { x: 0, y: 0 } : { x: [0, 60, -40, 0], y: [0, -30, 0] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
