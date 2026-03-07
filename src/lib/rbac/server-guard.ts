import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Role, type Permission, hasPermission } from "./permissions";

export async function getCurrentUserRole(orgId: string): Promise<Role | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .single();

  return (member?.role as Role) ?? null;
}

export async function requirePermission(
  orgId: string,
  permission: Permission,
  redirectTo = "/dashboard"
): Promise<Role> {
  const role = await getCurrentUserRole(orgId);

  if (!role || !hasPermission(role, permission)) {
    redirect(redirectTo);
  }

  return role;
}

export async function requireRole(
  orgId: string,
  allowedRoles: Role[],
  redirectTo = "/dashboard"
): Promise<Role> {
  const role = await getCurrentUserRole(orgId);

  if (!role || !allowedRoles.includes(role)) {
    redirect(redirectTo);
  }

  return role;
}

export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}

export async function getUserOrganizations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("organization_members")
    .select(`
      role,
      organization:organizations (
        id,
        name,
        nit,
        contribuyente_type,
        isr_regime
      )
    `)
    .eq("user_id", user.id);

  return data ?? [];
}
