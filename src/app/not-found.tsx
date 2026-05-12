"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "var(--bg-0)" }}>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-12 max-w-lg text-center relative z-10"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
        >
          <Sparkles size={32} color="white" />
        </motion.div>
        
        <h1 className="text-8xl font-extrabold text-[var(--text-0)] mb-2">404</h1>
        <p className="text-2xl text-[var(--text-1)] mb-4">Page introuvable</p>
        <p className="text-[var(--text-3)] mb-8">
          Cette page n'existe pas ou a été déplacée. Retournez à l'accueil pour continuer votre exploration.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              <Home size={18} />
              Accueil
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 border"
            style={{ borderColor: "var(--border-0)", color: "var(--text-1)" }}
          >
            <ArrowLeft size={18} />
            Retour
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
