"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

type Badge = {
  label: string;
  value: string;
  /** position class — uses sm: prefixes for desktop variants */
  position: string;
  delay: number;
  bobDuration: number;
};

const BADGES: Badge[] = [
  {
    label: "Vendor",
    value: "Office Supply Co",
    position: "top-[6%] left-[3%] sm:top-[8%] sm:left-[6%]",
    delay: 1.3,
    bobDuration: 3.4,
  },
  {
    label: "Total",
    value: "$184.20",
    position: "top-[18%] right-[3%] sm:top-[20%] sm:right-[2%]",
    delay: 1.6,
    bobDuration: 4.1,
  },
  {
    label: "Date",
    value: "Nov 19",
    position: "bottom-[34%] left-[3%] sm:bottom-[28%] sm:left-[2%]",
    delay: 1.9,
    bobDuration: 3.8,
  },
  {
    label: "Card",
    value: "VISA ••••1009",
    position: "bottom-[8%] right-[3%] sm:bottom-[10%] sm:right-[6%]",
    delay: 2.2,
    bobDuration: 4.3,
  },
];

/**
 * Floating "AI extracted X" confirmation badges around the hero photo.
 * Each enters with a spring scale-in, then gently bobs forever.
 * Visible at every viewport — sized down on mobile so all 4 fit cleanly.
 */
export function FloatingBadges() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {BADGES.map((b) => (
        <motion.div
          key={b.label}
          className={`absolute inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-2 py-1.5 shadow-2xl shadow-blue-950/30 ring-1 ring-black/5 backdrop-blur sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-2 ${b.position}`}
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
          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-white sm:h-5 sm:w-5">
            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 sm:text-[10px]">
            {b.label}
          </span>
          <span className="text-[11px] font-bold text-gray-900 sm:text-sm">
            {b.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
