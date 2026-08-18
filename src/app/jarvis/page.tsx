"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  MicOff,
  Brain,
  User,
  Volume2,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Compass,
  Zap,
  Target,
  Flame,
  HeartHandshake,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  persona?: string;
  timestamp?: string;
};

const personas = [
  {
    id: "strategist",
    emoji: "⚡",
    label: "Stratège",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9, #2563EB)",
    desc: "Fiscalité, visas, arbitrage de pays et plans d'action ROI",
    icon: Compass,
    starters: [
      "Simuler mon expatriation : Portugal (NHR) vs Dubaï (0%)",
      "Plan d'action chronologique pour quitter la France en 90 jours",
      "Optimisation fiscale pour freelance réalisant 80k€/an",
    ],
  },
  {
    id: "sage",
    emoji: "🧘",
    label: "Sage",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    desc: "Introspection, clarté mentale et frameworks de décision",
    icon: Brain,
    starters: [
      "Matrice de décision : suis-je vraiment prêt à partir ?",
      "Comment surmonter le syndrome de l'imposteur avant un grand départ ?",
      "First Principles : quel est le but profond de mon changement de vie ?",
    ],
  },
  {
    id: "coach",
    emoji: "🔥",
    label: "Coach",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899, #DB2777)",
    desc: "Motivation, protocoles de performance et discipline nomade",
    icon: Flame,
    starters: [
      "Créer ma routine de productivité maximale en décalage horaire",
      "Définir mes 3 objectifs prioritaires non-négociables pour ce mois",
      "Protocole anti-procrastination pour boucler mes démarches administratives",
    ],
  },
  {
    id: "executor",
    emoji: "🎯",
    label: "Exécuteur",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    desc: "Systèmes, checklists d'installation et logistique sans friction",
    icon: Target,
    starters: [
      "Checklist exhaustive des démarches bancaires et fiscales avant départ",
      "Comparatif des documents requis pour un visa D8 vs visa DTV",
      "Procédure de résiliation des abonnements et bail en France",
    ],
  },
  {
    id: "friend",
    emoji: "🤝",
    label: "Ami",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
    desc: "Écoute bienveillante, perspective humaine et réseau",
    icon: HeartHandshake,
    starters: [
      "Comment se faire un cercle d'amis et un réseau dès l'arrivée ?",
      "Gérer le sentiment de solitude ou le dépaysement des premières semaines",
      "Conseils pour maintenir le lien avec ses proches restés en France",
    ],
  },
];

export default function JarvisPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "**Système J.A.R.V.I.S. initialisé.**\n\nPrêt pour la synchronisation. Je suis votre copilote d'expatriation et d'optimisation de vie. Quelle est votre priorité aujourd'hui ?",
      timestamp: "Maintenant",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activePersona, setActivePersona] = useState("strategist");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const currentPersona = useMemo(
    () => personas.find((p) => p.id === activePersona) || personas[0],
    [activePersona]
  );

  const handleSend = useCallback(
    async (textToSend?: string) => {
      const messageText = (textToSend || input).trim();
      if (!messageText || isLoading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      try {
        const res = await apiFetch("/api/jarvis", {
          method: "POST",
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            persona: activePersona,
          }),
        });

        const isConfigNotice = res.status === 503 && res.headers.get("X-AI-Configured") === "false";
        if (!res.ok && !isConfigNotice) throw new Error("API error");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        const assistantId = (Date.now() + 1).toString();
        let fullText = "";

        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            persona: activePersona,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsStreaming(true);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            const cleaned = fullText
              .replace(/^0:"|"$/gm, "")
              .replace(/\\n/g, "\n")
              .replace(/\\"/g, '"');
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: cleaned } : m))
            );
          }
        }
        setIsStreaming(false);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "⚠️ **Erreur de communication.** J.A.R.V.I.S. fonctionne en mode local ou requiert la configuration de clés API (Anthropic ou Google AI). Vous pouvez continuer à poser des questions ou explorer les guides.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, activePersona]
  );

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
      r.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      r.onerror = () => setIsListening(false);
      r.onend = () => setIsListening(false);
      r.start();
    }
  };

  const speak = (id: string, text: string) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
      text.replace(/\*\*/g, "").replace(/```[\s\S]*?```/g, "").replace(/\n/g, ". ").replace(/>/g, "")
    );
    u.lang = "fr-FR";
    u.rate = 1.05;
    u.onend = () => setSpeakingId(null);
    u.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(u);
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text.replace(/\*\*/g, ""));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `**Session réinitialisée avec le module ${currentPersona.label}.**\n\nComment puis-je vous accompagner ?`,
        timestamp: "Maintenant",
      },
    ]);
    setShowClearConfirm(false);
  };

  return (
    <motion.div
      lang="fr"
      dir="ltr"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-100px)] flex flex-col pt-1 max-w-5xl mx-auto w-full relative"
    >
      {/* ─── Top Bar ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 mb-2 border-b border-[var(--border-0)]">
        <div className="flex items-center gap-3.5">
          <div
            className="flex items-center justify-center shrink-0 rounded-2xl p-2.5 text-white shadow-lg transition-transform hover:scale-105"
            style={{
              background: currentPersona.gradient,
              boxShadow: `0 4px 20px ${currentPersona.color}35`,
            }}
          >
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[var(--text-0)] tracking-tight font-display">
                J.A.R.V.I.S.
              </h1>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
                FLAGSHIP AI
              </span>
            </div>
            <p className="text-xs text-[var(--text-3)] mt-0.5 font-medium">{currentPersona.desc}</p>
          </div>
        </div>

        {/* Persona Selector & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex gap-1 p-1 bg-[var(--bg-1)] border border-[var(--border-1)] rounded-2xl shadow-sm overflow-x-auto custom-scroll">
            {personas.map((p) => {
              const isActive = activePersona === p.id;
              return (
                <motion.button
                  key={p.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActivePersona(p.id)}
                  className={`relative px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold transition-all rounded-xl ${
                    isActive ? "text-white" : "text-[var(--text-2)] hover:text-[var(--text-0)]"
                  }`}
                  title={`${p.label} — ${p.desc}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="persona-active-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: p.gradient }}
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 text-sm">{p.emoji}</span>
                  <span className="relative z-10 hidden md:inline">{p.label}</span>
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2.5 rounded-xl border border-[var(--border-0)] bg-[var(--bg-1)] text-[var(--text-3)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Réinitialiser la conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Clear Confirm Modal ─── */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 rounded-3xl"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-panel p-6 max-w-sm w-full rounded-2xl border border-[var(--border-1)] text-center space-y-4"
            >
              <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold text-[var(--text-0)]">Effacer l&apos;historique ?</h3>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                Cette action réinitialise les messages de la session active pour repartir sur une base neutre.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--bg-2)] text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text-0)]"
                >
                  Annuler
                </button>
                <button
                  onClick={handleClearChat}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Messages Viewport ─── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 py-4 pr-2 custom-scroll scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const msgP = personas.find((p) => p.id === msg.persona) || currentPersona;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-sm shadow-md transition-transform ${
                    isUser
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                      : "bg-[var(--bg-2)] border border-[var(--border-1)] text-white"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <span>{msgP.emoji}</span>}
                </div>

                {/* Message Bubble */}
                <div
                  className={`group max-w-[85%] sm:max-w-[78%] px-5 py-4 text-[15px] leading-relaxed relative rounded-2xl shadow-sm ${
                    isUser
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-indigo-500/10"
                      : "glass-panel border border-[var(--border-1)] text-[var(--text-1)] rounded-tl-sm"
                  }`}
                >
                  {/* Persona Indicator on Assistant messages */}
                  {!isUser && msg.persona && (
                    <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[var(--border-0)] text-[11px] font-bold text-[var(--primary)] uppercase font-mono">
                      <span>{msgP.emoji}</span>
                      <span>Module {msgP.label}</span>
                    </div>
                  )}

                  <MarkdownRenderer content={msg.content} isUser={isUser} />

                  {/* Actions (TTS, Copy, Timestamp) */}
                  {!isUser && msg.content && (
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[var(--border-0)] text-xs text-[var(--text-3)]">
                      <span className="text-[11px] font-mono">{msg.timestamp || "J.A.R.V.I.S."}</span>
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => speak(msg.id, msg.content)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            speakingId === msg.id
                              ? "bg-[var(--primary)] text-black font-bold"
                              : "hover:bg-[var(--bg-3)] hover:text-[var(--text-1)]"
                          }`}
                          title="Écouter la synthèse vocale"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => copyText(msg.id, msg.content)}
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-3)] hover:text-[var(--text-1)] transition-colors"
                          title="Copier le texte"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Streaming / Loading Indicator */}
        {isLoading && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3.5"
          >
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-sm bg-[var(--bg-2)] border border-[var(--border-1)]">
              {currentPersona.emoji}
            </div>
            <div className="px-5 py-4 rounded-2xl rounded-tl-sm glass-panel border border-[var(--border-1)] flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[var(--primary)] animate-pulse" />
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-xs text-[var(--text-3)] font-mono">Synchronisation neurale...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ─── Starter Prompt Suggestions ─── */}
      {messages.length <= 2 && (
        <div className="py-2">
          <p className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-3)] mb-2 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[var(--primary)]" />
            Suggestions rapides ({currentPersona.label}) :
          </p>
          <div className="flex flex-wrap gap-2">
            {currentPersona.starters.map((starter, i) => (
              <button
                key={i}
                onClick={() => handleSend(starter)}
                className="text-xs px-3.5 py-2 rounded-xl bg-[var(--bg-1)] hover:bg-[var(--bg-2)] border border-[var(--border-1)] text-[var(--text-2)] hover:text-[var(--text-0)] text-left transition-all flex items-center gap-1.5 group"
              >
                <span>{starter}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-3)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Input Bar ─── */}
      <div className="pt-2 pb-3">
        <div
          className="flex flex-col bg-[var(--bg-1)] border border-[var(--border-1)] rounded-2xl transition-all duration-300 overflow-hidden shadow-lg"
          style={{
            borderColor: input.trim() ? "var(--primary)" : undefined,
            boxShadow: input.trim()
              ? "0 8px 30px rgba(0,0,0,0.3), 0 0 20px rgba(14,165,233,0.15)"
              : "0 4px 15px rgba(0,0,0,0.2)",
          }}
        >
          {isListening && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-xs text-red-400 animate-pulse font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Écoute vocale active... Parlez naturellement</span>
            </div>
          )}

          <div className="flex items-end gap-2 p-2.5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleVoice}
              type="button"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "text-[var(--text-2)] hover:text-[var(--text-0)] hover:bg-[var(--bg-2)]"
              }`}
              title={isListening ? "Arrêter l'enregistrement" : "Dictée vocale"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </motion.button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isListening
                  ? "Enregistrement en cours..."
                  : `Posez une question à J.A.R.V.I.S. (${currentPersona.label})...`
              }
              className="flex-1 bg-transparent max-h-32 min-h-[42px] py-2 px-1 text-[15px] outline-none placeholder:text-[var(--text-3)] text-[var(--text-0)] resize-none font-medium leading-relaxed"
              rows={1}
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                input.trim()
                  ? "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg shadow-[var(--primary)]/25"
                  : "bg-[var(--bg-2)] text-[var(--text-3)] cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-[var(--text-3)]">
          <span>Shift + Entrée pour un saut de ligne</span>
          <span>Données indicatives • Vérifiez les conditions officielles</span>
        </div>
      </div>
    </motion.div>
  );
}
