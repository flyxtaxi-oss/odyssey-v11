"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, X, Terminal, Loader2, CheckCircle2, WifiOff } from "lucide-react";
import { useOfflineDB, offlineDB } from "@/lib/offline-db";

export default function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "thinking" | "executing" | "success" | "offline">("idle");
  const [response, setResponse] = useState<string | null>(null);
  
  const { isOnline } = useOfflineDB();
  const inputRef = useRef<HTMLInputElement>(null);

  // Écoute du raccourci clavier (Cmd + J ou Ctrl + J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus sur l'input quand on l'ouvre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!isOnline) {
      setStatus("offline");
      setResponse("Vous êtes hors-ligne. L'action a été mise en file d'attente et sera exécutée dès votre reconnexion.");
      await offlineDB.addToSyncQueue("agent", "create", { prompt: query });
      return;
    }

    setStatus("thinking");
    setResponse(null);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query })
      });
      
      const data = await res.json();
      
      if (data.actionExecuted) {
        setStatus("executing");
        setResponse(`Exécution de l'outil : ${data.tool}...`);
        setTimeout(() => {
          setStatus("success");
          setResponse(data.reply || "Action exécutée avec succès.");
          setQuery("");
        }, 1500);
      } else {
        setStatus("success");
        setResponse(data.reply || "J'ai bien noté votre demande.");
        setQuery("");
      }
    } catch (error) {
      setStatus("idle");
      setResponse("❌ Impossible de joindre les serveurs J.A.R.V.I.S.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="bg-slate-900 border border-slate-700 shadow-2xl shadow-indigo-500/10 rounded-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
              {status === "thinking" || status === "executing" ? (
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              ) : status === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : status === "offline" ? (
                <WifiOff className="w-5 h-5 text-amber-400" />
              ) : (
                <Brain className="w-5 h-5 text-indigo-500" />
              )}
              <span className="text-sm font-semibold text-slate-300">
                J.A.R.V.I.S. Command Center <span className="text-slate-600 font-mono ml-2">Cmd + J</span>
              </span>
              <button onClick={() => setIsOpen(false)} className="ml-auto p-1 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-2 relative">
              <Terminal className="absolute left-6 top-6 w-5 h-5 text-slate-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Demandez-moi de planifier un vol, réserver un dîner ou traduire un document..."
                className="w-full bg-transparent text-white placeholder-slate-500 pl-12 pr-14 py-4 text-lg outline-none focus:ring-0"
                disabled={status === "thinking" || status === "executing"}
              />
              <button 
                type="submit" 
                disabled={!query.trim() || status === "thinking" || status === "executing"}
                className="absolute right-4 top-4 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <AnimatePresence>
              {response && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="bg-slate-800/50 border-t border-slate-800 p-4">
                  <p className={`text-sm ${status === "offline" ? "text-amber-400" : "text-emerald-400"} flex items-center gap-2`}>
                    {response}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}