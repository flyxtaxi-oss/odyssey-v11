"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Heart,
    MessageCircle,
    Shield,
    Send,
    BadgeCheck,
    AlertTriangle,
    Sparkles,
    MapPin,
    Clock,
    Bookmark,
    MoreHorizontal,
    TrendingUp,
    Loader2,
} from "lucide-react";

type Post = {
    id: string;
    author: string;
    avatar: string;
    badge: string;
    badgeColor: string;
    country: string;
    flag: string;
    content: string;
    likes: number;
    comments: number;
    time: string;
    verified: boolean;
};

// Fallback data if API is unreachable
const FALLBACK_POSTS: Post[] = [
    {
        id: "1", author: "Karim B.", avatar: "K", badge: "Expert Malte", badgeColor: "var(--accent-indigo)",
        country: "Malte", flag: "🇲🇹",
        content: "6 mois après mon arrivée à Malte. **Coût de la vie réel** : 1400€/mois pour un appart correct à Sliema. Internet fibre 50Mbps partout. La communauté tech est petite mais très soudée. AMA dans les comments.",
        likes: 47, comments: 12, time: "Il y a 2h", verified: true,
    },
    {
        id: "2", author: "Sophie L.", avatar: "S", badge: "Exploratrice", badgeColor: "var(--accent-magenta)",
        country: "Portugal", flag: "🇵🇹",
        content: "Update sur le **visa NHR Portugal** : la procédure a changé. Comptez 6-8 semaines au lieu de 4. Passez par un avocat local, ça vaut les 800€. J'ai fait l'erreur de tenter solo, j'ai perdu 2 mois.",
        likes: 89, comments: 23, time: "Il y a 5h", verified: true,
    },
    {
        id: "3", author: "Youssef M.", avatar: "Y", badge: "Mentor Finance", badgeColor: "var(--text-1)",
        country: "Dubaï", flag: "🇦🇪",
        content: "**Mythe vs Réalité** Dubaï :\n\n✅ 0% impôt sur le revenu\n❌ Coût de vie 2x plus élevé que prévu\n✅ Networking incroyable\n❌ Chaleur insoutenable 5 mois/an\n\nBilan : rentable si salaire > 5000€ net.",
        likes: 156, comments: 41, time: "Hier", verified: true,
    },
    {
        id: "4", author: "Léa D.", avatar: "L", badge: "Nouvelle", badgeColor: "var(--text-2)",
        country: "Thaïlande", flag: "🇹🇭",
        content: "Premier mois à Chiang Mai. **600€/mois tout inclus** (coliving + coworking + bouffe). Je gagne 2x plus en remote qu'il ne faut pour vivre. Le seul downside : le décalage horaire pour les calls EU (6h).",
        likes: 72, comments: 18, time: "Il y a 2j", verified: true,
    },
];

function normalizePost(p: Record<string, unknown>): Post {
    const author = p.author as string | { name: string; badge: string; avatar: string };
    const isObj = typeof author === "object" && author !== null;
    return {
        id: p.id as string,
        author: isObj ? (author as { name: string }).name : (author as string),
        avatar: isObj ? (author as { avatar: string }).avatar : ((p.avatar as string) || "?"),
        badge: isObj ? (author as { badge: string }).badge : ((p.badge as string) || "Membre"),
        badgeColor: (p.badgeColor as string) || "var(--text-2)",
        country: (p.country as string) || "",
        flag: (p.flag as string) || "🌍",
        content: p.content as string,
        likes: (p.likes as number) || 0,
        comments: (p.comments as number) || 0,
        time: (p.time as string) || "Récent",
        verified: (p.verified as boolean) ?? true,
    };
}

export default function SafeZonePage() {
    const [posts, setPosts] = useState<Post[]>(FALLBACK_POSTS);
    const [newPost, setNewPost] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [modResult, setModResult] = useState<string | null>(null);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
    const [isLive, setIsLive] = useState(false);

    // Fetch posts from API on mount
    const fetchPosts = useCallback(async () => {
        try {
            const res = await fetch("/api/posts");
            if (!res.ok) return;
            const data = await res.json();
            if (data.posts?.length) {
                setPosts(data.posts.map(normalizePost));
                setIsLive(true);
            }
        } catch { /* fallback to static data */ }
    }, []);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handlePost = async () => {
        if (!newPost.trim()) return;
        setIsPosting(true);
        setModResult(null);

        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newPost }),
            });
            const data = await res.json();

            if (!res.ok) {
                setModResult("error");
                return;
            }

            if (data.moderation && !data.moderation.is_verified) {
                setModResult("toxic");
                return;
            }

            // Success — add post optimistically
            const normalized = normalizePost(data.post);
            setPosts((prev) => [normalized, ...prev]);
            setNewPost("");
            setModResult("success");
            setTimeout(() => setModResult(null), 3000);
        } catch {
            setModResult("error");
        } finally {
            setIsPosting(false);
        }
    };

    const toggleLike = (id: string) => {
        setLikedPosts((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    };

    const toggleSave = (id: string) => {
        setSavedPosts((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
            {/* ─── Header ─── */}
            <div className="relative mt-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-[var(--text-2)]" />
                    <span className="section-label tracking-widest text-[var(--text-2)] font-mono-tech uppercase">Réseau_Neural_Sécurisé_V9</span>
                </div>
                <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] font-extrabold tracking-tight leading-[1] text-[var(--text-0)]">
                    La <span className="text-gradient-shimmer" data-text="Safe-Zone">Safe-Zone</span>
                </h1>
                <p className="text-[14px] text-[var(--text-3)] font-mono-tech uppercase tracking-widest mt-4 max-w-lg leading-relaxed md:mx-0 mx-auto">
                    Flux de données vérifiées. Protocole anti-toxicité modéré.
                </p>
            </div>

            {/* ─── System Stats ─── */}
            <div className="glass-panel py-4 px-6 flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-1)] border border-[var(--border-1)] shadow-none">
                {[
                    { label: "Nœuds Actifs", value: "312", icon: MessageCircle },
                    { label: "Opérateurs", value: "1.4k", icon: Users },
                    { label: "Tx/S", value: "89", icon: TrendingUp },
                ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-2)] border border-[var(--border-1)]">
                            <s.icon className="w-4 h-4 text-[var(--text-1)]" />
                        </div>
                        <div>
                            <div className="text-[16px] font-extrabold font-mono-tech text-[var(--text-0)] leading-tight">{s.value}</div>
                            <div className="text-[10px] text-[var(--text-3)] uppercase tracking-widest">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── Terminal Input (Composer) ─── */}
            <div className="glass-panel p-6 relative overflow-hidden group bg-[var(--bg-1)] border border-[var(--border-1)] shadow-none">
                <div className="flex items-start gap-4">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 bg-[var(--bg-2)] border border-[var(--border-2)] text-[var(--text-0)]"
                    >
                        JL
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder=">> INITIALISER TRANSMISSION..."
                            rows={3}
                            className="w-full bg-transparent text-[14px] outline-none resize-none font-mono-tech text-[var(--text-0)] placeholder:text-[var(--text-3)] leading-relaxed"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pl-14">
                    <div className="flex items-center gap-2 px-2 py-1 rounded border border-[var(--border-1)] bg-[var(--bg-2)]">
                        <Shield className="w-3 h-3 text-[var(--text-2)]" />
                        <span className="text-[9px] text-[var(--text-2)] font-mono-tech uppercase tracking-widest">IA MOD_V9 ACTIS</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePost}
                        disabled={!newPost.trim() || isPosting}
                        className="btn-sci-fi text-[12px] px-6 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {isPosting ? <span className="animate-pulse">CRYPTAGE...</span> : (
                            <>
                                TRANSMETTRE <Send className="w-3.5 h-3.5 ml-1" />
                            </>
                        )}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {modResult && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 flex items-center gap-2 text-[11px] font-mono-tech uppercase tracking-widest px-4 py-3 rounded-xl ml-14 bg-[var(--bg-2)] border border-[var(--border-2)] text-[var(--text-1)]"
                        >
                            {modResult === "success" ? <Sparkles className="w-4 h-4 text-[var(--accent-indigo)]" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                            {modResult === "success" ? "TRANSMISSION SÉCURISÉE CONFIRMÉE" : "ALERTE: FRÉQUENCE TOXIQUE DÉTECTÉE. ANNULATION."}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ─── Data Stream (Feed) ─── */}
            <div className="space-y-4">
                <AnimatePresence>
                    {posts.map((post, i) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="glass-panel p-6 space-y-4 group/post bg-[var(--bg-0)] border border-[var(--border-1)] shadow-none hover:bg-[var(--bg-1)] transition-colors duration-300"
                        >
                            {/* Author Info */}
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold relative bg-[var(--bg-2)] border border-[var(--border-1)]"
                                    style={{ color: post.badgeColor }}
                                >
                                    {post.avatar}
                                    {post.verified && (
                                        <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--bg-1)] flex items-center justify-center border border-[var(--border-1)]">
                                            <BadgeCheck className="w-3 h-3 text-[var(--text-0)]" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[14px] font-bold text-[var(--text-0)] tracking-wide">{post.author}</span>
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-[var(--bg-2)]" style={{ borderColor: 'var(--border-2)', color: post.badgeColor }}>
                                            {post.badge}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                        {post.country && (
                                            <span className="flex items-center gap-1.5 text-[10px] font-mono-tech uppercase tracking-widest text-[var(--text-2)]">
                                                <MapPin className="w-3 h-3 opacity-70" /> {post.flag} {post.country}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5 text-[10px] font-mono-tech uppercase tracking-widest text-[var(--text-3)]">
                                            <Clock className="w-3 h-3 opacity-70" /> {post.time}
                                        </span>
                                    </div>
                                </div>
                                <button className="opacity-0 group-hover/post:opacity-100 transition-opacity p-2 rounded-lg hover:bg-[var(--bg-2)] text-[var(--text-2)]">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Payload (Content) */}
                            <div className="text-[14px] leading-relaxed text-[var(--text-2)] pl-14">
                                {post.content.split("\n").map((line, j) => (
                                    <p key={j} className={j > 0 ? "mt-2" : ""}>
                                        {line.split("**").map((part, k) =>
                                            k % 2 === 1 ? <strong key={k} className="text-[var(--text-0)] font-bold tracking-wide">{part}</strong> : part
                                        )}
                                    </p>
                                ))}
                            </div>

                            {/* Telemetry (Actions) */}
                            <div className="flex items-center gap-2 pl-14 pt-3 border-t border-[var(--border-0)]">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleLike(post.id)}
                                    className="flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-lg transition-all border"
                                    style={{
                                        background: likedPosts.has(post.id) ? "var(--bg-2)" : "transparent",
                                        color: likedPosts.has(post.id) ? "var(--text-0)" : "var(--text-2)",
                                        borderColor: likedPosts.has(post.id) ? "var(--border-2)" : "transparent"
                                    }}
                                >
                                    <Heart className="w-4 h-4" fill={likedPosts.has(post.id) ? "currentColor" : "none"} />
                                    <span className="font-mono-tech font-bold">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                                </motion.button>
                                <button className="flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-lg text-[var(--text-2)] transition-all border border-transparent hover:bg-[var(--bg-2)] hover:border-[var(--border-1)]">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="font-mono-tech font-bold">{post.comments}</span>
                                </button>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleSave(post.id)}
                                    className="flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-lg ml-auto transition-all border"
                                    style={{
                                        background: savedPosts.has(post.id) ? "var(--bg-2)" : "transparent",
                                        color: savedPosts.has(post.id) ? "var(--text-0)" : "var(--text-2)",
                                        borderColor: savedPosts.has(post.id) ? "var(--border-2)" : "transparent"
                                    }}
                                >
                                    <Bookmark className="w-4 h-4" fill={savedPosts.has(post.id) ? "currentColor" : "none"} />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
