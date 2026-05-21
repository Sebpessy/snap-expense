"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Parent + child pair for per-item staggered reveal on grids/lists.
 *
 * Usage:
 *   <Stagger className="grid gap-6 md:grid-cols-3">
 *     {items.map((item) => (
 *       <StaggerItem key={item.id}><Card item={item} /></StaggerItem>
 *     ))}
 *   </Stagger>
 *
 * Triggers once when the grid scrolls into view. Each child eases up in
 * sequence with a small delay between them. Honors prefers-reduced-motion.
 */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0.05,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  /** seconds between consecutive child reveals */
  stagger?: number;
  /** seconds to wait before the first child reveals */
  delayChildren?: number;
  as?: "div" | "ul" | "ol" | "section";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[As] as typeof motion.div;

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : stagger,
        delayChildren: reduce ? 0 : delayChildren,
      },
    },
  };

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({
  children,
  className,
  y = 32,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[As] as typeof motion.div;

  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : y,
      scale: reduce ? 1 : 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: reduce ? 0.2 : 0.6,
        ease: [0.22, 0.61, 0.36, 1],
      },
    },
  };

  return (
    <MotionTag className={className} variants={variants}>
      {children}
    </MotionTag>
  );
}
