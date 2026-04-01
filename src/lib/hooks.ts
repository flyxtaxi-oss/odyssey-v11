import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db, COLLECTIONS } from "./firebase";
import { offlineDB } from "./offline-db";

// ==============================================================================
// Custom Hooks — Data Layer for Odyssey.ai
// Firebase Firestore integration with real-time subscriptions + offline support
// ==============================================================================

type FetchState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
};

/** Generic fetcher hook with Firestore */
export function useApi<T>(collectionName: string, docId?: string, constraints?: any[]) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      if (docId) {
        // Single document
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setState({ data: { id: docSnap.id, ...docSnap.data() } as T, error: null, isLoading: false });
        } else {
          setState({ data: null, error: null, isLoading: false });
        }
      } else {
        // Collection query
        let q = collection(db, collectionName);
        if (constraints && constraints.length > 0) {
          q = query(q, ...constraints) as any;
        }
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
        setState({ data: data as any, error: null, isLoading: false });
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Unknown error",
        isLoading: false,
      }));
    }
  }, [collectionName, docId, constraints]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/** Dashboard stats hook */
export function useDashboard() {
  return useApi<{
    odyssey_score: number;
    odyssey_trend: string;
    mental_clarity: number;
    countries_simulated: number;
    network_nodes: number;
    modules: Array<{
      id: string;
      name: string;
      description: string;
      status: string;
      gradient: string;
      href: string;
    }>;
    activity: {
      conversations_today: number;
      posts_this_week: number;
      simulations_run: number;
      badges_earned: number;
    };
    source: string;
  }>("profiles");
}

/** Posts hook with real-time updates + offline cache */
export function usePosts() {
  const [state, setState] = useState<FetchState<{
    posts: Array<{
      id: string;
      author: { name: string; badge: string; avatar: string };
      content: string;
      likes: number;
      comments: number;
      verified: boolean;
      toxicity_score: number;
      time: string;
    }>;
    total: number;
    source: string;
  }>>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    // Try loading from IndexedDB cache first for instant display
    offlineDB.init().then(async () => {
      const cached = await offlineDB.getCachedPosts<Record<string, unknown>>();
      if (cached.length > 0 && !state.data) {
        const posts = cached.map((data) => ({
          id: data.id as string,
          author: typeof data.author === 'object' ? data.author as { name: string; badge: string; avatar: string } : {
            name: (data.author_name as string) || "Anonyme",
            badge: (data.author_badge as string) || "Membre",
            avatar: (data.author_avatar as string) || "A",
          },
          content: data.content as string,
          likes: (data.likes as number) || 0,
          comments: (data.comments as number) || 0,
          verified: (data.is_verified as boolean) || false,
          toxicity_score: (data.toxicity_score as number) || 0,
          time: data.created_at ? formatTimeAgo(data.created_at as string) : "Récent",
        }));
        setState(prev => prev.data ? prev : {
          data: { posts, total: posts.length, source: "offline-cache" },
          error: null,
          isLoading: true,
        });
      }
    });

    // Subscribe to Firestore for real-time updates
    const q = query(
      collection(db, COLLECTIONS.POSTS),
      orderBy("created_at", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          author: typeof data.author === 'object' ? data.author : {
            name: data.author_name || "Anonyme",
            badge: data.author_badge || "Membre",
            avatar: data.author_avatar || "A",
          },
          content: data.content,
          likes: data.likes || 0,
          comments: data.comments || 0,
          verified: data.is_verified || false,
          toxicity_score: data.toxicity_score || 0,
          time: data.created_at ? formatTimeAgo(data.created_at) : "Récent",
        };
      });

      // Cache to IndexedDB for offline access
      offlineDB.cachePosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))).catch(() => {});

      setState({
        data: { posts, total: posts.length, source: "firebase" },
        error: null,
        isLoading: false,
      });
    }, (error) => {
      // On error, try offline cache
      offlineDB.getCachedPosts<Record<string, unknown>>().then((cached) => {
        if (cached.length > 0) {
          const posts = cached.map((data) => ({
            id: data.id as string,
            author: typeof data.author === 'object' ? data.author as { name: string; badge: string; avatar: string } : {
              name: (data.author_name as string) || "Anonyme",
              badge: (data.author_badge as string) || "Membre",
              avatar: (data.author_avatar as string) || "A",
            },
            content: data.content as string,
            likes: (data.likes as number) || 0,
            comments: (data.comments as number) || 0,
            verified: (data.is_verified as boolean) || false,
            toxicity_score: (data.toxicity_score as number) || 0,
            time: data.created_at ? formatTimeAgo(data.created_at as string) : "Récent",
          }));
          setState({
            data: { posts, total: posts.length, source: "offline-cache" },
            error: null,
            isLoading: false,
          });
        } else {
          setState({
            data: null,
            error: error.message,
            isLoading: false,
          });
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const createPost = useCallback(async (content: string) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("Vous devez être connecté pour publier.");

    const postRef = doc(collection(db, COLLECTIONS.POSTS));
    const postData = {
      author_id: user.uid,
      author_name: user.displayName || user.email?.split("@")[0] || "Anonyme",
      author_avatar: (user.displayName || user.email?.[0] || "A").toUpperCase(),
      author_badge: "Membre",
      content,
      likes: 0,
      comments: 0,
      is_verified: true,
      toxicity_score: 0.1,
      created_at: new Date().toISOString(),
    };

    if (navigator.onLine) {
      await setDoc(postRef, postData);
    } else {
      // Queue for sync when back online
      await offlineDB.put("posts", { id: postRef.id, ...postData });
      await offlineDB.addToSyncQueue("posts", "create", { id: postRef.id, ...postData });
    }

    return { id: postRef.id };
  }, []);

  return {
    posts: state.data?.posts ?? [],
    error: state.error,
    isLoading: state.isLoading,
    createPost,
    refetch: () => {},
  };
}

/** Simulator hook with offline cache */
export function useSimulations() {
  const [state, setState] = useState<FetchState<{
    simulations: Array<{
      id: string;
      destination: string;
      score: number;
      visa: string;
      salary: number;
      tax_rate: number;
      cost_of_living: number;
      climate: string;
      savings: number;
      created_at: string;
    }>;
    total: number;
  }>>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setState({ data: { simulations: [], total: 0 }, error: null, isLoading: false });
      return;
    }

    // Load from IndexedDB cache first
    offlineDB.init().then(async () => {
      const cached = await offlineDB.getCachedSimulations<Record<string, unknown>>(user.uid);
      if (cached.length > 0) {
        const simulations = cached.map((data) => ({
          id: data.id as string,
          destination: data.destination as string,
          score: data.score as number,
          visa: data.visa as string,
          salary: data.salary as number,
          tax_rate: data.tax_rate as number,
          cost_of_living: data.cost_of_living as number,
          climate: data.climate as string,
          savings: data.savings as number,
          created_at: data.created_at as string,
        }));
        setState(prev => prev.data ? prev : {
          data: { simulations, total: simulations.length },
          error: null,
          isLoading: true,
        });
      }
    });

    const q = query(
      collection(db, COLLECTIONS.SIMULATIONS),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const simulations = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          destination: data.destination,
          score: data.score,
          visa: data.visa,
          salary: data.salary,
          tax_rate: data.tax_rate,
          cost_of_living: data.cost_of_living,
          climate: data.climate,
          savings: data.savings,
          created_at: data.created_at,
        };
      });

      // Cache to IndexedDB
      offlineDB.cacheSimulations(simulations, user.uid).catch(() => {});

      setState({
        data: { simulations, total: simulations.length },
        error: null,
        isLoading: false,
      });
    }, (error) => {
      setState({
        data: null,
        error: error.message,
        isLoading: false,
      });
    });

    return () => unsubscribe();
  }, []);

  const saveSimulation = useCallback(async (simulation: Record<string, unknown>) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("Vous devez être connecté pour sauvegarder.");

    const simRef = doc(collection(db, COLLECTIONS.SIMULATIONS));
    const simData = { user_id: user.uid, ...simulation, created_at: new Date().toISOString() };

    if (navigator.onLine) {
      await setDoc(simRef, simData);
    } else {
      await offlineDB.put("simulations", { id: simRef.id, ...simData });
      await offlineDB.addToSyncQueue("simulations", "create", { id: simRef.id, ...simData });
    }

    return { id: simRef.id };
  }, []);

  return {
    simulations: state.data?.simulations ?? [],
    error: state.error,
    isLoading: state.isLoading,
    saveSimulation,
  };
}

/** Helper function to format time ago */
function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR");
}
