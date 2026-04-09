"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrgMembership } from "@/lib/auth-guard";

export async function updateOrganization(orgId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify user is admin of this org
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (membership?.role !== "ADMIN") {
    return { error: "Solo los administradores pueden editar la organización" };
  }

  const { error } = await supabase
    .from("organizations")
    .update({
      name: formData.get("name") as string,
      nit_number: formData.get("nit_number") as string,
      contribuyente_type: formData.get("contribuyente_type") as string || "GENERAL",
      isr_regime: formData.get("isr_regime") as string || "UTILIDADES",
      address: (formData.get("address") as string) || null,
      municipality: (formData.get("municipality") as string) || null,
      department: (formData.get("department") as string) || null,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      industry_code: (formData.get("industry_code") as string) || null,
      fel_certificador: (formData.get("fel_certificador") as string) || null,
      fel_nit_certificador: (formData.get("fel_nit_certificador") as string) || null,
    })
    .eq("id", orgId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function getOrgMembers(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      id,
      role,
      created_at,
      user:user_profiles(id, first_name, last_name)
    `)
    .eq("organization_id", orgId)
    .order("created_at");

  if (error) throw error;

  // Get emails from auth (we can get user IDs from profiles)
  return data;
}

export async function updateMemberRole(memberId: string, newRole: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("organization_members")
    .update({ role: newRole })
    .eq("id", memberId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function removeMember(memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Don't allow removing yourself
  const { data: member } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("id", memberId)
    .single();

  if (member?.user_id === user.id) {
    return { error: "No puedes eliminarte a ti mismo" };
  }

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", memberId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function inviteMember(orgId: string, email: string, role: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if already invited
  const { data: existing } = await supabase
    .from("invitations")
    .select("id")
    .eq("organization_id", orgId)
    .eq("email", email)
    .eq("status", "PENDING")
    .single();

  if (existing) {
    return { error: "Ya existe una invitación pendiente para este correo" };
  }

  // Check if already a member
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id");

  const { error } = await supabase
    .from("invitations")
    .insert({
      organization_id: orgId,
      email,
      role: role as "ADMIN" | "ACCOUNTANT" | "EMPLOYEE",
      invited_by: user.id,
    });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function getInvitations(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("organization_id", orgId)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function cancelInvitation(invitationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("invitations")
    .update({ status: "EXPIRED" })
    .eq("id", invitationId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}
