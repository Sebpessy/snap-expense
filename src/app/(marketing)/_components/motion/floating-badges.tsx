"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

type Badge = {
  label: string;
  value: string;
  position: string; // tailwind position classes
  delay: number;
  bobDuration: number;
};

const BADGES: Badge[] = [
  {
    label: "Vendor",
    value: "Office Supply Co",
    position: "top-[8%] left-[2%] lg:left-[6%]",
    delay: 1.3,
    bobDuration: 3.4,
  },
  {
    label: "Total",
    value: "$184.20",
    position: "top-[20%] right-[2%] lg:right-[-2%]",
    delay: 1.6,
    bobDuration: 4.1,
  },
  {
    label: "Date",
    value: "Nov 19",
    position: "bottom-[28%] left-[1%] lg:left-[2%]",
    delay: 1.9,
    bobDuration: 3.8,
  },
  {
    label: "Card",
    value: "VISA ••••1009",
    position: "bottom-[10%] right-[4%] lg:right-[6%]",
    delay: 2.2,
    bobDuration: 4.3,
  },
];

/**
 * Floating "AI extracted X" confirmation badges around the hero photo.
 * Each enters with a spring scale-in, then gently bobs forever.
 * Hidden on small screens to keep mobile clean — the photo speaks for itself there.
 */
export function FloatingBadges() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden sm:block"
    >
      {BADGES.map((b) => (
        <motion.div
          key={b.label}
          className={`absolute inline-flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 shadow-2xl shadow-blue-950/30 ring-1 ring-black/5 backdrop-blur ${b.position}`}
          initial={{ opacity: 0, scale: 0.4, y: 24 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: reduce ? 0 : [0, -8, 0, 4, 0],
          }}
          transition={{
            opacity: { duration: 0.4, delay: b.delay },
            scale: {
              type: "spring",
              stiffness: 220,
              damping: 14,
              delay: b.delay,
            },
            y: reduce
              ? { duration: 0.3, delay: b.delay }
              : {
                  duration: b.bobDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: b.delay + 0.5,
                },
          }}
        >
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
            <Check size={11} strokeWidth={3} />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {b.label}
          </span>
          <span className="text-xs font-bold text-gray-900 sm:text-sm">
            {b.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
