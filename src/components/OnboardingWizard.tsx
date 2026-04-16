"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Phase = "intro" | "location" | "financial" | "goals" | "analyzing" | "complete";

interface Message {
  id: string;
  sender: "jarvis" | "user";
  text: string;
}

export default function OnboardingWizard() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll aux nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Initialisation de la conversation
  useEffect(() => {
    simulateJarvisTyping(
      "Bonjour. Je suis J.A.R.V.I.S., l'intelligence centrale d'Odyssey. Je vais configurer ton espace personnel. Pour commencer, où te trouves-tu actuellement ?",
      "location"
    );
  }, []);

  const simulateJarvisTyping = (text: string, nextPhase: Phase, delay: number = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "jarvis", text }]);
      setPhase(nextPhase);
    }, delay);
  };

  const handleUserReply = (text: string, currentPhase: Phase) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text }]);
    
    switch (currentPhase) {
      case "location":
        simulateJarvisTyping(
          "C'est noté. Pour analyser les meilleurs visas (D7, NHR, Digital Nomad), j'ai besoin d'une estimation de ton revenu mensuel et de ton statut (Freelance, Salarié, Entrepreneur).",
          "financial"
        );
        break;
      case "financial":
        simulateJarvisTyping(
          "Parfait, ces données restent strictement chiffrées de bout en bout. Dernière question : quel est ton objectif numéro un pour cette expatriation ?",
          "goals"
        );
        break;
      case "goals":
        setPhase("analyzing");
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setPhase("complete");
        }, 2500);
        break;
    }
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-2xl mx-auto bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800/50">
      {/* Header Premium */}
      <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
          </div>
          <span className="text-slate-200 font-semibold tracking-wide">J.A.R.V.I.S. SETUP</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">ODYSSEY OS v11</span>
      </div>

      {/* Espace Chat */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
              msg.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm",
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && phase !== "analyzing" && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-700/50 flex space-x-1.5 items-center h-[44px]">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        {/* The "Aha Moment" / Loading State */}
        {phase === "analyzing" && (
          <div className="flex flex-col items-center justify-center mt-10 space-y-4 animate-in fade-in duration-500">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium animate-pulse">JARVIS génère ton Blueprint d'expatriation...</p>
          </div>
        )}

        {/* Result Card (Final Step) */}
        {phase === "complete" && (
          <div className="w-full bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-500">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">⚡</span>
              <h3 className="text-lg font-bold text-white">Analyse Express Terminée</h3>
            </div>
            <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
              Basé sur ton profil, voici ton top match immédiat. Ton simulateur complet vient d'être débloqué.
            </p>
            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Destination Recommandée</span>
                <span className="text-white font-bold flex items-center gap-2">🇵🇹 Lisbonne (85% Match)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Visa Optimal</span>
                <span className="text-emerald-400 font-medium">Digital Nomad (D8)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Gain Fiscal Estimé</span>
                <span className="text-indigo-400 font-bold">~25% d'économie</span>
              </div>
            </div>
            <button className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25">
              Ouvrir mon Life OS
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Quick Replies for UX speed) */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        {phase === "location" && !isTyping && (
          <div className="flex gap-2 flex-wrap">
            {["🇫🇷 Paris", "🇨🇦 Montréal", "🇧🇪 Bruxelles", "Ailleurs"].map((loc) => (
              <button key={loc} onClick={() => handleUserReply(`Je suis à ${loc}`, phase)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-full border border-slate-700 transition-colors">
                {loc}
              </button>
            ))}
          </div>
        )}
        {phase === "financial" && !isTyping && (
          <div className="flex gap-2 flex-wrap">
            {["Freelance (~4k€)", "Salarié (~3k€)", "Entrepreneur", "Autre"].map((fin) => (
              <button key={fin} onClick={() => handleUserReply(fin, phase)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-full border border-slate-700 transition-colors">
                {fin}
              </button>
            ))}
          </div>
        )}
        {phase === "goals" && !isTyping && (
          <div className="flex gap-2 flex-wrap">
            {["Optimisation Fiscale", "Qualité de vie & Météo", "Réseau & Business"].map((goal) => (
              <button key={goal} onClick={() => handleUserReply(goal, phase)} className="px-4 py-2 bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-300 text-sm rounded-full border border-indigo-700/50 transition-colors">
                {goal}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}