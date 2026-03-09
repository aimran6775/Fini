import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { SetupWizard } from "@/components/dashboard/setup-wizard";

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

  // If no orgs, show the setup wizard inline instead of redirecting
  if (orgs.length === 0) {
    const displayName =
      profile?.first_name ||
      user.user_metadata?.full_name?.split(" ")[0] ||
      undefined;
    return <SetupWizard userName={displayName} />;
  }

  return (
    <DashboardShell user={user} profile={profile} organizations={orgs}>
      {children}
    </DashboardShell>
  );
}
