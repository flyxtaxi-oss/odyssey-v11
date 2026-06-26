"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Route transition wrapper. Next.js re-mounts this `template` on every
 * navigation, so the entrance animation replays per page. Honours the
 * user's reduced-motion preference (no animation when set).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
