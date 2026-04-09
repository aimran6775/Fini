"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrgMembership } from "@/lib/auth-guard";

// ─── Recurring Transactions ────────────────────────────────────

export async function getRecurringTransactions(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { data, error } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("organization_id", orgId)
    .order("next_date", { ascending: true });
  
  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Manually resolve source names (no FK from source_id → invoices/expenses)
  const invoiceIds = data.filter(r => r.source_type === "INVOICE").map(r => r.source_id);
  const expenseIds = data.filter(r => r.source_type === "EXPENSE").map(r => r.source_id);

  const [{ data: invoices }, { data: expenses }] = await Promise.all([
    invoiceIds.length > 0
      ? supabase.from("fel_invoices").select("id, client_name, total, status").in("id", invoiceIds)
      : Promise.resolve({ data: [] as any[] }),
    expenseIds.length > 0
      ? supabase.from("expenses").select("id, supplier_name, amount, status").in("id", expenseIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const invoiceMap = Object.fromEntries((invoices || []).map(i => [i.id, i]));
  const expenseMap = Object.fromEntries((expenses || []).map(e => [e.id, { ...e, vendor_name: e.supplier_name, total_amount: e.amount }]));

  return data.map(r => ({
    ...r,
    invoice: r.source_type === "INVOICE" ? invoiceMap[r.source_id] ?? null : null,
    expense: r.source_type === "EXPENSE" ? expenseMap[r.source_id] ?? null : null,
  }));
}

export async function createRecurringTransaction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  await requireOrgMembership(user.id, orgId);

  const { error } = await supabase.from("recurring_transactions").insert({
    organization_id: formData.get("organization_id") as string,
    source_type: formData.get("source_type") as string,
    source_id: formData.get("source_id") as string,
    frequency: formData.get("frequency") as string,
    next_date: formData.get("next_date") as string,
    end_date: formData.get("end_date") as string || null,
    is_active: true,
    created_by: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/recurring");
  return { success: true };
}

export async function updateRecurringTransaction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const orgId = formData.get("organization_id") as string;
  await requireOrgMembership(user.id, orgId);

  const { error } = await supabase
    .from("recurring_transactions")
    .update({
      frequency: formData.get("frequency") as string,
      next_date: formData.get("next_date") as string,
      end_date: formData.get("end_date") as string || null,
      is_active: formData.get("is_active") === "true",
    })
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/recurring");
  return { success: true };
}

export async function deleteRecurringTransaction(id: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/recurring");
  return { success: true };
}

export async function toggleRecurringActive(id: string, orgId: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { error } = await supabase
    .from("recurring_transactions")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/recurring");
  return { success: true };
}

// Helper to calculate next date based on frequency
function calculateNextDate(currentDate: Date, frequency: string): Date {
  const next = new Date(currentDate);
  
  switch (frequency) {
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "BIWEEKLY":
      next.setDate(next.getDate() + 14);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3);
      break;
    case "SEMIANNUAL":
      next.setMonth(next.getMonth() + 6);
      break;
    case "ANNUAL":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  return next;
}

// Generate a new transaction from a recurring template
export async function generateFromRecurring(recurringId: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get the recurring transaction
  const { data: recurring, error: fetchError } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("id", recurringId)
    .eq("organization_id", orgId)
    .single();

  if (fetchError || !recurring) {
    return { error: "Transacción recurrente no encontrada" };
  }

  if (!recurring.is_active) {
    return { error: "Esta transacción recurrente está inactiva" };
  }

  // Check if end_date has passed
  if (recurring.end_date && new Date(recurring.end_date) < new Date()) {
    return { error: "Esta transacción recurrente ha expirado" };
  }

  try {
    if (recurring.source_type === "INVOICE") {
      // Clone the invoice
      const { data: sourceInvoice, error: invError } = await supabase
        .from("fel_invoices")
        .select("*, items:fel_invoice_items(*)")
        .eq("id", recurring.source_id)
        .single();

      if (invError || !sourceInvoice) {
        return { error: "Factura fuente no encontrada" };
      }

      // Create new invoice (as draft)
      const { data: newInvoice, error: createError } = await supabase
        .from("fel_invoices")
        .insert({
          organization_id: orgId,
          fel_type: sourceInvoice.fel_type,
          status: "DRAFT",
          payment_status: "UNPAID",
          client_name: sourceInvoice.client_name,
          client_nit: sourceInvoice.client_nit,
          client_address: sourceInvoice.client_address,
          client_email: sourceInvoice.client_email,
          invoice_date: new Date().toISOString().split("T")[0],
          due_date: sourceInvoice.due_date ? new Date(
            new Date().getTime() + 
            (new Date(sourceInvoice.due_date).getTime() - new Date(sourceInvoice.invoice_date).getTime())
          ).toISOString().split("T")[0] : null,
          subtotal: sourceInvoice.subtotal,
          iva_amount: sourceInvoice.iva_amount,
          total_amount: sourceInvoice.total_amount,
          notes: `Generado automáticamente desde factura recurrente`,
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) {
        return { error: createError.message };
      }

      // Clone invoice items
      if (sourceInvoice.items && sourceInvoice.items.length > 0) {
        const newItems = sourceInvoice.items.map((item: any) => ({
          invoice_id: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount,
          tax_type: item.tax_type,
          tax_amount: item.tax_amount,
          line_total: item.line_total,
        }));

        await supabase.from("fel_invoice_items").insert(newItems);
      }
    } else if (recurring.source_type === "EXPENSE") {
      // Clone the expense
      const { data: sourceExpense, error: expError } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", recurring.source_id)
        .single();

      if (expError || !sourceExpense) {
        return { error: "Gasto fuente no encontrado" };
      }

      // Create new expense (as draft)
      await supabase.from("expenses").insert({
        organization_id: orgId,
        vendor_name: sourceExpense.vendor_name,
        vendor_nit: sourceExpense.vendor_nit,
        expense_date: new Date().toISOString().split("T")[0],
        expense_type: sourceExpense.expense_type,
        description: sourceExpense.description,
        subtotal: sourceExpense.subtotal,
        iva_amount: sourceExpense.iva_amount,
        total_amount: sourceExpense.total_amount,
        is_deductible: sourceExpense.is_deductible,
        account_id: sourceExpense.account_id,
        status: "DRAFT",
        notes: `Generado automáticamente desde gasto recurrente`,
        created_by: user.id,
      });
    }

    // Update next_date on the recurring transaction
    const nextDate = calculateNextDate(new Date(recurring.next_date), recurring.frequency);
    
    // Check if next date exceeds end_date
    const updateData: any = {
      next_date: nextDate.toISOString().split("T")[0],
      last_generated_at: new Date().toISOString(),
    };

    if (recurring.end_date && nextDate > new Date(recurring.end_date)) {
      updateData.is_active = false;
    }

    await supabase
      .from("recurring_transactions")
      .update(updateData)
      .eq("id", recurringId);

    revalidatePath("/dashboard/recurring");
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/expenses");
    
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Error al generar transacción" };
  }
}

// Get due recurring transactions (next_date <= today)
export async function getDueRecurringTransactions(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const today = new Date().toISOString().split("T")[0];
  
  const { data, error } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .lte("next_date", today)
    .order("next_date", { ascending: true });
  
  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Manually resolve source names
  const invoiceIds = data.filter(r => r.source_type === "INVOICE").map(r => r.source_id);
  const expenseIds = data.filter(r => r.source_type === "EXPENSE").map(r => r.source_id);

  const [{ data: invoices }, { data: expenses }] = await Promise.all([
    invoiceIds.length > 0
      ? supabase.from("fel_invoices").select("id, client_name, total").in("id", invoiceIds)
      : Promise.resolve({ data: [] as any[] }),
    expenseIds.length > 0
      ? supabase.from("expenses").select("id, supplier_name, amount").in("id", expenseIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const invoiceMap = Object.fromEntries((invoices || []).map(i => [i.id, i]));
  const expenseMap = Object.fromEntries((expenses || []).map(e => [e.id, { ...e, vendor_name: e.supplier_name, total_amount: e.amount }]));

  return data.map(r => ({
    ...r,
    invoice: r.source_type === "INVOICE" ? invoiceMap[r.source_id] ?? null : null,
    expense: r.source_type === "EXPENSE" ? expenseMap[r.source_id] ?? null : null,
  }));
}
