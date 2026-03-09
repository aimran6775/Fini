import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Onboarding is now handled inside the dashboard.
// Redirect any old links to the dashboard.
export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  redirect("/dashboard");
}
