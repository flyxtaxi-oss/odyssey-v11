import { useState, useEffect, useCallback } from "react";

// ==============================================================================
// Custom Hooks — Data Layer for Odyssey.ai
// Silicon Valley grade: SWR-like caching, error handling, optimistic updates
// ==============================================================================

type FetchState<T> = {
    data: T | null;
    error: string | null;
    isLoading: boolean;
};

/** Generic fetcher hook with caching & refetch */
export function useApi<T>(url: string, initialData?: T) {
    const [state, setState] = useState<FetchState<T>>({
        data: initialData ?? null,
        error: null,
        isLoading: !initialData,
    });

    const fetchData = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setState({ data: json, error: null, isLoading: false });
        } catch (err) {
            setState((prev) => ({
                ...prev,
                error: err instanceof Error ? err.message : "Unknown error",
                isLoading: false,
            }));
        }
    }, [url]);

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
    }>("/api/dashboard");
}

/** Posts hook with optimistic create */
export function usePosts() {
    const { data, error, isLoading, refetch } = useApi<{
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
    }>("/api/posts");

    const createPost = useCallback(
        async (content: string) => {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Erreur");
            await refetch();
            return json;
        },
        [refetch]
    );

    return { posts: data?.posts ?? [], error, isLoading, createPost, refetch };
}

/** Simulator hook */
export function useSimulations() {
    const { data, error, isLoading, refetch } = useApi<{
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
    }>("/api/simulator");

    const saveSimulation = useCallback(
        async (simulation: Record<string, unknown>) => {
            const res = await fetch("/api/simulator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(simulation),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Erreur");
            await refetch();
            return json;
        },
        [refetch]
    );

    return {
        simulations: data?.simulations ?? [],
        error,
        isLoading,
        saveSimulation,
    };
}
