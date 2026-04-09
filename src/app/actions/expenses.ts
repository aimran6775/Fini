"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAuditEvent } from "@/app/actions/audit";
import { requireOrgMembership, verifyEntityOwnership } from "@/lib/auth-guard";
import { expenseSchema } from "@/lib/types/forms";
import { sanitizeSearch } from "@/lib/validate";

export async function getExpenses(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { data, error } = await supabase
    .from("expenses")
    .select(`*, account:chart_of_accounts(id, account_code, account_name), contact:contacts(id, name)`)
    .eq("organization_id", orgId)
    .order("expense_date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createExpense(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  if (isNaN(amount) || amount <= 0) return { error: "El monto debe ser mayor a cero" };

  // Validate with Zod schema
  const validation = expenseSchema.safeParse({
    description: formData.get("description") as string,
    amount,
    expense_date: formData.get("expense_date") as string,
    currency: (formData.get("currency") as string) || "GTQ",
    tax_type: (formData.get("tax_type") as string) || "GRAVADA",
  });
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Datos inválidos" };
  }

  const { error } = await supabase.from("expenses").insert({
    organization_id: orgId,
    expense_date: formData.get("expense_date") as string,
    description: formData.get("description") as string,
    amount,
    iva_amount: parseFloat(formData.get("iva_amount") as string || "0"),

    currency: (formData.get("currency") as string) || "GTQ",
    exchange_rate: 1.0,
    category: (formData.get("category") as string) || null,
    account_id: (formData.get("account_id") as string) || null,
    contact_id: (formData.get("contact_id") as string) || null,
    tax_type: (formData.get("tax_type") as string) || "GRAVADA",
    is_deductible: formData.get("is_deductible") !== "false",
    deduction_category: (formData.get("deduction_category") as string) || null,
    has_receipt: formData.get("has_receipt") === "true",
    supplier_nit: (formData.get("supplier_nit") as string) || null,
    supplier_name: (formData.get("supplier_name") as string) || null,
    fel_uuid: (formData.get("fel_uuid") as string) || null,
    fel_serie: (formData.get("fel_serie") as string) || null,
    fel_numero: (formData.get("fel_numero") as string) || null,
    status: "DRAFT",
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/expenses");
  redirect("/dashboard/expenses");
}

export async function approveExpense(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "expenses", id);

  const { error } = await supabase
    .from("expenses")
    .update({ status: "APPROVED", approved_by: user.id })
    .eq("id", id);

  if (error) return { error: error.message };

  // Audit log
  const { data: exp } = await supabase.from("expenses").select("organization_id, description, amount").eq("id", id).single();
  if (exp) {
    await logAuditEvent({
      organization_id: exp.organization_id,
      user_id: user.id,
      action: "APPROVE",
      entity_type: "expenses",
      entity_id: id,
      description: `Gasto aprobado: ${exp.description} — Q${exp.amount}`,
    });
  }

  revalidatePath("/dashboard/expenses");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "expenses", id);

  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/expenses");
  return { success: true };
}

export async function getExpense(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "expenses", id);

  const { data, error } = await supabase
    .from("expenses")
    .select(`*, account:chart_of_accounts(id, account_code, account_name), contact:contacts(id, name)`)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only DRAFT expenses can be edited
  const { data: existing } = await supabase
    .from("expenses")
    .select("status")
    .eq("id", id)
    .single();

  if (existing?.status !== "DRAFT") {
    return { error: "Solo se pueden editar gastos en borrador" };
  }

  const amount = parseFloat(formData.get("amount") as string);
  const taxType = (formData.get("tax_type") as string) || "GRAVADA";
  const ivaAmount = taxType === "GRAVADA" ? Math.round((amount - amount / 1.12) * 100) / 100 : 0;

  const { error } = await supabase
    .from("expenses")
    .update({
      expense_date: formData.get("expense_date") as string,
      description: formData.get("description") as string,
      amount,
      iva_amount: ivaAmount,
      currency: (formData.get("currency") as string) || "GTQ",
      category: (formData.get("category") as string) || null,
      account_id: (formData.get("account_id") as string) || null,
      contact_id: (formData.get("contact_id") as string) || null,
      tax_type: taxType,
      is_deductible: formData.get("is_deductible") !== "false",
      deduction_category: (formData.get("deduction_category") as string) || null,
      has_receipt: formData.get("has_receipt") === "true",
      supplier_nit: (formData.get("supplier_nit") as string) || null,
      supplier_name: (formData.get("supplier_name") as string) || null,
      fel_uuid: (formData.get("fel_uuid") as string) || null,
      fel_serie: (formData.get("fel_serie") as string) || null,
      fel_numero: (formData.get("fel_numero") as string) || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/expenses/${id}`);
  revalidatePath("/dashboard/expenses");
  redirect(`/dashboard/expenses/${id}`);
}

// ─── Bulk Actions ──────────────────────────────────────────────

export async function bulkDeleteExpenses(ids: string[], orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only allow deleting DRAFT expenses
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, status")
    .in("id", ids)
    .eq("organization_id", orgId);

  const draftIds = expenses?.filter(exp => exp.status === "DRAFT").map(exp => exp.id) || [];
  
  if (draftIds.length === 0) {
    return { error: "Solo se pueden eliminar gastos en borrador" };
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .in("id", draftIds)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };

  await logAuditEvent({
    user_id: user.id,
    organization_id: orgId,
    action: "BULK_DELETE",
    entity_type: "EXPENSE",
    entity_id: null,
    description: `${draftIds.length} gastos eliminados`,
  });

  revalidatePath("/dashboard/expenses");
  return { success: true, deleted: draftIds.length };
}

export async function bulkApproveExpenses(ids: string[], orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only DRAFT expenses can be approved
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, status")
    .in("id", ids)
    .eq("organization_id", orgId)
    .eq("status", "DRAFT");

  if (!expenses || expenses.length === 0) {
    return { error: "No hay gastos en borrador para aprobar" };
  }

  const { error } = await supabase
    .from("expenses")
    .update({ status: "APPROVED", approved_by: user.id })
    .in("id", expenses.map(exp => exp.id))
    .eq("organization_id", orgId);

  if (error) return { error: error.message };

  await logAuditEvent({
    user_id: user.id,
    organization_id: orgId,
    action: "BULK_UPDATE",
    entity_type: "EXPENSE",
    entity_id: null,
    description: `${expenses.length} gastos aprobados`,
  });

  revalidatePath("/dashboard/expenses");
  return { success: true, approved: expenses.length };
}
