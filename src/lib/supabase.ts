import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// ==============================================================================
// Browser client (for client components)
// ==============================================================================
export function createBrowserSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) return null;
    return createBrowserClient<Database>(url, key);
}

// ==============================================================================
// Server client (for API routes & server components)
// ==============================================================================
export function createServerSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) return null;
    return createClient<Database>(url, key);
}

// Legacy export (backward compat)
export const supabase = createBrowserSupabaseClient();

// ==============================================================================
// Helper: check if Supabase is configured
// ==============================================================================
export function isSupabaseConfigured(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}
