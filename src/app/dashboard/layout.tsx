import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get organizations
  const { data: memberships } = await supabase
    .from("organization_members")
    .select(`
      role,
      organization:organizations (*)
    `)
    .eq("user_id", user.id);

  const orgs = memberships?.map((m: any) => ({
    ...m.organization,
    role: m.role,
  })) ?? [];

  // If no orgs, redirect to onboarding
  if (orgs.length === 0) {
    redirect("/onboarding");
  }

  return (
    <DashboardShell user={user} profile={profile} organizations={orgs}>
      {children}
    </DashboardShell>
  );
}
