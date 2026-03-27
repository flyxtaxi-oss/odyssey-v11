"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Globe, Users, LayoutDashboard, Settings, ChevronLeft, ChevronRight, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, shortcut: "1", color: "#8ff5ff" },
    { href: "/jarvis", label: "J.A.R.V.I.S.", icon: Brain, shortcut: "2", color: "#ac89ff" },
    { href: "/simulator", label: "Simulateur", icon: Globe, shortcut: "3", color: "#00deec" },
    { href: "/safezone", label: "Safe-Zone", icon: Users, shortcut: "4", color: "#ff59e3" },
    { href: "/settings", label: "Réglages", icon: Settings, shortcut: "5", color: "#a9abb3" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 280 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-50 flex sidebar-glass overflow-hidden
                       bottom-0 left-0 right-0 w-full rounded-t-3xl flex-row h-20 items-center justify-around px-2
                       md:flex-col md:bottom-4 md:left-4 md:top-4 md:rounded-3xl md:w-auto md:h-[calc(100vh-32px)] md:items-stretch md:justify-start md:px-0"
        >
            {/* Logo area - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-3 px-5 h-[72px] shrink-0 border-b border-[var(--border-0)]">
                <motion.div
                    className="shrink-0 flex items-center justify-center"
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8ff5ff, #ac89ff)',
                        boxShadow: '0 0 20px rgba(143, 245, 255, 0.3)'
                    }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                    <Sparkles className="w-4 h-4 text-[#005d63]" />
                </motion.div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col justify-center"
                        >
                            <h1 className="text-[16px] font-extrabold tracking-tight text-[var(--text-0)] leading-none flex items-center gap-0.5 font-display">
                                <span>ODYSSEY</span>
                                <span className="text-shimmer">.AI</span>
                            </h1>
                            <p className="text-[10px] tracking-[0.15em] uppercase font-semibold text-[var(--text-3)] mt-1.5 font-label">
                                Celestial Navigator
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Search - Hidden on mobile */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="hidden md:block px-4 mt-5 mb-2"
                    >
                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer rounded-xl bg-[var(--bg-1)] border border-[var(--border-0)] hover:border-[var(--border-1)] transition-colors">
                            <Search className="w-4 h-4 text-[var(--text-3)]" />
                            <span className="text-[13px] text-[var(--text-3)] flex-1 font-body">Rechercher...</span>
                            <span className="tag-stitch">⌘K</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Nav */}
            <nav className="flex-1 flex flex-row justify-around items-center px-2 py-0 md:flex-col md:justify-start md:px-3 md:py-4 md:space-y-1 overflow-y-auto custom-scroll md:mt-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className="w-full md:w-auto">
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "relative flex flex-col md:flex-row items-center justify-center md:items-center gap-1 md:gap-3 p-2 md:px-3 md:py-3 rounded-2xl cursor-pointer transition-all duration-300 group",
                                    isActive
                                        ? "text-[var(--text-0)]"
                                        : "text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-white/[0.03]"
                                )}
                            >
                                {/* Active background */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active-stitch"
                                        className="absolute inset-0 rounded-2xl hidden md:block"
                                        style={{
                                            background: `linear-gradient(90deg, ${item.color}15, transparent)`,
                                            borderLeft: `3px solid ${item.color}`,
                                            boxShadow: `inset 0 0 20px ${item.color}08`
                                        }}
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}

                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-center md:gap-3 md:flex-1 px-1">
                                    <item.icon
                                        className="w-6 h-6 md:w-[18px] md:h-[18px] shrink-0 transition-all duration-300"
                                        style={{ color: isActive ? item.color : undefined }}
                                    />
                                    {/* Mobile Label */}
                                    <span className={cn("text-[10px] md:hidden mt-0.5 font-label", isActive ? "text-[var(--text-0)] font-semibold" : "text-[var(--text-3)]")}>
                                        {item.label}
                                    </span>
                                    {/* Desktop Label */}
                                    <AnimatePresence>
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -5 }}
                                                className="hidden md:block text-[13px] font-semibold flex-1 tracking-wide font-body"
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

            {/* Bottom Profile & Toggle - Hidden on mobile */}
            <div className="hidden md:block p-4 shrink-0 border-t border-[var(--border-0)]">
                <div className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer hover:bg-white/[0.03] transition-all group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8ff5ff] to-[#ac89ff] opacity-90 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10 text-[#005d63] font-display font-bold">J</span>
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--success)] border-2 border-[var(--bg-0)]" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 min-w-0"
                            >
                                <p className="text-[14px] font-bold text-[var(--text-0)] truncate leading-tight font-body">Jibril</p>
                                <p className="text-[11px] text-[var(--primary)] truncate mt-0.5 font-semibold font-label">Administrator</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="w-full mt-3 flex items-center justify-center p-2.5 rounded-xl transition-all hover:bg-white/[0.03] text-[var(--text-3)] hover:text-[var(--primary)] border border-transparent hover:border-[var(--border-0)]"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>
        </motion.aside>
    );
}
