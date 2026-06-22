import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://example.supabase.co"
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "missing-key"

console.log("=== ENV CHECK ===", { 
  url: import.meta.env.VITE_SUPABASE_URL, 
  key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  all: import.meta.env
});

export const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
