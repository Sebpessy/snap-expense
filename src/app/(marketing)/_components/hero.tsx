"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useRef } from "react";
import { Aurora } from "./motion/aurora";
import { FloatingBadges } from "./motion/floating-badges";

const EASE = [0.22, 0.61, 0.36, 1] as const;

const headlineParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const lineUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE },
  },
};

const reduceVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

export function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Stronger parallax — photo drifts -16% over the section scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "-16%"]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.1]);

  const lineVariants = reduce ? reduceVariants : lineUp;

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-brand-900 text-white"
    >
      {/* Animated aurora behind everything */}
      <Aurora />

      {/* Full-bleed hero photo with parallax + entrance + breathing */}
      <motion.div
        style={
          reduce
            ? undefined
            : { y: photoY, scale: photoScale }
        }
        className="absolute inset-0 -inset-y-[6%]"
      >
        <motion.div
          className="relative h-full w-full"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
        >
          <Image
            src="/marketing/hero-person.jpg"
            alt="A self-employed professional snapping a receipt with Xpenz — AI extracting vendor, total, date, and card number automatically."
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_center] lg:object-[55%_center]"
          />
        </motion.div>
      </motion.div>

      {/* Dark gradient — denser on the left so the copy reads, transparent on
          the right so the phone stays visible */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-brand-900/95 via-brand-900/80 to-brand-900/10 lg:via-brand-900/55 lg:to-transparent"
      />

      {/* subtle grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Floating AI-extraction confirmation badges */}
      <FloatingBadges />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 lg:px-8 lg:pb-36 lg:pt-32">
        <motion.div
          className="max-w-xl"
          initial="hidden"
          animate="visible"
          variants={headlineParent}
        >
          {/* Promo badge with sparkle icon */}
          <motion.div
            variants={lineVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-200 backdrop-blur"
          >
            <motion.span
              className="inline-flex"
              animate={reduce ? undefined : { rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={12} strokeWidth={2.5} className="text-amber-300" />
            </motion.span>
            Launch promo — 30 days free Pro
          </motion.div>

          <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-md sm:text-6xl lg:text-7xl">
            <motion.span variants={lineVariants} className="block">
              Snap a receipt.
            </motion.span>
            <motion.span variants={lineVariants} className="block">
              {/* Shimmer-gradient word */}
              <motion.span
                className="inline-block bg-gradient-to-r from-amber-200 via-amber-50 to-amber-300 bg-clip-text text-transparent"
                style={{ backgroundSize: "200% 100%" }}
                animate={
                  reduce
                    ? undefined
                    : { backgroundPositionX: ["200%", "-200%"] }
                }
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                Done.
              </motion.span>
            </motion.span>
          </h1>

          <motion.p
            variants={lineVariants}
            className="mt-6 max-w-xl text-lg leading-relaxed text-blue-50 drop-shadow sm:text-xl"
          >
            Track every business expense — by project, client, and tax category
            — in 3 seconds, from your phone. No more shoebox of receipts at tax
            time.
          </motion.p>

          <motion.div
            variants={lineVariants}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <motion.div
              whileHover={reduce ? undefined : { scale: 1.04, y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
            >
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-4 text-base font-bold text-gray-900 shadow-lg shadow-amber-500/40 transition hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-500/50"
              >
                Start 30 Days Free
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            variants={lineVariants}
            className="mt-5 text-sm text-blue-100/90 drop-shadow-sm"
          >
            No credit card required · Cancel anytime · Your data stays yours
          </motion.p>
        </motion.div>
      </div>

      <div aria-hidden className="pointer-events-none -mt-px h-0 lg:h-24" />
    </section>
  );
}
