"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Shield,
  Send,
  BadgeCheck,
  AlertTriangle,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";

type Post = {
  id: string;
  author: string;
  avatar: string;
  badge: string;
  badgeColor: string;
  country: string;
  flag: string;
  category?: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
  verified: boolean;
};

const FALLBACK_POSTS: Post[] = [
  {
    id: "1",
    author: "Karim B.",
    avatar: "K",
    badge: "Expert Malte",
    badgeColor: "#0EA5E9",
    country: "Malte",
    flag: "🇲🇹",
    category: "Logement",
    content:
      "6 mois après mon arrivée à Malte. **Coût de la vie réel** : 1400€/mois pour un appart correct à Sliema. Internet fibre 50Mbps partout. La communauté tech est petite mais très soudée. AMA dans les comments.",
    likes: 47,
    comments: 12,
    time: "Il y a 2h",
    verified: true,
  },
  {
    id: "2",
    author: "Sophie L.",
    avatar: "S",
    badge: "Exploratrice",
    badgeColor: "#EC4899",
    country: "Portugal",
    flag: "🇵🇹",
    category: "Visa",
    content:
      "Update sur le **visa NHR Portugal** : la procédure a changé. Comptez 6-8 semaines au lieu de 4. Passez par un avocat local, ça vaut les 800€. J'ai fait l'erreur de tenter solo, j'ai perdu 2 mois.",
    likes: 89,
    comments: 23,
    time: "Il y a 5h",
    verified: true,
  },
  {
    id: "3",
    author: "Youssef M.",
    avatar: "Y",
    badge: "Mentor Finance",
    badgeColor: "#10B981",
    country: "Dubaï",
    flag: "🇦🇪",
    category: "Fiscalité",
    content:
      "**Mythe vs Réalité** Dubaï :\n\n✅ 0% impôt sur le revenu\n❌ Coût de vie 2x plus élevé que prévu\n✅ Networking incroyable\n❌ Chaleur intense 4 mois/an\n\nBilan : rentable si salaire > 5000€ net.",
    likes: 156,
    comments: 41,
    time: "Hier",
    verified: true,
  },
  {
    id: "4",
    author: "Léa D.",
    avatar: "L",
    badge: "Nouvelle",
    badgeColor: "#8B5CF6",
    country: "Thaïlande",
    flag: "🇹🇭",
    category: "Lifestyle",
    content:
      "Premier mois à Chiang Mai. **650€/mois tout inclus** (coliving + coworking + bouffe). Je gagne 2x plus en remote qu'il ne faut pour vivre. Le seul compromis : le décalage horaire pour les calls EU (6h).",
    likes: 72,
    comments: 18,
    time: "Il y a 2j",
    verified: true,
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
    country: (p.country as string) || "Monde",
    flag: (p.flag as string) || "🌍",
    category: (p.category as string) || "Général",
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
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [postCategory, setPostCategory] = useState("Expérience");
  const [isPosting, setIsPosting] = useState(false);
  const [modResult, setModResult] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  // Fetch posts from API on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/posts");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.posts?.length) {
          setPosts(data.posts.map(normalizePost));
        }
      } catch {
        /* fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setIsPosting(true);
    setModResult(null);

    try {
      const res = await apiFetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({ content: newPost, category: postCategory }),
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

      const normalized = normalizePost(data.post || {
        id: Date.now().toString(),
        author: "Vous",
        avatar: "U",
        badge: "Explorateur",
        content: newPost,
        category: postCategory,
        likes: 0,
        comments: 0,
        time: "À l'instant",
        verified: true,
      });

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
    setLikedPosts((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const categories = ["Tous", "Fiscalité", "Visa", "Logement", "Lifestyle", "Maroc 🇲🇦", "Portugal 🇵🇹", "Dubaï 🇦🇪"];

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "Tous") return posts;
    return posts.filter((p) => {
      if (selectedCategory === "Maroc 🇲🇦") return p.country === "Maroc" || p.flag === "🇲🇦";
      if (selectedCategory === "Portugal 🇵🇹") return p.country === "Portugal" || p.flag === "🇵🇹";
      if (selectedCategory === "Dubaï 🇦🇪") return p.country === "Dubaï" || p.flag === "🇦🇪";
      return p.category === selectedCategory;
    });
  }, [posts, selectedCategory]);

  return (
    <motion.div
      lang="fr"
      dir="ltr"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-8 pt-4 pb-20"
    >
      {/* ─── Header ─── */}
      <div className="text-center md:text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-2)] border border-[var(--border-1)] text-xs font-mono text-[var(--primary)]">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>COMMUNAUTÉ MODÉRÉE PAR IA EN TEMPS RÉEL</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-0)] font-display">
          La <span className="text-gradient-primary">Safe-Zone</span>
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-2)] max-w-xl">
          Retours d&apos;expérience réels, conseils juridiques/fiscaux et entraide vérifiée entre nomades francophones.
        </p>
      </div>

      {/* ─── Community Telemetry ─── */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-[var(--border-1)]">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-[var(--text-3)] uppercase font-mono">Publications</p>
            <p className="text-lg font-bold text-[var(--text-0)] font-mono">{posts.length}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-3)] uppercase font-mono">Membres Actifs</p>
            <p className="text-lg font-bold text-[var(--text-0)] font-mono">{new Set(posts.map((p) => p.author)).size}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-3)] uppercase font-mono">Réactions</p>
            <p className="text-lg font-bold text-emerald-400 font-mono">
              {posts.reduce((sum, p) => sum + p.likes, 0)}
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Anti-Toxicité 100% Actif
        </span>
      </div>

      {/* ─── New Post Composer ─── */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-1)] space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            U
          </div>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Partagez un retour d'expérience concret (coûts, visas, conseils banques)..."
            rows={3}
            className="w-full bg-transparent text-sm text-[var(--text-0)] placeholder:text-[var(--text-3)] outline-none resize-none font-medium leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-0)]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-3)]">Thème :</span>
            <select
              value={postCategory}
              onChange={(e) => setPostCategory(e.target.value)}
              className="bg-[var(--bg-2)] text-xs font-bold text-[var(--text-0)] px-2.5 py-1 rounded-lg border border-[var(--border-0)] outline-none"
            >
              <option value="Expérience">Expérience générale</option>
              <option value="Fiscalité">Fiscalité & Finance</option>
              <option value="Visa">Visa & Démarches</option>
              <option value="Logement">Logement & Coworking</option>
            </select>
          </div>

          <button
            onClick={handlePost}
            disabled={!newPost.trim() || isPosting}
            className="btn-stitch px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
          >
            {isPosting ? <span className="animate-pulse">Vérification...</span> : <>Publier <Send className="w-3.5 h-3.5" /></>}
          </button>
        </div>

        <AnimatePresence>
          {modResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                modResult === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {modResult === "success" ? (
                <>
                  <Sparkles className="w-4 h-4" /> Publication validée et ajoutée au flux.
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" /> Publication bloquée par la modération anti-toxicité.
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Category Filter Pills ─── */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-[var(--bg-1)] border border-[var(--border-1)] rounded-2xl overflow-x-auto custom-scroll">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === c
                ? "bg-[var(--primary)] text-black shadow-sm"
                : "text-[var(--text-2)] hover:text-[var(--text-0)] hover:bg-[var(--bg-2)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ─── Feed Posts ─── */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="glass-panel p-6 rounded-2xl border border-[var(--border-1)] space-y-4 hover:border-[var(--primary)]/30 transition-colors"
          >
            {/* Author */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-[var(--bg-2)] border border-[var(--border-1)] text-[var(--text-0)] relative"
                  style={{ color: post.badgeColor }}
                >
                  {post.avatar}
                  {post.verified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-0)] flex items-center justify-center border border-[var(--border-1)]">
                      <BadgeCheck className="w-3 h-3 text-emerald-400" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--text-0)]">{post.author}</span>
                    <span
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--bg-2)] border border-[var(--border-1)]"
                      style={{ color: post.badgeColor }}
                    >
                      {post.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-3)] mt-0.5">
                    <span>{post.flag} {post.country}</span>
                    <span>•</span>
                    <span>{post.time}</span>
                  </div>
                </div>
              </div>

              {post.category && (
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-[var(--bg-2)] text-[var(--primary)]">
                  {post.category}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="text-sm leading-relaxed text-[var(--text-1)] pl-2">
              {post.content.split("\n").map((line, j) => (
                <p key={j} className={j > 0 ? "mt-2" : ""}>
                  {line.split("**").map((part, k) =>
                    k % 2 === 1 ? (
                      <strong key={k} className="text-[var(--text-0)] font-bold">
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-0)]">
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  likedPosts.has(post.id)
                    ? "bg-red-500/10 border-red-500/30 text-red-400 font-bold"
                    : "border-transparent text-[var(--text-2)] hover:bg-[var(--bg-2)]"
                }`}
              >
                <Heart className="w-3.5 h-3.5" fill={likedPosts.has(post.id) ? "currentColor" : "none"} />
                <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
              </button>

              <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-[var(--text-2)] hover:bg-[var(--bg-2)] transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{post.comments}</span>
              </button>

              <button
                onClick={() => toggleSave(post.id)}
                className={`ml-auto p-1.5 rounded-lg transition-colors ${
                  savedPosts.has(post.id) ? "text-[var(--primary)]" : "text-[var(--text-3)] hover:text-[var(--text-0)]"
                }`}
              >
                <Bookmark className="w-4 h-4" fill={savedPosts.has(post.id) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
