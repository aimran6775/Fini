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
  let { data: memberships } = await supabase
    .from("organization_members")
    .select(`
      role,
      organization:organizations (*)
    `)
    .eq("user_id", user.id);

  // If no org, create a default one automatically
  if (!memberships || memberships.length === 0) {
    const displayName = 
      profile?.first_name || 
      user.user_metadata?.full_name?.split(" ")[0] || 
      user.email?.split("@")[0] || 
      "Usuario";
    
    // Create default organization using direct insert (simpler than RPC)
    const { data: newOrg, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: displayName,
        nit_number: "CF",
        contribuyente_type: "PEQUEÑO",
        isr_regime: "SIMPLIFICADO",
        email: user.email || null,
      })
      .select()
      .single();

    if (newOrg && !orgError) {
      // Add user as admin
      await supabase
        .from("organization_members")
        .insert({
          organization_id: newOrg.id,
          user_id: user.id,
          role: "ADMIN",
        });

      // Fetch the new membership
      const { data: newMemberships } = await supabase
        .from("organization_members")
        .select(`
          role,
          organization:organizations (*)
        `)
        .eq("user_id", user.id);
      memberships = newMemberships;
    }
  }

  const orgs = memberships?.map((m: any) => ({
    ...m.organization,
    role: m.role,
  })) ?? [];

  // Safety check - if still no orgs, redirect to login
  if (orgs.length === 0) {
    redirect("/login?error=org");
  }

  return (
    <DashboardShell user={user} profile={profile} organizations={orgs}>
      {children}
    </DashboardShell>
  );
}
