"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plane,
  FileText,
  Bell,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// ==============================================================================
// VISA TRACKER — Smart Visa Expiration & Renewal Manager
// ==============================================================================

interface VisaEntry {
  id: string;
  country: string;
  visaType: string;
  issueDate: string;
  expiryDate: string;
  daysAllowed: number;
  daysUsed: number;
  notes: string;
  alerts: AlertConfig;
}

interface AlertConfig {
  days30: boolean;
  days60: boolean;
  days90: boolean;
}

interface VisaAlert {
  type: "critical" | "warning" | "info";
  message: string;
  daysRemaining: number;
  visaId: string;
}

const COUNTRIES = [
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "AE", name: "Dubai/UAE", flag: "🇦🇪" },
  { code: "TH", name: "Thaïlande", flag: "🇹🇭" },
  { code: "SG", name: "Singapour", flag: "🇸🇬" },
  { code: "MY", name: "Malaisie", flag: "🇲🇾" },
  { code: "CY", name: "Chypre", flag: "🇨🇾" },
  { code: "MT", name: "Malte", flag: "🇲🇹" },
  { code: "ES", name: "Espagne", flag: "🇪🇸" },
  { code: "GR", name: "Grèce", flag: "🇬🇷" },
  { code: "HR", name: "Croatie", flag: "🇭🇷" },
  { code: "ID", name: "Indonésie/Bali", flag: "🇮🇩" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "MX", name: "Mexique", flag: "🇲🇽" },
  { code: "GE", name: "Géorgie", flag: "🇬🇪" },
  { code: "OTHER", name: "Autre", flag: "🌍" },
];

const VISA_TYPES = [
  { value: "tourist", label: "Touristique" },
  { value: "digital-nomad", label: "Nomade Digital" },
  { value: "residency", label: "Résidence" },
  { value: "golden-visa", label: "Golden Visa" },
  { value: "student", label: "Étudiant" },
  { value: "work", label: "Travail" },
  { value: "other", label: "Autre" },
];

export default function VisaTracker() {
  const { user } = useAuth();
  const [visas, setVisas] = useState<VisaEntry[]>([]);
  const [alerts, setAlerts] = useState<VisaAlert[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedVisa, setExpandedVisa] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<Partial<VisaEntry>>({
    country: "",
    visaType: "tourist",
    issueDate: "",
    expiryDate: "",
    daysAllowed: 90,
    daysUsed: 0,
    notes: "",
    alerts: { days30: true, days60: true, days90: true },
  });

  // ─── Load visas from localStorage ─────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    const stored = localStorage.getItem(`visas-${user.uid}`);
    if (stored) {
      try {
        setVisas(JSON.parse(stored));
      } catch {
        console.error("Failed to parse visas");
      }
    }
    setIsLoading(false);
  }, [user]);

  // ─── Save visas to localStorage ──────────────────────────────────────────

  useEffect(() => {
    if (!user || isLoading) return;
    localStorage.setItem(`visas-${user.uid}`, JSON.stringify(visas));
  }, [visas, user, isLoading]);

  // ─── Calculate alerts ────────────────────────────────────────────────────

  useEffect(() => {
    const newAlerts: VisaAlert[] = [];

    visas.forEach((visa) => {
      const daysRemaining = getDaysRemaining(visa.expiryDate);
      const daysInCountry = getDaysInCountry(visa.issueDate, visa.daysUsed);

      // Expiry alerts
      if (daysRemaining <= 0) {
        newAlerts.push({
          type: "critical",
          message: `Visa ${getCountryName(visa.country)} EXPIRÉ`,
          daysRemaining,
          visaId: visa.id,
        });
      } else if (daysRemaining <= 7) {
        newAlerts.push({
          type: "critical",
          message: `Visa ${getCountryName(visa.country)} expire dans ${daysRemaining} jours`,
          daysRemaining,
          visaId: visa.id,
        });
      } else if (daysRemaining <= 30 && visa.alerts.days30) {
        newAlerts.push({
          type: "warning",
          message: `Renouvellement ${getCountryName(visa.country)} dans 30 jours`,
          daysRemaining,
          visaId: visa.id,
        });
      } else if (daysRemaining <= 60 && visa.alerts.days60) {
        newAlerts.push({
          type: "info",
          message: `Visa ${getCountryName(visa.country)} expire dans 60 jours`,
          daysRemaining,
          visaId: visa.id,
        });
      }

      // Schengen/90-day rule alert
      if (visa.daysAllowed === 90 && daysInCountry >= 80) {
        newAlerts.push({
          type: "warning",
          message: `Règle 90 jours: ${daysInCountry}/90 jours utilisés`,
          daysRemaining: 90 - daysInCountry,
          visaId: visa.id,
        });
      }
    });

    setAlerts(newAlerts.sort((a, b) => a.daysRemaining - b.daysRemaining));
  }, [visas]);

  // ─── Helper functions ────────────────────────────────────────────────────

  function getDaysRemaining(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function getDaysInCountry(issueDate: string, daysUsed: number): number {
    // Simplified calculation - in real app would track entry/exit dates
    return daysUsed;
  }

  function getCountryName(code: string): string {
    return COUNTRIES.find((c) => c.code === code)?.name || code;
  }

  function getCountryFlag(code: string): string {
    return COUNTRIES.find((c) => c.code === code)?.flag || "🌍";
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleAddVisa = useCallback(() => {
    if (!formData.country || !formData.expiryDate) return;

    const newVisa: VisaEntry = {
      id: `visa-${Date.now()}`,
      country: formData.country,
      visaType: formData.visaType || "tourist",
      issueDate: formData.issueDate || new Date().toISOString().split("T")[0],
      expiryDate: formData.expiryDate,
      daysAllowed: formData.daysAllowed || 90,
      daysUsed: formData.daysUsed || 0,
      notes: formData.notes || "",
      alerts: formData.alerts || { days30: true, days60: true, days90: true },
    };

    setVisas((prev) => [...prev, newVisa]);
    setShowAddForm(false);
    setFormData({
      country: "",
      visaType: "tourist",
      issueDate: "",
      expiryDate: "",
      daysAllowed: 90,
      daysUsed: 0,
      notes: "",
      alerts: { days30: true, days60: true, days90: true },
    });
  }, [formData]);

  const handleDeleteVisa = useCallback((id: string) => {
    setVisas((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const handleUpdateDaysUsed = useCallback((id: string, days: number) => {
    setVisas((prev) =>
      prev.map((v) => (v.id === id ? { ...v, daysUsed: days } : v))
    );
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--text-secondary)",
        }}
      >
        <p>Connecte-toi pour gérer tes visas</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.25rem",
            }}
          >
            Visa Tracker
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Gestion intelligente des visas et alertes de renouvellement
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            background: "var(--accent-blue)",
            border: "none",
            borderRadius: "0.5rem",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={18} />
          Ajouter un visa
        </button>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Bell size={16} />
            Alertes ({alerts.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <AnimatePresence>
              {alerts.map((alert, index) => (
                <motion.div
                  key={`${alert.visaId}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    background:
                      alert.type === "critical"
                        ? "rgba(239, 68, 68, 0.1)"
                        : alert.type === "warning"
                        ? "rgba(245, 158, 11, 0.1)"
                        : "rgba(59, 130, 246, 0.1)",
                    border: `1px solid ${
                      alert.type === "critical"
                        ? "rgba(239, 68, 68, 0.3)"
                        : alert.type === "warning"
                        ? "rgba(245, 158, 11, 0.3)"
                        : "rgba(59, 130, 246, 0.3)"
                    }`,
                  }}
                >
                  {alert.type === "critical" ? (
                    <AlertTriangle size={18} color="#ef4444" />
                  ) : alert.type === "warning" ? (
                    <Clock size={18} color="#f59e0b" />
                  ) : (
                    <Bell size={18} color="#3b82f6" />
                  )}
                  <span style={{ flex: 1 }}>{alert.message}</span>
                  {alert.daysRemaining > 0 && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color:
                          alert.type === "critical"
                            ? "#ef4444"
                            : alert.type === "warning"
                            ? "#f59e0b"
                            : "#3b82f6",
                      }}
                    >
                      {alert.daysRemaining}j
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "var(--bg-1)",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>
              Nouveau Visa
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Pays
                </label>
                <select
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "var(--bg-0)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="">Sélectionner...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Type de visa
                </label>
                <select
                  value={formData.visaType}
                  onChange={(e) =>
                    setFormData({ ...formData, visaType: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "var(--bg-0)",
                    color: "var(--text-primary)",
                  }}
                >
                  {VISA_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Date d'expiration
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "var(--bg-0)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Jours autorisés
                </label>
                <input
                  type="number"
                  value={formData.daysAllowed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      daysAllowed: parseInt(e.target.value),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "var(--bg-0)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  marginBottom: "0.5rem",
                  color: "var(--text-secondary)",
                }}
              >
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Numéro de visa, documents requis, etc."
                rows={2}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  background: "var(--bg-0)",
                  color: "var(--text-primary)",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                marginTop: "1rem",
              }}
            >
              <button
                onClick={handleAddVisa}
                disabled={!formData.country || !formData.expiryDate}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "var(--accent-blue)",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "white",
                  fontWeight: 600,
                  cursor:
                    !formData.country || !formData.expiryDate
                      ? "not-allowed"
                      : "pointer",
                  opacity: !formData.country || !formData.expiryDate ? 0.5 : 1,
                }}
              >
                Enregistrer
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visas List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {isLoading ? (
          <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>
            Chargement...
          </p>
        ) : visas.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--text-secondary)",
            }}
          >
            <Plane size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
            <p>Aucun visa enregistré</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Ajoute ton premier visa pour recevoir des alertes de renouvellement
            </p>
          </div>
        ) : (
          visas.map((visa) => {
            const daysRemaining = getDaysRemaining(visa.expiryDate);
            const isExpired = daysRemaining <= 0;
            const isExpiringSoon = daysRemaining <= 30;

            return (
              <motion.div
                key={visa.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "var(--bg-1)",
                  borderRadius: "0.75rem",
                  border: `1px solid ${
                    isExpired
                      ? "rgba(239, 68, 68, 0.3)"
                      : isExpiringSoon
                      ? "rgba(245, 158, 11, 0.3)"
                      : "var(--border)"
                  }`,
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  onClick={() =>
                    setExpandedVisa(
                      expandedVisa === visa.id ? null : visa.id
                    )
                  }
                  style={{
                    padding: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>
                    {getCountryFlag(visa.country)}
                  </span>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>
                        {getCountryName(visa.country)}
                      </span>
                      {isExpired && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.125rem 0.375rem",
                            background: "#ef4444",
                            color: "white",
                            borderRadius: "0.25rem",
                          }}
                        >
                          EXPIRÉ
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {
                        VISA_TYPES.find((t) => t.value === visa.visaType)
                          ?.label
                      }{" "}
                      • Expire le{" "}
                      {new Date(visa.expiryDate).toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: isExpired
                          ? "#ef4444"
                          : isExpiringSoon
                          ? "#f59e0b"
                          : "var(--text-primary)",
                      }}
                    >
                      {isExpired ? "0" : daysRemaining}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      jours
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteVisa(visa.id);
                    }}
                    style={{
                      padding: "0.5rem",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      opacity: 0.6,
                    }}
                  >
                    <Trash2 size={18} />
                  </button>

                  {expandedVisa === visa.id ? (
                    <ChevronUp size={20} color="var(--text-secondary)" />
                  ) : (
                    <ChevronDown size={20} color="var(--text-secondary)" />
                  )}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedVisa === visa.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      style={{
                        borderTop: "1px solid var(--border)",
                        background: "var(--bg-0)",
                      }}
                    >
                      <div style={{ padding: "1rem" }}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                            gap: "1rem",
                            marginBottom: "1rem",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                marginBottom: "0.25rem",
                              }}
                            >
                              Date d'émission
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <Calendar size={14} />
                              {new Date(visa.issueDate).toLocaleDateString("fr-FR")}
                            </div>
                          </div>

                          <div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                marginBottom: "0.25rem",
                              }}
                            >
                              Jours utilisés
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <input
                                type="number"
                                value={visa.daysUsed}
                                onChange={(e) =>
                                  handleUpdateDaysUsed(
                                    visa.id,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                style={{
                                  width: "60px",
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "0.25rem",
                                  border: "1px solid var(--border)",
                                  background: "var(--bg-1)",
                                  color: "var(--text-primary)",
                                }}
                              />
                              <span style={{ color: "var(--text-secondary)" }}>
                                / {visa.daysAllowed}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                marginBottom: "0.25rem",
                              }}
                            >
                              Alertes activées
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              {visa.alerts.days30 && (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "0.125rem 0.375rem",
                                    background: "var(--bg-2)",
                                    borderRadius: "0.25rem",
                                  }}
                                >
                                  30j
                                </span>
                              )}
                              {visa.alerts.days60 && (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "0.125rem 0.375rem",
                                    background: "var(--bg-2)",
                                    borderRadius: "0.25rem",
                                  }}
                                >
                                  60j
                                </span>
                              )}
                              {visa.alerts.days90 && (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "0.125rem 0.375rem",
                                    background: "var(--bg-2)",
                                    borderRadius: "0.25rem",
                                  }}
                                >
                                  90j
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {visa.notes && (
                          <div
                            style={{
                              padding: "0.75rem",
                              background: "var(--bg-1)",
                              borderRadius: "0.5rem",
                              fontSize: "0.875rem",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                marginBottom: "0.25rem",
                              }}
                            >
                              <FileText size={12} style={{ display: "inline", marginRight: "0.25rem" }} />
                              Notes
                            </div>
                            {visa.notes}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
