"use client";

import { MotionConfig } from "framer-motion";
import { ReactNode } from "react";

/**
 * Makes every framer-motion animation in the app respect the operating
 * system's "reduce motion" setting.
 *
 * globals.css already has a `@media (prefers-reduced-motion: reduce)` block,
 * but a CSS media query only neutralises CSS animations and transitions. The
 * app animates almost entirely through framer-motion, which drives values in
 * JavaScript — those kept running at full amplitude for users who had asked
 * the OS for less motion. For people with vestibular disorders that is not a
 * preference, it is a trigger.
 *
 * `reducedMotion="user"` makes framer-motion read the same OS setting and
 * skip transform/layout animations while keeping opacity fades, so content
 * still appears rather than popping in without explanation.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
