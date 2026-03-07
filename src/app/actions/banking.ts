"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getBankAccounts(orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("organization_id", orgId)
    .order("bank_name");
  if (error) throw error;
  return data;
}

export async function createBankAccount(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("bank_accounts").insert({
    organization_id: formData.get("organization_id") as string,
    account_name: formData.get("account_name") as string,
    bank_name: formData.get("bank_name") as string,
    account_number: formData.get("account_number") as string,
    account_type: formData.get("account_type") as string || "CHECKING",
    currency: formData.get("currency") as string || "GTQ",
    current_balance: parseFloat(formData.get("current_balance") as string || "0"),
    is_active: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/banking");
  return { success: true };
}

export async function getContacts(orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("organization_id", orgId)
    .order("name");
  if (error) throw error;
  return data;
}

export async function createContact(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").insert({
    organization_id: formData.get("organization_id") as string,
    contact_type: formData.get("contact_type") as string || "CLIENT",
    name: formData.get("name") as string,
    nit_number: (formData.get("nit_number") as string) || "CF",
    dpi_number: (formData.get("dpi_number") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    address: (formData.get("address") as string) || null,
    municipality: (formData.get("municipality") as string) || null,
    department: (formData.get("department") as string) || null,
    notes: (formData.get("notes") as string) || null,
    is_active: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/contacts");
  return { success: true };
}

export async function getInventoryItems(orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("organization_id", orgId)
    .order("name");
  if (error) throw error;
  return data;
}

export async function createInventoryItem(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("inventory_items").insert({
    organization_id: formData.get("organization_id") as string,
    sku: formData.get("sku") as string,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    category: (formData.get("category") as string) || null,
    unit_of_measure: formData.get("unit_of_measure") as string || "UND",
    cost_price: parseFloat(formData.get("cost_price") as string || "0"),
    unit_price: parseFloat(formData.get("unit_price") as string || "0"),
    current_stock: parseFloat(formData.get("current_stock") as string || "0"),
    min_stock: parseFloat(formData.get("min_stock") as string || "0"),
    is_active: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/inventory");
  return { success: true };
}
