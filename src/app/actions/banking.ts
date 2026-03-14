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

export async function getBankAccount(accountId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("id", accountId)
    .single();
  if (error) throw error;
  return data;
}

export async function createBankAccount(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

// ─── Bank Transactions ─────────────────────────────────────────

export async function getBankTransactions(accountId: string, startDate?: string, endDate?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from("bank_transactions")
    .select("*")
    .eq("bank_account_id", accountId)
    .order("transaction_date", { ascending: false });
  
  if (startDate) {
    query = query.gte("transaction_date", startDate);
  }
  if (endDate) {
    query = query.lte("transaction_date", endDate);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createBankTransaction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const amount = parseFloat(formData.get("amount") as string) || 0;
  const category = formData.get("category") as string;
  
  // Withdrawals and fees are negative, deposits are positive
  const signedAmount = ["WITHDRAWAL", "FEE", "TRANSFER"].includes(category) && amount > 0 
    ? -amount 
    : amount;

  const { error: txnError } = await supabase.from("bank_transactions").insert({
    bank_account_id: formData.get("bank_account_id") as string,
    organization_id: formData.get("organization_id") as string,
    transaction_date: formData.get("transaction_date") as string,
    description: formData.get("description") as string,
    amount: signedAmount,
    category: category,
    reference: formData.get("reference") as string || null,
    is_reconciled: false,
  });

  if (txnError) return { error: txnError.message };

  // Update account balance
  const accountId = formData.get("bank_account_id") as string;
  const { data: account } = await supabase
    .from("bank_accounts")
    .select("current_balance")
    .eq("id", accountId)
    .single();
  
  if (account) {
    await supabase
      .from("bank_accounts")
      .update({ current_balance: Number(account.current_balance) + signedAmount })
      .eq("id", accountId);
  }

  revalidatePath("/dashboard/banking");
  return { success: true };
}

export async function deleteBankTransaction(txnId: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get transaction to reverse balance
  const { data: txn } = await supabase
    .from("bank_transactions")
    .select("amount, bank_account_id")
    .eq("id", txnId)
    .eq("organization_id", orgId)
    .single();
  
  if (txn) {
    // Reverse the balance
    const { data: account } = await supabase
      .from("bank_accounts")
      .select("current_balance")
      .eq("id", txn.bank_account_id)
      .single();
    
    if (account) {
      await supabase
        .from("bank_accounts")
        .update({ current_balance: Number(account.current_balance) - Number(txn.amount) })
        .eq("id", txn.bank_account_id);
    }
  }

  const { error } = await supabase
    .from("bank_transactions")
    .delete()
    .eq("id", txnId)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/banking");
  return { success: true };
}

// ─── Bank Reconciliation ───────────────────────────────────────

export async function getReconciliations(accountId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("bank_reconciliations")
    .select("*")
    .eq("bank_account_id", accountId)
    .order("period_end", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createReconciliation(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const statementBalance = parseFloat(formData.get("statement_balance") as string) || 0;
  const bookBalance = parseFloat(formData.get("book_balance") as string) || 0;
  const difference = Math.abs(statementBalance - bookBalance);

  const { data, error } = await supabase.from("bank_reconciliations").insert({
    bank_account_id: formData.get("bank_account_id") as string,
    organization_id: formData.get("organization_id") as string,
    period_start: formData.get("period_start") as string,
    period_end: formData.get("period_end") as string,
    statement_balance: statementBalance,
    book_balance: bookBalance,
    difference: difference,
    status: difference < 0.01 ? "COMPLETED" : "IN_PROGRESS",
    reconciled_by: user.id,
    completed_at: difference < 0.01 ? new Date().toISOString() : null,
  }).select().single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard/banking");
  return { success: true, data };
}

export async function markTransactionsReconciled(transactionIds: string[], orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("bank_transactions")
    .update({ is_reconciled: true })
    .in("id", transactionIds)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/banking");
  return { success: true };
}

export async function completeReconciliation(reconciliationId: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("bank_reconciliations")
    .update({ 
      status: "COMPLETED",
      completed_at: new Date().toISOString(),
      reconciled_by: user.id,
    })
    .eq("id", reconciliationId)
    .eq("organization_id", orgId);

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
