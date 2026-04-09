import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Admin client uses the service role key to bypass RLS
// Only used in server-side admin routes
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Admin email — configurable via env var, falls back to default
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@finitax.com";

// Verify that the currently logged-in user is the super admin
export async function isAdminUser(supabase: ReturnType<typeof createSupabaseClient>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === ADMIN_EMAIL;
}
