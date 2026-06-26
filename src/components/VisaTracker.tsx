"use client";

import React, { useState, useEffect } from "react";
import { NotificationEngine } from "@/lib/notification-engine";
import { visaDataService, CountryVisaRules } from "@/lib/visa-data";

interface VisaTrackerProps {
  countryCode: string;
  entryDate: string; // YYYY-MM-DD
}

export default function VisaTracker({ countryCode, entryDate }: VisaTrackerProps) {
  const [visaData, setVisaData] = useState<CountryVisaRules | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [maxDays, setMaxDays] = useState<number>(90);
  const [urgency, setUrgency] = useState<"safe" | "warning" | "critical">("safe");

  useEffect(() => {
    async function fetchVisa() {
      const data = await visaDataService.getCountryVisaData(countryCode);
      setVisaData(data);

      // Durée maximale réelle du séjour selon le pays sélectionné
      const maxStayDays = data.maxDays;
      const entry = new Date(entryDate);
      const now = new Date();

      const diffTime = now.getTime() - entry.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const remaining = maxStayDays - diffDays;

      setMaxDays(maxStayDays);
      setDaysRemaining(remaining);
      setUrgency(NotificationEngine.getVisaUrgency(remaining));
    }
    fetchVisa();
  }, [countryCode, entryDate]);

  if (!visaData) return <div aria-busy="true" aria-label="Chargement des données visa" className="animate-pulse h-24 bg-slate-800 rounded-xl" />;

  const urgencyColors = {
    safe: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    warning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    critical: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };

  const progressPercentage = Math.max(0, Math.min(100, ((maxDays - daysRemaining) / maxDays) * 100));

  return (
    <div className="glass-panel p-6 relative overflow-hidden">
      {/* Décoration futuriste */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-[var(--secondary)]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="flex justify-between items-start gap-3 mb-6">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-[var(--text-0)] flex items-center gap-2">
            <span>{visaData.flag}</span>
            <span className="truncate">{visaData.country} — Visa Tracker</span>
          </h3>
          <p className="text-[var(--text-3)] text-sm mt-1">
            {visaData.visaType} · Entrée le {new Date(entryDate).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className={`shrink-0 px-4 py-2 rounded-lg border font-mono font-bold text-lg ${urgencyColors[urgency]}`}>
          {daysRemaining} j
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-[var(--text-3)]">
          <span>Jour 0</span>
          <span>{maxDays} j (expiration)</span>
        </div>
        <div className="w-full bg-[var(--bg-3)] rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              urgency === 'critical' ? 'bg-rose-500' : urgency === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}