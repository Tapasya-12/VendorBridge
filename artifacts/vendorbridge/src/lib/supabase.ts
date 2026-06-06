import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL environment variable is required");
}

if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY environment variable is required");
}

/**
 * Browser-side Supabase client using the anon (public) key.
 * Safe to use in client-side code — respects Row Level Security.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
