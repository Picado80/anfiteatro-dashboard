import { createClient } from "@supabase/supabase-js";
import { Database } from "./db-schema";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Client for frontend (uses Anon Key, subject to RLS policies)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Client for backend/API operations (bypasses RLS policies, use ONLY in server-side)
export function getServiceSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL. Check your environment variables.");
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}
