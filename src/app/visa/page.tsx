"use client";

import { motion } from "framer-motion";
import VisaTracker from "@/components/VisaTracker";
import { Shield } from "lucide-react";

export default function VisaPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-6xl mx-auto w-full pt-6 pb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
        >
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-0)]">Visa Tracker</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">
            Suivi intelligent de vos visas et dates d'expiration
          </p>
        </div>
      </div>

      {/* Visa Tracker Component */}
      <VisaTracker />
    </motion.div>
  );
}
