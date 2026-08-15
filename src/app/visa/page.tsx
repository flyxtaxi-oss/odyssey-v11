"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Plus, Globe, X } from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { VISA_COUNTRIES } from "@/lib/visa-data";
import VisaTracker, { StoredVisa } from "@/components/VisaTracker";
import { Button, Card, Field, Select, Input, EmptyState, Skeleton } from "@/components/ui";

export default function VisaPage() {
  const { user } = useAuth();
  const [visas, setVisas] = useState<StoredVisa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [countryCode, setCountryCode] = useState(VISA_COUNTRIES[0]?.code ?? "PT");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);

  // Load the current user's visas from Firestore.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const q = query(collection(db, COLLECTIONS.VISAS), where("user_id", "==", user.uid));
        const snap = await getDocs(q);
        if (!cancelled) {
          setVisas(
            snap.docs
              .map((d) => ({ id: d.id, ...(d.data() as Omit<StoredVisa, "id">) }))
              .sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1))
          );
        }
      } catch { /* ignore — empty state shown */ }
      if (!cancelled) setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const addVisa = async () => {
    if (!user || saving) return;
    setSaving(true);
    const country = VISA_COUNTRIES.find((c) => c.code === countryCode);
    const ref = doc(collection(db, COLLECTIONS.VISAS));
    const newVisa: StoredVisa = {
      id: ref.id,
      country_code: countryCode,
      entry_date: entryDate,
      max_stay_days: country?.maxDays ?? 90,
    };
    try {
      await setDoc(ref, { ...newVisa, user_id: user.uid, created_at: new Date().toISOString() });
      setVisas((prev) => [newVisa, ...prev]);
      setShowForm(false);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const deleteVisa = async (id: string) => {
    setVisas((prev) => prev.filter((v) => v.id !== id));
    try {
      await deleteDoc(doc(db, COLLECTIONS.VISAS, id));
    } catch { /* optimistic — already removed from UI */ }
  };

  return (
    <motion.div
        lang="fr" dir="ltr"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-6xl mx-auto w-full pt-6 pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-[var(--text-0)]">Visa Tracker</h1>
            <p className="text-sm text-[var(--text-3)] mt-0.5">
              Suivi intelligent de vos visas et dates d&apos;expiration
            </p>
          </div>
        </div>
        {user && (
          <Button variant="subtle" onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Annuler" : "Ajouter un visa"}
          </Button>
        )}
      </div>

      {/* Add form */}
      {user && showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card variant="glass" padding="md" className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] items-end">
            <Field label="Pays / destination" htmlFor="visa-country">
              <Select id="visa-country" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                {VISA_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.country} — {c.maxDays} j ({c.visaType})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Date d'entrée" htmlFor="visa-date">
              <Input
                id="visa-date"
                type="date"
                value={entryDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </Field>
            <Button onClick={addVisa} loading={saving}>
              {!saving && <Plus className="w-4 h-4" />}
              Enregistrer
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Content */}
      {!user ? (
        <EmptyState
          icon={<Globe className="w-10 h-10" />}
          title="Connecte-toi pour suivre tes visas"
          description="Reçois des alertes d'expiration et garde tous tes séjours au même endroit."
        />
      ) : isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : visas.length === 0 ? (
        <EmptyState
          icon={<Globe className="w-10 h-10" />}
          title="Aucun visa suivi pour l'instant"
          description="Ajoute ton premier séjour pour voir le compte à rebours d'expiration."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" /> Ajouter un visa
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {visas.map((visa) => (
            <VisaTracker key={visa.id} visa={visa} onDelete={deleteVisa} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
