"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { signIn, signUp, onAuthChange, type AuthResult } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            if (user) router.push("/");
        });
        return () => unsubscribe();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            let result: AuthResult;
            if (mode === "login") {
                result = await signIn(email, password);
            } else {
                result = await signUp(email, password);
            }

            if (result.error) {
                setMessage({ type: "error", text: result.message });
            } else {
                setMessage({ type: "success", text: result.message });
                setTimeout(() => router.push("/"), 1000);
            }
        } catch {
            setMessage({ type: "error", text: "Une erreur inattendue est survenue." });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === "login" ? "signup" : "login");
        setMessage(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "var(--bg-0)" }}>
            {/* Aurora background effects */}
            <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)", filter: "blur(80px)" }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)", filter: "blur(80px)" }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="glass-panel w-full max-w-[440px] p-12 relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-9">
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-14 h-14 rounded-full inline-flex items-center justify-center mb-4"
                        style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
                    >
                        <Sparkles size={28} color="white" />
                    </motion.div>
                    <h1 className="text-[28px] font-extrabold tracking-tight" style={{ color: "var(--text-0)" }}>
                        ODYSSEY<span style={{ color: "#2563EB" }}>.AI</span>
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
                        {mode === "login" ? "Connectez-vous à votre univers" : "Créez votre compte Odyssey"}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-2)" }}>
                            Email
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vous@exemple.com"
                                required
                                disabled={isLoading}
                                className="input-sci-fi w-full py-3.5 pl-11 pr-4 text-[15px] outline-none"
                                style={{ opacity: isLoading ? 0.7 : 1 }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-2)" }}>
                            Mot de passe
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                disabled={isLoading}
                                className="input-sci-fi w-full py-3.5 pl-11 pr-11 text-[15px] outline-none"
                                style={{ opacity: isLoading ? 0.7 : 1 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0"
                                style={{ color: "var(--text-3)" }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {mode === "signup" && (
                            <p className="text-[11px] mt-1.5" style={{ color: "var(--text-3)" }}>Minimum 6 caractères</p>
                        )}
                    </div>

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className="w-full py-3.5 rounded-xl border-none text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-opacity"
                        style={{
                            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                            cursor: isLoading ? "wait" : "pointer",
                            opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        {isLoading ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 px-4 py-3 rounded-xl text-sm text-center flex items-center justify-center gap-2"
                        style={{
                            background: message.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                            border: `1px solid ${message.type === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                            color: message.type === "success" ? "#34D399" : "#F87171",
                        }}
                    >
                        {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                    </motion.div>
                )}

                {/* Toggle */}
                <p className="text-center mt-6 text-sm" style={{ color: "var(--text-2)" }}>
                    {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
                    <button
                        onClick={toggleMode}
                        disabled={isLoading}
                        className="bg-transparent border-none font-semibold text-sm"
                        style={{ color: "#2563EB", cursor: isLoading ? "wait" : "pointer", opacity: isLoading ? 0.7 : 1 }}
                    >
                        {mode === "login" ? "S'inscrire" : "Se connecter"}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
