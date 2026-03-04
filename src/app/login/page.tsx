"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        // Simulate auth (replace with real Supabase auth when configured)
        await new Promise((r) => setTimeout(r, 1500));

        setMessage(
            mode === "login"
                ? "🔑 Connexion simulée — Ajoutez vos clés Supabase dans .env.local"
                : "✅ Inscription simulée — Ajoutez vos clés Supabase dans .env.local"
        );
        setIsLoading(false);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-0)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Aurora background effect */}
            <div
                style={{
                    position: "absolute",
                    top: "-30%",
                    left: "-10%",
                    width: "60%",
                    height: "60%",
                    background:
                        "radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)",
                    filter: "blur(80px)",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "-20%",
                    right: "-10%",
                    width: "50%",
                    height: "50%",
                    background:
                        "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)",
                    filter: "blur(80px)",
                    pointerEvents: "none",
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                style={{
                    width: "100%",
                    maxWidth: 440,
                    padding: "48px 40px",
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 24,
                    backdropFilter: "blur(20px)",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 16,
                        }}
                    >
                        <Sparkles size={28} color="white" />
                    </motion.div>
                    <h1
                        style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: "var(--text-0)",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        ODYSSEY
                        <span style={{ color: "#2563EB" }}>.AI</span>
                    </h1>
                    <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 4 }}>
                        {mode === "login"
                            ? "Connectez-vous à votre univers"
                            : "Créez votre compte Odyssey"}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--text-2)",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                display: "block",
                                marginBottom: 8,
                            }}
                        >
                            Email
                        </label>
                        <div style={{ position: "relative" }}>
                            <Mail
                                size={18}
                                style={{
                                    position: "absolute",
                                    left: 14,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--text-3)",
                                }}
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vous@exemple.com"
                                required
                                style={{
                                    width: "100%",
                                    padding: "14px 14px 14px 44px",
                                    borderRadius: 12,
                                    border: "1px solid var(--glass-border)",
                                    background: "rgba(255,255,255,0.03)",
                                    color: "var(--text-0)",
                                    fontSize: 15,
                                    outline: "none",
                                    transition: "border 0.2s",
                                    boxSizing: "border-box",
                                }}
                                onFocus={(e) =>
                                    (e.target.style.borderColor = "#2563EB")
                                }
                                onBlur={(e) =>
                                    (e.target.style.borderColor = "var(--glass-border)")
                                }
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: 24 }}>
                        <label
                            style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--text-2)",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                display: "block",
                                marginBottom: 8,
                            }}
                        >
                            Mot de passe
                        </label>
                        <div style={{ position: "relative" }}>
                            <Lock
                                size={18}
                                style={{
                                    position: "absolute",
                                    left: 14,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--text-3)",
                                }}
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: "100%",
                                    padding: "14px 44px 14px 44px",
                                    borderRadius: 12,
                                    border: "1px solid var(--glass-border)",
                                    background: "rgba(255,255,255,0.03)",
                                    color: "var(--text-0)",
                                    fontSize: 15,
                                    outline: "none",
                                    transition: "border 0.2s",
                                    boxSizing: "border-box",
                                }}
                                onFocus={(e) =>
                                    (e.target.style.borderColor = "#2563EB")
                                }
                                onBlur={(e) =>
                                    (e.target.style.borderColor = "var(--glass-border)")
                                }
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: 14,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "var(--text-3)",
                                    padding: 0,
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            width: "100%",
                            padding: "14px 24px",
                            borderRadius: 12,
                            border: "none",
                            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                            color: "white",
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: isLoading ? "wait" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            opacity: isLoading ? 0.7 : 1,
                            transition: "opacity 0.2s",
                        }}
                    >
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles size={18} />
                            </motion.div>
                        ) : (
                            <>
                                {mode === "login" ? "Se connecter" : "Créer mon compte"}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Message */}
                {message && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            marginTop: 16,
                            padding: "12px 16px",
                            borderRadius: 10,
                            background: "rgba(37,99,235,0.1)",
                            border: "1px solid rgba(37,99,235,0.2)",
                            color: "#60A5FA",
                            fontSize: 13,
                            textAlign: "center",
                        }}
                    >
                        {message}
                    </motion.p>
                )}

                {/* Toggle */}
                <p
                    style={{
                        textAlign: "center",
                        marginTop: 24,
                        fontSize: 14,
                        color: "var(--text-2)",
                    }}
                >
                    {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
                    <button
                        onClick={() => setMode(mode === "login" ? "signup" : "login")}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#2563EB",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 14,
                        }}
                    >
                        {mode === "login" ? "S'inscrire" : "Se connecter"}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
