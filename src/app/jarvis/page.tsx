"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Brain, User, Volume2, Copy, Check, Sparkles } from "lucide-react";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    persona?: string;
};

const personas = [
    { id: "sage", emoji: "🧘", label: "Sage", color: "var(--text-2)", desc: "Introspection" },
    { id: "strategist", emoji: "⚡", label: "Stratège", color: "var(--primary)", desc: "Analyse" },
    { id: "coach", emoji: "🔥", label: "Coach", color: "var(--tertiary)", desc: "Motivation" },
    { id: "executor", emoji: "🎯", label: "Exécuteur", color: "var(--success)", desc: "Action" },
    { id: "friend", emoji: "🤝", label: "Ami", color: "var(--secondary)", desc: "Empathie" },
];

export default function JarvisPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Système J.A.R.V.I.S. initialisé.\n\nPrêt pour la synchronisation. Quelle est votre priorité aujourd'hui ?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activePersona, setActivePersona] = useState("strategist");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/jarvis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
                    persona: activePersona,
                }),
            });

            if (!res.ok) throw new Error("API error");

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            const assistantId = (Date.now() + 1).toString();
            let fullText = "";

            setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    fullText += chunk;
                    const cleaned = fullText.replace(/^0:"|"$/gm, "").replace(/\\n/g, "\n").replace(/\\"/g, '"');
                    setMessages((prev) =>
                        prev.map((m) => (m.id === assistantId ? { ...m, content: cleaned } : m))
                    );
                }
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "assistant", content: "⚠️ Erreur de connexion. Vérifiez votre configuration API." },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, activePersona]);

    const toggleVoice = () => {
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
        setIsListening(!isListening);
        if (!isListening) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const r = new SR();
            r.lang = "fr-FR";
            r.interimResults = false;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            r.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
            r.onerror = () => setIsListening(false);
            r.onend = () => setIsListening(false);
            r.start();
        }
    };

    const speak = (text: string) => {
        const u = new SpeechSynthesisUtterance(text.replace(/\*\*/g, "").replace(/\n/g, ". ").replace(/>/g, ""));
        u.lang = "fr-FR"; u.rate = 1.05;
        window.speechSynthesis.speak(u);
    };

    const copyText = (id: string, text: string) => {
        navigator.clipboard.writeText(text.replace(/\*\*/g, ""));
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const currentPersona = personas.find((p) => p.id === activePersona)!;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-80px)] flex flex-col pt-2 max-w-4xl mx-auto w-full">
            {/* ─── Top Bar ─── */}
            <div className="flex items-center justify-between py-4 mb-2 border-b border-[var(--border-0)]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center shrink-0 rounded-xl"
                        style={{
                            width: 44, height: 44,
                            background: 'var(--bg-2)',
                            border: '1px solid var(--border-1)',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}>
                        <Brain className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div>
                        <h1 className="text-[18px] font-semibold text-[var(--text-0)] tracking-wide font-display">J.A.R.V.I.S.</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-2)]" />
                            <span className="text-[11px] text-[var(--text-3)] font-medium uppercase tracking-wider font-label">
                                Module: {currentPersona.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Persona tabs */}
                <div className="flex gap-1 p-1 bg-[var(--bg-1)] border border-[var(--border-0)] rounded-xl">
                    {personas.map((p) => (
                        <motion.button
                            key={p.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActivePersona(p.id)}
                            className="relative w-9 h-9 flex items-center justify-center text-sm transition-all rounded-lg"
                            title={`${p.label} — ${p.desc}`}
                        >
                            {activePersona === p.id && (
                                <motion.div
                                    layoutId="persona-bg-v7"
                                    className="absolute inset-0 rounded-lg"
                                    style={{ background: 'var(--bg-3)', border: `1px solid var(--border-1)` }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 grayscale-[50%] opacity-90 hover:grayscale-0 transition-all">{p.emoji}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* ─── Messages ─── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 py-6 pr-2 custom-scroll">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                        const msgP = personas.find((p) => p.id === msg.persona);
                        const isUser = msg.role === "user";
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}
                            >
                                {/* Avatar */}
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm`}
                                    style={{
                                        background: isUser ? "var(--bg-3)" : "var(--bg-1)",
                                        border: "1px solid var(--border-1)",
                                    }}
                                >
                                    {isUser ? (
                                        <User className="w-4 h-4 text-[var(--text-2)]" />
                                    ) : (
                                        <span>{msgP?.emoji || "🧠"}</span>
                                    )}
                                </div>

                                {/* Bubble */}
                                <div
                                    className={`group max-w-[80%] px-5 py-3.5 text-[15px] leading-relaxed relative ${isUser ? "rounded-2xl rounded-tr-[4px]" : "rounded-2xl rounded-tl-[4px]"
                                        }`}
                                    style={
                                        isUser
                                            ? {
                                                background: "var(--text-0)",
                                                color: "var(--bg-0)",
                                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                            }
                                            : {
                                                background: "var(--bg-1)",
                                                color: "var(--text-1)",
                                                border: "1px solid var(--border-0)",
                                            }
                                    }
                                >
                                    {msg.content.split("\n").map((line, i) => {
                                        if (line.trim() === "") return <div key={i} className="h-2" />;
                                        if (line.startsWith(">")) {
                                            return <p key={i} className="text-[var(--text-2)] font-mono text-[12px] mb-1 tracking-wide">{line}</p>;
                                        }
                                        return (
                                            <p key={i} className={`mb-1 ${isUser ? "font-medium" : "font-normal"}`}>
                                                {line.split("**").map((part, j) =>
                                                    j % 2 === 1 ? <strong key={j} className={`font-semibold ${isUser ? "text-var(--bg-0)" : "text-white"}`}>{part}</strong> : part
                                                )}
                                            </p>
                                        );
                                    })}

                                    {/* Actions */}
                                    {!isUser && (
                                        <div className="flex items-center gap-2 mt-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => speak(msg.content)} className="p-1.5 rounded-md hover:bg-[var(--bg-3)] transition-colors text-[var(--text-3)] hover:text-[var(--text-1)]" title="Écouter">
                                                <Volume2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => copyText(msg.id, msg.content)} className="p-1.5 rounded-md hover:bg-[var(--bg-3)] transition-colors text-[var(--text-3)] hover:text-[var(--text-1)]" title="Copier">
                                                {copiedId === msg.id
                                                    ? <Check className="w-4 h-4 text-green-400" />
                                                    : <Copy className="w-4 h-4" />
                                                }
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Typing indicator */}
                {isLoading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-[var(--bg-1)] border border-[var(--border-1)]"
                        >
                            {currentPersona.emoji}
                        </div>
                        <div className="px-5 py-4 rounded-2xl rounded-tl-[4px] bg-[var(--bg-1)] border border-[var(--border-0)] flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-[var(--text-3)] animate-pulse" />
                            <div className="flex items-center gap-1.5 ml-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-[var(--text-3)]"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ─── Input Bar ─── */}
            <div className="pt-2 pb-6">
                <div
                    className="flex flex-col bg-[var(--bg-1)] border border-[var(--border-1)] rounded-2xl transition-all duration-300 overflow-hidden"
                    style={{
                        boxShadow: input.trim() ? "0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)" : "0 2px 10px rgba(0,0,0,0.2)",
                    }}
                >
                    <div className="flex items-end gap-2 p-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleVoice}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500/10 text-red-500' : 'text-[var(--text-2)] hover:text-white hover:bg-[var(--bg-3)]'}`}
                        >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </motion.button>

                        <textarea
                            ref={inputRef as any}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={isListening ? "Enregistrement vocal..." : "Message Jarvis..."}
                            className="flex-1 bg-transparent max-h-32 min-h-[40px] py-2.5 text-[15px] outline-none placeholder:text-[var(--text-3)] text-[var(--text-0)] resize-none"
                            style={{ height: input ? 'auto' : '40px' }}
                            rows={1}
                        />

                        <div className="flex items-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${input.trim() ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[var(--bg-0)] shadow-[0_4px_15px_rgba(143,245,255,0.25)]' : 'bg-[var(--bg-3)] text-[var(--text-3)]'}`}
                            >
                                <Send className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center mt-3">
                    <p className="text-[11px] text-[var(--text-3)] font-medium">
                        J.A.R.V.I.S. peut faire des erreurs. Vérifiez les informations critiques.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

