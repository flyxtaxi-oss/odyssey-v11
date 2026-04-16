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
  const [urgency, setUrgency] = useState<"safe" | "warning" | "critical">("safe");

  useEffect(() => {
    async function fetchVisa() {
      const data = await visaDataService.getCountryVisaData(countryCode);
      setVisaData(data);

      // Calcul simple : On suppose 90 jours (Schengen/Touriste par défaut)
      // TODO: Ajuster avec la durée réelle du visa utilisateur depuis Firestore
      const maxStayDays = 90; 
      const entry = new Date(entryDate);
      const now = new Date();
      
      const diffTime = Math.abs(now.getTime() - entry.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const remaining = maxStayDays - diffDays;

      setDaysRemaining(remaining);
      setUrgency(NotificationEngine.getVisaUrgency(remaining));
    }
    fetchVisa();
  }, [countryCode, entryDate]);

  if (!visaData) return <div className="animate-pulse h-24 bg-slate-800 rounded-xl" />;

  const urgencyColors = {
    safe: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    warning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    critical: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };

  const progressPercentage = Math.max(0, Math.min(100, ((90 - daysRemaining) / 90) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-2xl">
      {/* Décoration futuriste */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>{visaData.flag}</span>
            {visaData.country} — Visa Tracker
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Entrée le {new Date(entryDate).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg border font-mono font-bold text-lg ${urgencyColors[urgency]}`}>
          {daysRemaining} jours restants
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-500">
          <span>Jour 0</span>
          <span>Expiration</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
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