"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrgMembership, verifyEntityOwnership } from "@/lib/auth-guard";
import { accountSchema, budgetSchema, fixedAssetSchema } from "@/lib/types/forms";

export async function getChartOfAccounts(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { data, error } = await supabase
    .from("chart_of_accounts")
    .select("*")
    .eq("organization_id", orgId)
    .order("account_code");

  if (error) throw error;
  return data;
}

export async function createAccount(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  await requireOrgMembership(user.id, orgId);

  // Validate with Zod schema
  const validation = accountSchema.safeParse({
    account_code: formData.get("account_code") as string,
    account_name: formData.get("account_name") as string,
    account_type: formData.get("account_type") as string,
  });
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Datos inválidos" };
  }

  const parentAccountId = formData.get("parent_account_id") as string;

  const { error } = await supabase.from("chart_of_accounts").insert({
    organization_id: formData.get("organization_id") as string,
    account_code: formData.get("account_code") as string,
    account_name: formData.get("account_name") as string,
    account_type: formData.get("account_type") as string,
    parent_account_id: parentAccountId && parentAccountId !== "_none" ? parentAccountId : null,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/accounts");
  return { success: true };
}

export async function getJournalEntries(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { data, error } = await supabase
    .from("journal_entries")
    .select(`*, lines:journal_entry_lines(*, account:chart_of_accounts(id, account_code, account_name))`)
    .eq("organization_id", orgId)
    .order("entry_date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createJournalEntry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  await requireOrgMembership(user.id, orgId);

  const linesJson = formData.get("lines") as string;
  let lines: Array<{ account_id: string; debit: number; credit: number; description?: string }> = [];

  try {
    lines = JSON.parse(linesJson);
  } catch {
    return { error: "Líneas inválidas" };
  }

  // Validate debits = credits
  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return { error: `La partida no cuadra. Débitos: ${totalDebit.toFixed(2)}, Créditos: ${totalCredit.toFixed(2)}` };
  }

  // Create journal entry — matches journal_entries table exactly
  const { data: entry, error: entryError } = await supabase
    .from("journal_entries")
    .insert({
      organization_id: orgId,
      entry_date: formData.get("entry_date") as string,
      reference: (formData.get("reference") as string) || null,
      description: formData.get("description") as string,
      created_by: user.id,
    })
    .select()
    .single();

  if (entryError) return { error: entryError.message };

  // Create lines — matches journal_entry_lines table exactly
  const lineRecords = lines.map((l) => ({
    journal_entry_id: entry.id,
    account_id: l.account_id,
    debit: l.debit || 0,
    credit: l.credit || 0,
    description: l.description || null,
  }));

  const { error: linesError } = await supabase
    .from("journal_entry_lines")
    .insert(lineRecords);

  if (linesError) return { error: linesError.message };

  revalidatePath("/dashboard/journal");
  redirect("/dashboard/journal");
}

export async function createFixedAsset(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  await requireOrgMembership(user.id, orgId);

  // Validate with Zod schema
  const assetValidation = fixedAssetSchema.safeParse({
    asset_name: formData.get("asset_name") as string,
    asset_category: formData.get("asset_category") as string,
    acquisition_date: formData.get("acquisition_date") as string,
    acquisition_cost: parseFloat(formData.get("acquisition_cost") as string || "0"),
    depreciation_rate: parseFloat(formData.get("depreciation_rate") as string || "20"),
  });
  if (!assetValidation.success) {
    return { error: assetValidation.error.issues[0]?.message || "Datos inválidos" };
  }

  const acquisitionCost = parseFloat(formData.get("acquisition_cost") as string || "0");
  const residualValue = parseFloat(formData.get("residual_value") as string || "0");

  const { error } = await supabase.from("fixed_assets").insert({
    organization_id: formData.get("organization_id") as string,
    asset_name: formData.get("asset_name") as string,
    asset_category: formData.get("asset_category") as string,
    description: (formData.get("description") as string) || null,
    acquisition_date: formData.get("acquisition_date") as string,
    acquisition_cost: acquisitionCost,
    residual_value: residualValue,
    useful_life_years: parseFloat(formData.get("useful_life_years") as string || "5"),
    depreciation_rate: parseFloat(formData.get("depreciation_rate") as string || "20"),
    depreciation_method: "STRAIGHT_LINE",
    accumulated_depreciation: 0,
    net_book_value: acquisitionCost - residualValue,
    status: "ACTIVE",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/assets");
  return { success: true };
}

export async function createBudget(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  await requireOrgMembership(user.id, orgId);

  // Validate with Zod schema
  const budgetValidation = budgetSchema.safeParse({
    account_id: formData.get("account_id") as string,
    period_type: formData.get("period_type") as string,
    period_year: parseInt(formData.get("period_year") as string),
    budgeted_amount: parseFloat(formData.get("budgeted_amount") as string || "0"),
  });
  if (!budgetValidation.success) {
    return { error: budgetValidation.error.issues[0]?.message || "Datos inválidos" };
  }

  const { error } = await supabase.from("budgets").insert({
    organization_id: formData.get("organization_id") as string,
    account_id: formData.get("account_id") as string,
    period_type: formData.get("period_type") as string,
    period_year: parseInt(formData.get("period_year") as string),
    period_month: formData.get("period_month") ? parseInt(formData.get("period_month") as string) : null,
    period_quarter: formData.get("period_quarter") ? parseInt(formData.get("period_quarter") as string) : null,
    budgeted_amount: parseFloat(formData.get("budgeted_amount") as string || "0"),
    actual_amount: 0,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/budgets");
  return { success: true };
}

// ─── Account CRUD ──────────────────────────────────────────────

export async function updateAccount(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "chart_of_accounts", id);

  const validation = accountSchema.safeParse({
    account_code: formData.get("account_code") as string,
    account_name: formData.get("account_name") as string,
    account_type: formData.get("account_type") as string,
  });
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Datos inválidos" };
  }

  const parentAccountId = formData.get("parent_account_id") as string;

  const { error } = await supabase
    .from("chart_of_accounts")
    .update({
      account_code: formData.get("account_code") as string,
      account_name: formData.get("account_name") as string,
      account_type: formData.get("account_type") as string,
      parent_account_id: parentAccountId && parentAccountId !== "_none" ? parentAccountId : null,
      is_active: formData.get("is_active") !== "false",
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/accounts");
  return { success: true };
}

export async function deleteAccount(id: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  // Check for journal entry lines using this account
  const { count } = await supabase
    .from("journal_entry_lines")
    .select("id", { count: "exact", head: true })
    .eq("account_id", id);

  if (count && count > 0) {
    return { error: "No se puede eliminar una cuenta con movimientos contables. Desactívela en su lugar." };
  }

  const { error } = await supabase
    .from("chart_of_accounts")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/accounts");
  return { success: true };
}

// ─── Journal Entry CRUD ────────────────────────────────────────

export async function deleteJournalEntry(id: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  // Delete lines first (cascade might handle this, but be explicit)
  await supabase
    .from("journal_entry_lines")
    .delete()
    .eq("journal_entry_id", id);

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/journal");
  return { success: true };
}

// ─── Fixed Asset CRUD ──────────────────────────────────────────

export async function getFixedAssets(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { data, error } = await supabase
    .from("fixed_assets")
    .select("*")
    .eq("organization_id", orgId)
    .order("asset_name");

  if (error) throw error;
  return data;
}

export async function updateFixedAsset(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "fixed_assets", id);

  const acquisitionCost = parseFloat(formData.get("acquisition_cost") as string || "0");
  const residualValue = parseFloat(formData.get("residual_value") as string || "0");
  const accumulatedDepreciation = parseFloat(formData.get("accumulated_depreciation") as string || "0");

  const { error } = await supabase
    .from("fixed_assets")
    .update({
      asset_name: formData.get("asset_name") as string,
      asset_category: formData.get("asset_category") as string,
      description: (formData.get("description") as string) || null,
      acquisition_date: formData.get("acquisition_date") as string,
      acquisition_cost: acquisitionCost,
      residual_value: residualValue,
      useful_life_years: parseFloat(formData.get("useful_life_years") as string || "5"),
      depreciation_rate: parseFloat(formData.get("depreciation_rate") as string || "20"),
      accumulated_depreciation: accumulatedDepreciation,
      net_book_value: acquisitionCost - residualValue - accumulatedDepreciation,
      status: formData.get("status") as string || "ACTIVE",
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/assets");
  return { success: true };
}

export async function deleteFixedAsset(id: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { error } = await supabase
    .from("fixed_assets")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/assets");
  return { success: true };
}

// ─── Budget CRUD ───────────────────────────────────────────────

export async function updateBudget(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "budgets", id);

  const { error } = await supabase
    .from("budgets")
    .update({
      account_id: formData.get("account_id") as string,
      period_type: formData.get("period_type") as string,
      period_year: parseInt(formData.get("period_year") as string),
      period_month: formData.get("period_month") ? parseInt(formData.get("period_month") as string) : null,
      period_quarter: formData.get("period_quarter") ? parseInt(formData.get("period_quarter") as string) : null,
      budgeted_amount: parseFloat(formData.get("budgeted_amount") as string || "0"),
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/budgets");
  return { success: true };
}

export async function deleteBudget(id: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/budgets");
  return { success: true };
}
