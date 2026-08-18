"use client";

import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { NotificationEngine } from "@/lib/notification-engine";
import { visaDataService, CountryVisaRules } from "@/lib/visa-data";

export interface StoredVisa {
  id: string;
  country_code: string;
  entry_date: string; // YYYY-MM-DD
  max_stay_days: number;
}

interface VisaTrackerProps {
  visa: StoredVisa;
  onDelete?: (id: string) => void;
}

export default function VisaTracker({ visa, onDelete }: VisaTrackerProps) {
  const [visaData, setVisaData] = useState<CountryVisaRules | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await visaDataService.getCountryVisaData(visa.country_code);
      if (!cancelled) setVisaData(data);
    })();
    return () => { cancelled = true; };
  }, [visa.country_code]);

  // Compute remaining days from the visa's real allowance (no hardcoded 90).
  const maxStayDays = visa.max_stay_days;
  const entry = new Date(visa.entry_date);
  const diffDays = Math.ceil(Math.abs(new Date().getTime() - entry.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = maxStayDays - diffDays;
  const urgency = NotificationEngine.getVisaUrgency(daysRemaining);
  const progressPercentage = Math.max(0, Math.min(100, ((maxStayDays - daysRemaining) / maxStayDays) * 100));

  if (!visaData) return <div className="animate-pulse h-24 bg-slate-800 rounded-xl" />;

  const urgencyColors = {
    safe: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    warning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    critical: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-2xl">
      {/* Décoration futuriste */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>{visaData.flag}</span>
            {visaData.country} — {visaData.visaType}
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Entrée le {new Date(visa.entry_date).toLocaleDateString("fr-FR")} · séjour max {maxStayDays} j
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg border font-mono font-bold text-lg ${urgencyColors[urgency]}`}>
            {daysRemaining} jours restants
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(visa.id)}
              aria-label="Supprimer ce visa"
              className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
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
