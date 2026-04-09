"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrgMembership } from "@/lib/auth-guard";
import { logAuditEvent } from "@/app/actions/audit";
import type { ImportCategory } from "@/lib/import/schemas";

// ─── Bulk Import Server Actions ────────────────────────────────
// Each function inserts an array of rows into the correct table
// and returns { saved, failed, errors }.

interface BulkSaveResult {
  saved: number;
  failed: number;
  errors: string[];
}

// ─── Expenses ──────────────────────────────────────────────────

export async function bulkSaveExpenses(
  orgId: string,
  rows: Record<string, string>[]
): Promise<BulkSaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  let saved = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const total = parseFloat(r.total) || 0;
    const taxAmount = parseFloat(r.tax_amount) || 0;

    const { error } = await supabase.from("expenses").insert({
      organization_id: orgId,
      expense_date: r.date || new Date().toISOString().split("T")[0],
      description: r.description || "Importado",
      amount: total,
      iva_amount: taxAmount,
      currency: r.currency || "GTQ",
      exchange_rate: 1.0,
      category: r.category || null,
      supplier_nit: r.vendor_tax_id || null,
      supplier_name: r.vendor_name || null,
      tax_type: taxAmount > 0 ? "GRAVADA" : "EXENTA",
      is_deductible: true,
      has_receipt: true,
      status: "DRAFT",
      created_by: user.id,
    });

    if (error) {
      failed++;
      errors.push(`Fila ${i + 1}: ${error.message}`);
    } else {
      saved++;
    }
  }

  await logAuditEvent({
    user_id: user.id,
    organization_id: orgId,
    action: "CREATE",
    entity_type: "EXPENSE",
    entity_id: null,
    description: `Importación masiva: ${saved} gastos creados, ${failed} fallidos`,
  });

  revalidatePath("/dashboard/expenses");
  return { saved, failed, errors };
}

// ─── Invoices (headers only) ───────────────────────────────────

export async function bulkSaveInvoices(
  orgId: string,
  rows: Record<string, string>[]
): Promise<BulkSaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  let saved = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const total = parseFloat(r.total) || 0;
    const subtotal = parseFloat(r.subtotal) || total / 1.12;
    const taxAmount = parseFloat(r.tax_amount) || total - subtotal;

    // Try to find existing contact by NIT
    let contactId: string | null = null;
    if (r.customer_tax_id) {
      const { data: contact } = await supabase
        .from("contacts")
        .select("id")
        .eq("organization_id", orgId)
        .eq("nit_number", r.customer_tax_id)
        .maybeSingle();
      contactId = contact?.id || null;
    }

    const { error } = await supabase.from("fel_invoices").insert({
      organization_id: orgId,
      invoice_date: r.issue_date || new Date().toISOString().split("T")[0],
      client_name: r.customer_name || "Consumidor Final",
      client_nit: r.customer_tax_id || "CF",
      contact_id: contactId,
      subtotal: Math.round(subtotal * 100) / 100,
      tax_amount: Math.round(taxAmount * 100) / 100,
      total,
      currency: r.currency || "GTQ",
      exchange_rate: 1.0,
      fel_type: "FACT",
      status: "DRAFT",
      payment_status: "UNPAID",
      notes: r.notes || null,
      created_by: user.id,
    });

    if (error) {
      failed++;
      errors.push(`Fila ${i + 1}: ${error.message}`);
    } else {
      saved++;
    }
  }

  await logAuditEvent({
    user_id: user.id,
    organization_id: orgId,
    action: "CREATE",
    entity_type: "FEL_INVOICE",
    entity_id: null,
    description: `Importación masiva: ${saved} facturas creadas, ${failed} fallidas`,
  });

  revalidatePath("/dashboard/invoices");
  return { saved, failed, errors };
}

// ─── Contacts ──────────────────────────────────────────────────

export async function bulkSaveContacts(
  orgId: string,
  rows: Record<string, string>[]
): Promise<BulkSaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  let saved = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    const { error } = await supabase.from("contacts").insert({
      organization_id: orgId,
      name: r.contact_name || r.company_name || "Sin Nombre",
      company_name: r.company_name || null,
      nit_number: r.tax_id || null,
      email: r.email || null,
      phone: r.phone || null,
      address: r.address || null,
      contact_type: r.contact_type || "CLIENT",
      is_active: true,
    });

    if (error) {
      failed++;
      errors.push(`Fila ${i + 1}: ${error.message}`);
    } else {
      saved++;
    }
  }

  await logAuditEvent({
    user_id: user.id,
    organization_id: orgId,
    action: "CREATE",
    entity_type: "CONTACT",
    entity_id: null,
    description: `Importación masiva: ${saved} contactos creados, ${failed} fallidos`,
  });

  revalidatePath("/dashboard/contacts");
  return { saved, failed, errors };
}

// ─── Products ──────────────────────────────────────────────────

export async function bulkSaveProducts(
  orgId: string,
  rows: Record<string, string>[]
): Promise<BulkSaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  let saved = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const price = parseFloat(r.price) || 0;

    const { error } = await supabase.from("inventory_items").insert({
      organization_id: orgId,
      item_code: r.product_code || `PROD-${i + 1}`,
      name: r.product_name || "Producto Importado",
      description: r.description || null,
      category: r.category || null,
      unit_price: price,
      tax_type: r.tax_type || "IVA",
      current_stock: parseInt(r.stock_quantity) || 0,
      is_active: true,
    });

    if (error) {
      failed++;
      errors.push(`Fila ${i + 1}: ${error.message}`);
    } else {
      saved++;
    }
  }

  await logAuditEvent({
    user_id: user.id,
    organization_id: orgId,
    action: "CREATE",
    entity_type: "INVENTORY",
    entity_id: null,
    description: `Importación masiva: ${saved} productos creados, ${failed} fallidos`,
  });

  revalidatePath("/dashboard/inventory");
  return { saved, failed, errors };
}

// ─── Bank Transactions ─────────────────────────────────────────

export async function bulkSaveBankTransactions(
  orgId: string,
  bankAccountId: string,
  rows: Record<string, string>[]
): Promise<BulkSaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  let saved = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const debit = parseFloat(r.debit) || 0;
    const credit = parseFloat(r.credit) || 0;
    // Convention: positive = credit/deposit, negative = debit/withdrawal
    const amount = credit > 0 ? credit : -debit;

    const { error } = await supabase.from("bank_transactions").insert({
      bank_account_id: bankAccountId,
      organization_id: orgId,
      transaction_date:
        r.transaction_date || new Date().toISOString().split("T")[0],
      description: r.description || "Transacción importada",
      amount,
      reference_number: r.reference || null,
      category: r.category || (amount >= 0 ? "DEPOSIT" : "WITHDRAWAL"),
      status: "CONFIRMED",
    });

    if (error) {
      failed++;
      errors.push(`Fila ${i + 1}: ${error.message}`);
    } else {
      saved++;
    }
  }

  await logAuditEvent({
    user_id: user.id,
    organization_id: orgId,
    action: "CREATE",
    entity_type: "BANK_TRANSACTION",
    entity_id: null,
    description: `Importación masiva: ${saved} transacciones creadas, ${failed} fallidas`,
  });

  revalidatePath("/dashboard/banking");
  return { saved, failed, errors };
}

// ─── Dispatcher ────────────────────────────────────────────────
// Convenience function to route to the correct saver

export async function bulkSaveImport(
  orgId: string,
  category: ImportCategory,
  rows: Record<string, string>[],
  bankAccountId?: string
): Promise<BulkSaveResult> {
  switch (category) {
    case "expense":
      return bulkSaveExpenses(orgId, rows);
    case "invoice":
      return bulkSaveInvoices(orgId, rows);
    case "contact":
      return bulkSaveContacts(orgId, rows);
    case "product":
      return bulkSaveProducts(orgId, rows);
    case "bank_transaction":
      if (!bankAccountId) {
        return {
          saved: 0,
          failed: rows.length,
          errors: ["Se requiere una cuenta bancaria para importar transacciones"],
        };
      }
      return bulkSaveBankTransactions(orgId, bankAccountId, rows);
    default:
      return {
        saved: 0,
        failed: rows.length,
        errors: [`Categoría no soportada: ${category}`],
      };
  }
}
