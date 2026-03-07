"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getChartOfAccounts(orgId: string) {
  const supabase = await createClient();
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

  const parentAccountId = formData.get("parent_account_id") as string;

  const { error } = await supabase.from("chart_of_accounts").insert({
    organization_id: formData.get("organization_id") as string,
    account_code: formData.get("account_code") as string,
    account_name: formData.get("account_name") as string,
    account_type: formData.get("account_type") as string,
    parent_account_id: parentAccountId || null,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/accounts");
  return { success: true };
}

export async function getJournalEntries(orgId: string) {
  const supabase = await createClient();
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
