import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== ""
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : "https://placeholder.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== ""
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : "placeholder-anon-key";

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== "https://placeholder.supabase.co" &&
    supabaseAnonKey !== "placeholder-anon-key" &&
    supabaseUrl.startsWith("http")
  );
};

console.log("SUPABASE URL =", supabaseUrl);
console.log("SUPABASE KEY =", supabaseAnonKey.substring(0, 20));
console.log("CONFIGURED =", isSupabaseConfigured());

if (!isSupabaseConfigured() && typeof window !== "undefined") {
  console.warn(
    "Supabase credentials missing or set to placeholder! Operating in local fallback mode."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});