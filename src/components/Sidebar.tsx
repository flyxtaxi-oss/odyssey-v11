"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Globe, Users, LayoutDashboard, Settings, ChevronLeft, ChevronRight, Search, LogOut, Loader2, MessageSquare, Target, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/firebase";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, shortcut: "1", color: "#2563EB" },
    { href: "/jarvis", label: "J.A.R.V.I.S.", icon: Brain, shortcut: "2", color: "#7C3AED" },
    { href: "/simulator", label: "Simulateur", icon: Globe, shortcut: "3", color: "#10B981" },
    { href: "/simulator/predict", label: "Prédire", icon: Sparkles, shortcut: "P", color: "#8B5CF6" },
    { href: "/visa", label: "Visa Tracker", icon: Shield, shortcut: "4", color: "#059669" },
    { href: "/safezone", label: "Safe-Zone", icon: Users, shortcut: "5", color: "#F43F5E" },
    { href: "/language", label: "Language Lab", icon: MessageSquare, shortcut: "6", color: "#0EA5E9" },
    { href: "/skills", label: "Skills", icon: Target, shortcut: "7", color: "#F97316" },
    { href: "/settings", label: "Réglages", icon: Settings, shortcut: "8", color: "#94A3B8" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Handle logout
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Get user initials
    const getUserInitials = () => {
        if (user?.displayName) {
            return user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return "U";
    };

    // Get user display name
    const getUserName = () => {
        if (user?.displayName) return user.displayName;
        if (user?.email) return user.email.split("@")[0];
        return "Utilisateur";
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 280 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-4 top-4 bottom-4 z-50 flex flex-col sidebar-glass rounded-3xl overflow-hidden"
            style={{
                height: "calc(100vh - 32px)",
            }}
        >
            {/* Logo area */}
            <div className="flex items-center gap-3 px-5 h-[72px] shrink-0 border-b border-[var(--border-0)]">
                <motion.div
                    className="shrink-0"
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'var(--gradient-blue-purple)',
                        boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
                    }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                />
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col justify-center"
                        >
                            <h1 className="text-[16px] font-extrabold tracking-tight text-[var(--text-0)] leading-none flex items-center gap-0.5">
                                <span>ODYSSEY</span>
                                <span className="text-gradient-shimmer">.AI</span>
                            </h1>
                            <p className="text-[10px] tracking-[0.15em] uppercase font-semibold text-[var(--text-3)] mt-1.5">
                                Life Operating System
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Search */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 mt-5 mb-2"
                    >
                        <div className="input-sci-fi flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer">
                            <Search className="w-4 h-4 text-[var(--text-3)]" />
                            <span className="text-[13px] text-[var(--text-3)] flex-1">Rechercher...</span>
                            <span className="tag-cyber">⌘K</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scroll mt-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "relative flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-300 group",
                                    isActive
                                        ? "text-[var(--text-0)]"
                                        : "text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[rgba(148,163,184,0.05)]"
                                )}
                            >
                                {/* Active background */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active-v9"
                                        className="absolute inset-0 rounded-2xl"
                                        style={{
                                            background: `linear-gradient(90deg, ${item.color}20, transparent)`,
                                            borderLeft: `3px solid ${item.color}`,
                                        }}
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}

                                <div className="relative z-10 flex items-center gap-3 flex-1 px-1">
                                    <item.icon
                                        className={cn(
                                            "w-[18px] h-[18px] shrink-0 transition-all duration-300",
                                        )}
                                        style={{ color: isActive ? item.color : undefined }}
                                    />
                                    <AnimatePresence>
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -5 }}
                                                className="text-[13px] font-semibold flex-1 tracking-wide"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Profile & Toggle */}
            <div className="p-4 shrink-0 border-t border-[var(--border-0)]">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-[var(--text-3)]" />
                    </div>
                ) : user ? (
                    <>
                        <div className="flex items-center gap-3 p-2 rounded-2xl group">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                                <span className="relative z-10 text-white">{getUserInitials()}</span>
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[var(--bg-1)]" />
                            </div>
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex-1 min-w-0"
                                    >
                                        <p className="text-[14px] font-bold text-[var(--text-0)] truncate leading-tight">{getUserName()}</p>
                                        <p className="text-[11px] text-[var(--accent-indigo)] truncate mt-0.5 font-semibold">Membre</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Logout button */}
                        {!collapsed && (
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full mt-2 flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all hover:bg-[rgba(239,68,68,0.1)] text-[var(--text-3)] hover:text-red-400 border border-transparent hover:border-red-400/20"
                            >
                                {isLoggingOut ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-[12px] font-medium">Déconnexion</span>
                                    </>
                                )}
                            </button>
                        )}
                    </>
                ) : (
                    <Link href="/login">
                        <div className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer hover:bg-[rgba(37,99,235,0.1)] transition-all border border-transparent hover:border-blue-500/20">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 bg-gradient-to-br from-blue-600 to-purple-600"
                            >
                                <span className="text-white">?</span>
                            </div>
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex-1 min-w-0"
                                    >
                                        <p className="text-[14px] font-bold text-[var(--text-0)] truncate leading-tight">Connexion</p>
                                        <p className="text-[11px] text-blue-400 truncate mt-0.5 font-semibold">Se connecter</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Link>
                )}

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full mt-3 flex items-center justify-center p-2.5 rounded-xl transition-all hover:bg-[rgba(148,163,184,0.05)] text-[var(--text-3)] hover:text-[var(--text-1)] border border-transparent hover:border-[var(--border-0)]"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>
        </motion.aside>
    );
}
