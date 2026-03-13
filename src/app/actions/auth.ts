"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const nit = formData.get("nit") as string;
  const contribuyenteType = formData.get("contribuyente_type") as string || "GENERAL";
  const isrRegime = formData.get("isr_regime") as string || "UTILIDADES";
  const address = formData.get("address") as string;
  const department = formData.get("department") as string;
  const municipality = formData.get("municipality") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;

  // Use the RPC function (SECURITY DEFINER) to bypass RLS
  const { data: orgId, error } = await supabase.rpc("create_organization_with_admin", {
    p_name: name,
    p_nit: nit.replace(/[-\s]/g, ""),
    p_contribuyente_type: contribuyenteType,
    p_isr_regime: isrRegime,
    p_address: address || null,
    p_municipality: municipality || null,
    p_department: department || null,
    p_phone: phone || null,
    p_email: email || null,
  });

  if (error) {
    console.error("createOrganization error:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const phone = formData.get("phone") as string;

  const { error } = await supabase
    .from("user_profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function switchOrganization(orgId: string) {
  revalidatePath("/dashboard");
  redirect(`/dashboard?org=${orgId}`);
}
