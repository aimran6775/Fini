import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Authenticate the current user and verify they belong to the given organization.
 * Returns { supabase, user } or redirects/throws.
 */
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/**
 * Verify the user is a member of the given organization.
 * Returns the org membership row or throws an error.
 */
export async function requireOrgMembership(userId: string, orgId: string) {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", userId)
    .eq("organization_id", orgId)
    .single();

  if (!membership) {
    throw new Error("No tiene acceso a esta organización");
  }
  return membership;
}

/**
 * Verify the user owns the resource via its organization_id column.
 * Used when a function receives only an entity ID (no orgId parameter).
 */
export async function verifyEntityOwnership(
  userId: string,
  table: string,
  entityId: string,
): Promise<string> {
  const supabase = await createClient();

  // Get entity's org
  const { data: entity } = await supabase
    .from(table)
    .select("organization_id")
    .eq("id", entityId)
    .single();

  if (!entity) throw new Error("Registro no encontrado");

  // Verify membership
  await requireOrgMembership(userId, entity.organization_id);
  return entity.organization_id;
}
