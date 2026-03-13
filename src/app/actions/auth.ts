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

  // Create organization
  const { data: newOrg, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name,
      nit_number: nit.replace(/[-\s]/g, ""),
      contribuyente_type: contribuyenteType,
      isr_regime: isrRegime,
      address: address || null,
      municipality: municipality || null,
      department: department || null,
      phone: phone || null,
      email: email || null,
    })
    .select("id")
    .single();

  if (orgError) {
    return { error: orgError.message };
  }

  // Add user as admin member
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: newOrg.id,
      user_id: user.id,
      role: "ADMIN",
    });

  if (memberError) {
    return { error: memberError.message };
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
