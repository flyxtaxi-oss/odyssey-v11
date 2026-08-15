"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Languages } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_FLAGS } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Language picker.
 *
 * Built as a listbox rather than a row of flag buttons: flags stand for
 * countries, not languages (🇬🇧 is not "English" to an American, 🇳🇱 is not
 * "Dutch" to a Belgian), so each option carries its language name written in
 * that language — the one label a speaker recognises without already knowing
 * the interface language.
 */
export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape — expected of any popover.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("settings.language")} : ${LOCALE_LABELS[locale]}`}
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl border border-transparent transition-all",
          "text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-2)] hover:border-[var(--border-0)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none",
          compact ? "w-11 h-11" : "px-3 py-2.5"
        )}
      >
        <Languages className="w-4 h-4 shrink-0" aria-hidden="true" />
        {!compact && (
          <span className="text-[12px] font-semibold uppercase tracking-wider">
            {locale}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={t("settings.language")}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full start-0 mb-2 z-50 min-w-[190px] p-1.5 rounded-2xl bg-[var(--bg-2)] border border-[var(--border-1)] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)]"
          >
            {SUPPORTED_LOCALES.map((code) => {
              const active = code === locale;
              return (
                <li key={code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setLocale(code);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none",
                      active
                        ? "bg-[var(--primary)]/10 text-[var(--text-0)]"
                        : "text-[var(--text-2)] hover:bg-[var(--bg-3)] hover:text-[var(--text-0)]"
                    )}
                  >
                    <span aria-hidden="true" className="text-base leading-none">
                      {LOCALE_FLAGS[code]}
                    </span>
                    {/* lang= tells a screen reader to switch voice for this word */}
                    <span lang={code} className="text-[13px] font-medium flex-1">
                      {LOCALE_LABELS[code]}
                    </span>
                    {active && (
                      <Check className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
