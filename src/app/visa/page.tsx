"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import VisaTracker from "@/components/VisaTracker";
import { Shield, Save, Loader2, Check, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile } from "@/lib/firebase";
import { getAvailableVisaCountries } from "@/lib/visa-data";

const DEFAULT_COUNTRY = "PT";
const today = () => new Date().toISOString().split("T")[0];

export default function VisaPage() {
  const { user, loading: authLoading } = useAuth();
  const countries = getAvailableVisaCountries();

  const [country, setCountry] = useState<string>(DEFAULT_COUNTRY);
  const [entryDate, setEntryDate] = useState<string>(today());
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  // Load the user's saved visa settings from their Firestore profile
  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }
    try {
      const profile = await getUserProfile(user.uid);
      if (profile?.visa_country) setCountry(profile.visa_country);
      if (profile?.visa_entry_date) setEntryDate(profile.visa_entry_date);
    } catch {
      /* keep defaults on read error */
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) loadProfile();
  }, [authLoading, loadProfile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      await updateUserProfile(user.uid, { visa_country: country, visa_entry_date: entryDate });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

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
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
        >
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-0)]">Visa Tracker</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">
            Suivi intelligent de vos visas et dates d&apos;expiration
          </p>
        </div>
      </div>

      {/* Configuration form */}
      <div className="glass-panel p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-3)] mb-5">
          Mon séjour actuel
        </h2>

        {loadingProfile ? (
          <div className="flex items-center gap-2 text-[var(--text-3)] text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement de votre profil…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="visa-country"
                className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-2)]"
              >
                Pays de séjour
              </label>
              <select
                id="visa-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input-sci-fi w-full py-3 px-4 text-[15px]"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.country} — {c.maxDays} jours ({c.visaType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="visa-entry"
                className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-2)]"
              >
                Date d&apos;entrée
              </label>
              <input
                id="visa-entry"
                type="date"
                value={entryDate}
                max={today()}
                onChange={(e) => setEntryDate(e.target.value)}
                className="input-sci-fi w-full py-3 px-4 text-[15px]"
              />
            </div>
          </div>
        )}

        {/* Save / auth state */}
        {!loadingProfile && (
          <div className="flex items-center gap-3 mt-5">
            {user ? (
              <button
                onClick={handleSave}
                disabled={saving}
                aria-label="Enregistrer mes informations de visa"
                className="btn-stitch-solid inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </button>
            ) : (
              <p className="inline-flex items-center gap-2 text-sm text-[var(--text-3)]">
                <Info className="w-4 h-4" />
                Connecte-toi pour enregistrer tes informations de visa.
              </p>
            )}

            {saveStatus === "saved" && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--success)]">
                <Check className="w-4 h-4" /> Enregistré
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-sm font-semibold text-[var(--error)]">
                Erreur lors de l&apos;enregistrement
              </span>
            )}
          </div>
        )}
      </div>

      {/* Live tracker — re-renders when country/date change */}
      <VisaTracker countryCode={country} entryDate={entryDate} />
    </motion.div>
  );
}
