"use client";

import { motion } from "framer-motion";
import {
    Settings as SettingsIcon,
    Shield,
    Bell,
    Palette,
    LogOut,
    Smartphone,
    Moon,
    Zap,
    Download,
    Lock,
    Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LocaleContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { logout } from "@/lib/firebase";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

/**
 * An accessible on/off switch.
 *
 * This used to be an empty <button> with no text, no label, no role and no
 * state: assistive tech announced "bouton" and gave no way to know what it
 * controlled or whether it was on. `role="switch"` + `aria-checked` is the
 * pattern that makes a custom toggle announce like a native checkbox.
 */
function Toggle({
    enabled,
    onChange,
    label,
}: {
    enabled: boolean;
    onChange: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={label}
            onClick={onChange}
            className="w-11 h-[24px] rounded-full relative transition-all duration-300 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-0)]"
            style={{
                background: enabled ? "var(--primary)" : "var(--bg-3)",
                border: enabled ? "1px solid var(--primary)" : "1px solid var(--border-1)",
                boxShadow: enabled ? "inset 0 1px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.5)",
            }}
        >
            <motion.div
                className="w-[18px] h-[18px] rounded-full absolute top-[2px]"
                animate={{ left: enabled ? 24 : 3 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
                }}
            />
        </button>
    );
}

export default function SettingsPage() {
    const { user } = useAuth();
    const { t, locale } = useTranslation();
    const router = useRouter();
    const [toggles, setToggles] = useState<Record<string, boolean>>({
        memory: true,
        extraction: true,
        opportunities: true,
        mentors: true,
        weekly: true,
        biometric: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");

    // Load settings from Firestore
    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        const loadSettings = async () => {
            try {
                const ref = doc(db, COLLECTIONS.PROFILES, user.uid);
                const snap = await getDoc(ref);
                if (!cancelled && snap.exists() && snap.data().settings) {
                    setToggles(prev => ({ ...prev, ...snap.data().settings }));
                }
            } catch { /* ignore */ }
            if (!cancelled) setIsLoading(false);
        };
        loadSettings();
        return () => { cancelled = true; };
    }, [user]);

    // Save settings to Firestore
    const saveSettings = useCallback(async (newToggles: Record<string, boolean>) => {
        if (!user) return;
        setIsSaving(true);
        try {
            const ref = doc(db, COLLECTIONS.PROFILES, user.uid);
            await setDoc(ref, { settings: newToggles, updated_at: new Date().toISOString() }, { merge: true });
            setSaveMsg("saved");
            setTimeout(() => setSaveMsg(""), 2000);
        } catch {
            setSaveMsg("error");
        }
        setIsSaving(false);
    }, [user]);

    const toggle = (key: string) => {
        const newToggles = { ...toggles, [key]: !toggles[key] };
        setToggles(newToggles);
        saveSettings(newToggles);
    };

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    // ─── GDPR : export + suppression ─────────────────────────────────────────
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteArmed, setDeleteArmed] = useState(false);
    const [accountError, setAccountError] = useState("");
    const disarmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleExport = async () => {
        setIsExporting(true);
        setAccountError("");
        try {
            const res = await apiFetch("/api/account");
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                setAccountError(body?.error ?? t("settings.saveError"));
                return;
            }
            // Stream the JSON to a file download; the payload is everything
            // personal we hold and should not linger in a browser tab.
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "odyssey-export.json";
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            setAccountError(t("settings.saveError"));
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async () => {
        // First click arms; a second within 6 s executes. The window then
        // closes on its own so an armed button never lies in wait for a
        // misclick minutes later.
        if (!deleteArmed) {
            setDeleteArmed(true);
            setAccountError("");
            disarmTimer.current = setTimeout(() => setDeleteArmed(false), 6000);
            return;
        }
        if (disarmTimer.current) clearTimeout(disarmTimer.current);

        setIsDeleting(true);
        setAccountError("");
        try {
            const res = await apiFetch("/api/account", { method: "DELETE" });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                setAccountError(body?.error ?? t("settings.saveError"));
                setDeleteArmed(false);
                return;
            }
            // The server account is gone; drop the local session and leave.
            await logout();
            router.push("/login");
        } catch {
            setAccountError(t("settings.saveError"));
            setDeleteArmed(false);
        } finally {
            setIsDeleting(false);
        }
    };

    // Profile block used to render a hardcoded "Jibril / jibril@odyssey.ai"
    // for every visitor. Derive it from the signed-in account instead.
    const displayName =
        user?.displayName?.trim() || user?.email?.split("@")[0] || t("common.you");

    const memberSince = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString(locale, {
              month: "long",
              year: "numeric",
          })
        : "—";

    if (isLoading && user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--text-3)]" />
            </div>
        );
    }

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-8">
            {/* ─── Header ─── */}
            <motion.div variants={fadeUp} className="relative mt-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 mb-4">
                    <SettingsIcon className="w-4 h-4 text-[var(--primary)]" />
                    <span className="t-label uppercase text-[var(--text-2)]">{t("settings.accountPrivacy")}</span>
                </div>
                <h1 className="t-display text-[var(--text-0)]">
                    {t("settings.title")}
                </h1>

                {/* Save feedback: settings persist to Firestore on every toggle,
                    but until now nothing told the user it had worked. */}
                <div aria-live="polite" className="h-5 mt-3">
                    {isSaving && (
                        <span className="t-label uppercase text-[var(--text-3)]">
                            {t("settings.saving")}
                        </span>
                    )}
                    {!isSaving && saveMsg && (
                        <span className={`t-label uppercase ${saveMsg === "error" ? "text-[var(--error)]" : "text-[var(--success)]"}`}>
                            {saveMsg === "error" ? t("settings.saveError") : t("settings.saved")}
                        </span>
                    )}
                </div>
            </motion.div>

            {/* ─── Profile ─── */}
            <motion.div variants={fadeUp} className="glass-panel p-6 md:p-8 relative overflow-hidden group bg-[var(--bg-1)] border border-[var(--border-1)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.02] pointer-events-none mix-blend-screen"
                    style={{ background: "radial-gradient(circle at 100% 0%, #ffffff, transparent 70%)" }} />

                <div className="flex items-center gap-5 mb-8 relative z-10 border-b border-[var(--border-0)] pb-6">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold relative bg-[var(--bg-2)] border border-[var(--border-2)] text-[var(--text-0)] shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    >
                        {displayName.charAt(0).toUpperCase()}
                        <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--success)] border-[2px] border-[var(--bg-1)]" />
                    </div>
                    <div className="flex-1">
                        <h2 className="t-title text-[var(--text-0)]">{displayName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {/* "EXECUTIVE" was a tier that does not exist, and the
                                country was hardcoded to France for every user.
                                Email verification is a real, checkable fact. */}
                            <span className="t-label uppercase text-[var(--text-3)]">
                                {user?.emailVerified ? "✓ " : ""}{user?.email}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-0 relative z-10">
                    {[
                        { label: t("settings.identifier"), value: user?.email || "—" },
                        
                        { label: t("settings.memberSince"), value: memberSince },
                        
                    ].map((r) => (
                        <div key={r.label} className="flex justify-between py-3 group/row cursor-pointer hover:bg-[var(--bg-2)] -mx-4 px-4 rounded-lg transition-all border-b border-[var(--border-0)] last:border-0">
                            <span className="t-label uppercase text-[var(--text-3)]">{r.label}</span>
                            <span className="text-[13px] font-mono-tech font-bold text-[var(--text-1)] group-hover/row:text-[var(--text-0)] transition-colors">{r.value}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ─── IA & Privacy ─── */}
            <motion.div variants={fadeUp} className="glass-panel p-6 md:p-8 space-y-2 relative overflow-hidden bg-[var(--bg-0)] border border-[var(--border-1)] shadow-none">

                <div className="flex items-center gap-4 mb-6 relative z-10 border-b border-[var(--border-0)] pb-4">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-[var(--bg-2)] border border-[var(--border-1)] shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                        <Shield className="w-5 h-5 text-[var(--text-1)]" />
                    </div>
                    <div>
                        <h2 className="t-subtitle text-[var(--text-0)]">{t("settings.aiData")}</h2>
                        <p className="t-label uppercase text-[var(--text-3)] mt-1">{t("settings.privacy")}</p>
                    </div>
                </div>
                {[
                    { key: "memory", label: t("toggle.memory"), desc: t("toggle.memoryDesc"), icon: Zap },
                    { key: "extraction", label: t("toggle.extraction"), desc: t("toggle.extractionDesc"), icon: Download },
                    { key: "biometric", label: t("toggle.biometric"), desc: t("toggle.biometricDesc"), icon: Lock },
                ].map((t) => (
                    <div key={t.key} className="flex items-center justify-between py-4 hover:bg-[var(--bg-1)] -mx-4 px-4 rounded-lg transition-all relative z-10 border-b border-[var(--border-0)] last:border-0">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-2)] border border-[var(--border-1)]">
                                <t.icon className="w-4 h-4 text-[var(--text-2)]" />
                            </div>
                            <div>
                                <span className="t-subtitle text-[var(--text-1)]">{t.label}</span>
                                <p className="t-caption">{t.desc}</p>
                            </div>
                        </div>
                        <Toggle enabled={toggles[t.key]} onChange={() => toggle(t.key)} label={t.label} />
                    </div>
                ))}
            </motion.div>

            {/* ─── Notifications ─── */}
            <motion.div variants={fadeUp} className="glass-panel p-6 md:p-8 space-y-2 relative overflow-hidden bg-[var(--bg-0)] border border-[var(--border-1)] shadow-none">

                <div className="flex items-center gap-4 mb-6 relative z-10 border-b border-[var(--border-0)] pb-4">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-[var(--bg-2)] border border-[var(--border-1)] shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                        <Bell className="w-5 h-5 text-[var(--text-1)]" />
                    </div>
                    <div>
                        <h2 className="t-subtitle text-[var(--text-0)]">{t("settings.notifications")}</h2>
                        <p className="t-label uppercase text-[var(--text-3)] mt-1">{t("settings.alertsReports")}</p>
                    </div>
                </div>
                {[
                    { key: "opportunities", label: t("toggle.opportunities"), desc: t("toggle.opportunitiesDesc") },
                    { key: "mentors", label: t("toggle.mentors"), desc: t("toggle.mentorsDesc") },
                    { key: "weekly", label: t("toggle.weekly"), desc: t("toggle.weeklyDesc") },
                ].map((t) => (
                    <div key={t.key} className="flex items-center justify-between py-4 hover:bg-[var(--bg-1)] -mx-4 px-4 rounded-lg transition-all relative z-10 border-b border-[var(--border-0)] last:border-0">
                        <div>
                            <span className="t-subtitle text-[var(--text-1)]">{t.label}</span>
                            <p className="t-caption">{t.desc}</p>
                        </div>
                        <Toggle enabled={toggles[t.key]} onChange={() => toggle(t.key)} label={t.label} />
                    </div>
                ))}
            </motion.div>

            {/* ─── Appearance ─── */}
            <motion.div variants={fadeUp} className="glass-panel p-6 md:p-8 relative overflow-hidden bg-[var(--bg-0)] border border-[var(--border-1)] shadow-none">

                <div className="flex items-center gap-4 mb-6 relative z-10 border-b border-[var(--border-0)] pb-4">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-[var(--bg-2)] border border-[var(--border-1)] shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                        <Palette className="w-5 h-5 text-[var(--text-1)]" />
                    </div>
                    <div>
                        <h2 className="t-subtitle text-[var(--text-0)]">{t("settings.appearance")}</h2>
                        <p className="t-label uppercase text-[var(--text-3)] mt-1">{t("settings.themeDisplay")}</p>
                    </div>
                </div>
                {/* These rows used to be static text styled to look clickable — a
                    chevron, a hover state, and no handler. The theme and language
                    controls exist and work; Settings is where people look for
                    them, so they belong here rather than only in the sidebar. */}
                <div className="flex items-center justify-between py-4 relative z-10 border-b border-[var(--border-0)]">
                    <div className="flex items-center gap-4">
                        <Moon className="w-4 h-4 text-[var(--text-3)]" />
                        <span className="text-[13px] font-bold text-[var(--text-1)] tracking-wide">{t("settings.theme")}</span>
                    </div>
                    <ThemeToggle />
                </div>
                <div className="flex items-center justify-between py-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <Smartphone className="w-4 h-4 text-[var(--text-3)]" />
                        <span className="text-[13px] font-bold text-[var(--text-1)] tracking-wide">{t("settings.language")}</span>
                    </div>
                    <LocaleSwitcher />
                </div>
            </motion.div>

            {/* ─── Danger zone (GDPR) ───
                Export (art. 20) and erasure (art. 17). Deletion is two-step:
                the first click arms the button and swaps its label for an
                explicit warning; only a second click within 6 seconds fires.
                A native confirm() dialog would be untranslated browser chrome
                and trivially clicked through. */}
            <motion.div variants={fadeUp} className="glass-panel p-6 md:p-8 relative overflow-hidden border border-[var(--error)]/25">
                <div className="flex items-center gap-4 mb-6 relative z-10 border-b border-[var(--border-0)] pb-4">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-[var(--error)]/10 border border-[var(--error)]/25">
                        <Shield className="w-5 h-5 text-[var(--error)]" />
                    </div>
                    <div>
                        <h2 className="t-subtitle text-[var(--text-0)]">{t("settings.dangerZone")}</h2>
                        <p className="t-label uppercase text-[var(--text-3)] mt-1">{t("settings.privacy")}</p>
                    </div>
                </div>

                <p className="t-caption mb-6">{t("settings.deleteWarning")}</p>

                <div aria-live="polite" className="min-h-5 mb-4">
                    {accountError && (
                        <p className="t-caption text-[var(--error)]">{accountError}</p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={isExporting || isDeleting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--border-1)] text-[var(--text-1)] hover:bg-[var(--bg-2)] transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {t("settings.exportData")}
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting || isExporting}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--error)] focus-visible:outline-none ${
                            deleteArmed
                                ? "bg-[var(--error)] text-white border-[var(--error)]"
                                : "border-[var(--error)]/40 text-[var(--error)] hover:bg-[var(--error)]/10"
                        }`}
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        {deleteArmed ? t("settings.deleteConfirmAction") : t("settings.deleteAccount")}
                    </button>
                </div>
            </motion.div>

            {/* ─── Footer ─── */}
            <motion.div variants={fadeUp} className="text-center py-8 space-y-3">
                <button
                    onClick={handleLogout}
                    className="text-[11px] font-mono-tech font-bold tracking-widest text-[var(--text-2)] hover:text-[var(--text-0)] hover:bg-[var(--bg-2)] px-4 py-2 rounded-lg transition-all flex items-center gap-2 mx-auto border border-transparent hover:border-[var(--border-2)]">
                    <LogOut className="w-3.5 h-3.5" />
                    {t("settings.logout")}
                </button>
                <p className="t-label uppercase text-[var(--text-3)] opacity-60">
                    Odyssey <span className="text-[var(--text-2)] ml-1">v0.1</span>
                </p>
            </motion.div>
        </motion.div>
    );
}
