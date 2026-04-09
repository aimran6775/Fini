"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAuditEvent } from "@/app/actions/audit";
import { PAYMENT_METHOD_LABELS } from "@/lib/tax-utils";
import type { PaymentMethod } from "@/lib/types/database";
import { requireOrgMembership, verifyEntityOwnership } from "@/lib/auth-guard";

export async function getInvoices(orgId: string, filters?: {
  status?: string;
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  let query = supabase
    .from("fel_invoices")
    .select(`*, contact:contacts(id, name, nit_number), items:fel_invoice_items(*)`)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.type) query = query.eq("fel_type", filters.type);
  if (filters?.search) {
    const s = filters.search.replace(/[%_(),.'"\\]/g, "");
    if (s) query = query.or(`client_name.ilike.%${s}%,client_nit.ilike.%${s}%,fel_serie.ilike.%${s}%`);
  }
  if (filters?.dateFrom) query = query.gte("invoice_date", filters.dateFrom);
  if (filters?.dateTo) query = query.lte("invoice_date", filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getInvoice(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "fel_invoices", id);

  const { data, error } = await supabase
    .from("fel_invoices")
    .select(`*, contact:contacts(id, name, nit_number, email, phone, address), items:fel_invoice_items(*)`)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createInvoice(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  const felType = formData.get("fel_type") as string || "FACT";
  const contactId = formData.get("contact_id") as string;
  const clientName = formData.get("client_name") as string || "Consumidor Final";
  const clientNit = formData.get("client_nit") as string || "CF";
  const clientAddress = formData.get("client_address") as string;
  const clientEmail = formData.get("client_email") as string;
  const invoiceDate = formData.get("invoice_date") as string;
  const dueDate = formData.get("due_date") as string;
  const currency = formData.get("currency") as string || "GTQ";
  const taxType = formData.get("tax_type") as string || "GRAVADA";
  const notes = formData.get("notes") as string;
  const itemsJson = formData.get("items") as string;

  let items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    discount: number;
    tax_type: string;
    bien_o_servicio: string;
  }> = [];

  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: "Items inválidos" };
  }

  // Calculate totals
  let subtotal = 0;
  let totalIva = 0;

  const processedItems = items.map((item) => {
    const lineTotal = item.quantity * item.unit_price;
    const discount = item.discount || 0;
    const netAmount = lineTotal - discount;
    subtotal += netAmount;

    const itemTaxType = item.tax_type || taxType;
    let ivaAmount = 0;
    // FPEQ (pequeño contribuyente) does NOT charge IVA — pays 5% flat tax instead
    if (itemTaxType === "GRAVADA" && felType !== "FPEQ") {
      // IVA 12% is included in Guatemala prices
      ivaAmount = netAmount - (netAmount / 1.12);
    }
    totalIva += ivaAmount;

    return {
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: discount,
      tax_type: itemTaxType,
      iva_amount: Math.round(ivaAmount * 100) / 100,
      line_total: Math.round(netAmount * 100) / 100,
      bien_o_servicio: item.bien_o_servicio || "B",
    };
  });

  const total = subtotal;

  // Create invoice — matches fel_invoices table exactly
  const { data: invoice, error: invoiceError } = await supabase
    .from("fel_invoices")
    .insert({
      organization_id: orgId,
      fel_type: felType,
      status: "DRAFT",
      payment_status: "UNPAID",
      client_name: clientName,
      client_nit: clientNit,
      client_address: clientAddress || null,
      client_email: clientEmail || null,
      currency,
      exchange_rate: 1.0,
      subtotal: Math.round(subtotal * 100) / 100,
      iva_amount: Math.round(totalIva * 100) / 100,
      total: Math.round(total * 100) / 100,
      tax_type: taxType,
      is_pequeno_contribuyente: felType === "FPEQ",
      // FESP (Factura Especial): mandatory ISR & IVA retentions
      retencion_isr: felType === "FESP" ? Math.round(total * 0.05 * 100) / 100 : 0,
      retencion_iva: felType === "FESP" ? Math.round(totalIva * 100) / 100 : 0,
      contact_id: contactId || null,
      notes: notes || null,
      invoice_date: invoiceDate || new Date().toISOString().split("T")[0],
      due_date: dueDate || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (invoiceError) return { error: invoiceError.message };

  // Create invoice items — matches fel_invoice_items table exactly
  const itemRecords = processedItems.map((item) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount: item.discount,
    tax_type: item.tax_type,
    iva_amount: item.iva_amount,
    line_total: item.line_total,
    bien_o_servicio: item.bien_o_servicio,
  }));

  const { error: itemsError } = await supabase
    .from("fel_invoice_items")
    .insert(itemRecords);

  if (itemsError) return { error: itemsError.message };

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function certifyInvoice(invoiceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "fel_invoices", invoiceId);

  // In production, this would call the FEL certificador API (INFILE, DIGIFACT, etc.)
  // For now, we simulate certification
  const uuid = crypto.randomUUID();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("fel_invoices")
    .update({
      status: "CERTIFIED",
      fel_uuid: uuid,
      fel_fecha_certificacion: now,
      fel_serie: "A",
      fel_numero: String(Math.floor(Math.random() * 1000000)),
    })
    .eq("id", invoiceId);

  if (error) return { error: error.message };

  // Audit log
  const { data: inv } = await supabase.from("fel_invoices").select("organization_id, client_name, total").eq("id", invoiceId).single();
  if (inv) {
    await logAuditEvent({
      organization_id: inv.organization_id,
      user_id: user.id,
      action: "CERTIFY",
      entity_type: "fel_invoices",
      entity_id: invoiceId,
      description: `Factura certificada: ${inv.client_name} — Q${inv.total}`,
    });
  }

  revalidatePath("/dashboard/invoices");
  return { success: true, uuid };
}

export async function voidInvoice(invoiceId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "fel_invoices", invoiceId);

  // In production, this would call the FEL anulación API
  const { error } = await supabase
    .from("fel_invoices")
    .update({
      status: "VOIDED",
      notes: reason,
    })
    .eq("id", invoiceId);

  if (error) return { error: error.message };

  // Audit log
  const { data: inv } = await supabase.from("fel_invoices").select("organization_id, client_name, total").eq("id", invoiceId).single();
  if (inv) {
    await logAuditEvent({
      organization_id: inv.organization_id,
      user_id: user.id,
      action: "VOID",
      entity_type: "fel_invoices",
      entity_id: invoiceId,
      description: `Factura anulada: ${inv.client_name} — Q${inv.total}`,
    });
  }

  revalidatePath("/dashboard/invoices");
  return { success: true };
}

export async function updateInvoice(invoiceId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "fel_invoices", invoiceId);

  // Only DRAFT invoices can be edited
  const { data: existing } = await supabase
    .from("fel_invoices")
    .select("status")
    .eq("id", invoiceId)
    .single();

  if (existing?.status !== "DRAFT") {
    return { error: "Solo se pueden editar facturas en borrador" };
  }

  const felType = formData.get("fel_type") as string || "FACT";
  const clientName = formData.get("client_name") as string || "Consumidor Final";
  const clientNit = formData.get("client_nit") as string || "CF";
  const clientAddress = formData.get("client_address") as string;
  const clientEmail = formData.get("client_email") as string;
  const invoiceDate = formData.get("invoice_date") as string;
  const dueDate = formData.get("due_date") as string;
  const currency = formData.get("currency") as string || "GTQ";
  const taxType = formData.get("tax_type") as string || "GRAVADA";
  const notes = formData.get("notes") as string;
  const contactId = formData.get("contact_id") as string;
  const itemsJson = formData.get("items") as string;

  let items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    discount: number;
    tax_type: string;
    bien_o_servicio: string;
  }> = [];

  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: "Items inválidos" };
  }

  // Calculate totals
  let subtotal = 0;
  let totalIva = 0;

  const processedItems = items.map((item) => {
    const lineTotal = item.quantity * item.unit_price;
    const discount = item.discount || 0;
    const netAmount = lineTotal - discount;
    subtotal += netAmount;

    const itemTaxType = item.tax_type || taxType;
    let ivaAmount = 0;
    // FPEQ does NOT charge IVA
    if (itemTaxType === "GRAVADA" && felType !== "FPEQ") {
      ivaAmount = netAmount - (netAmount / 1.12);
    }
    totalIva += ivaAmount;

    return {
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount,
      tax_type: itemTaxType,
      iva_amount: Math.round(ivaAmount * 100) / 100,
      line_total: Math.round(netAmount * 100) / 100,
      bien_o_servicio: item.bien_o_servicio || "B",
    };
  });

  const total = subtotal;

  // Update invoice
  const { error: invoiceError } = await supabase
    .from("fel_invoices")
    .update({
      fel_type: felType,
      client_name: clientName,
      client_nit: clientNit,
      client_address: clientAddress || null,
      client_email: clientEmail || null,
      currency,
      subtotal: Math.round(subtotal * 100) / 100,
      iva_amount: Math.round(totalIva * 100) / 100,
      total: Math.round(total * 100) / 100,
      tax_type: taxType,
      is_pequeno_contribuyente: felType === "FPEQ",
      contact_id: contactId || null,
      notes: notes || null,
      invoice_date: invoiceDate || new Date().toISOString().split("T")[0],
      due_date: dueDate || null,
    })
    .eq("id", invoiceId);

  if (invoiceError) return { error: invoiceError.message };

  // Replace items: delete old, insert new
  await supabase.from("fel_invoice_items").delete().eq("invoice_id", invoiceId);

  const itemRecords = processedItems.map((item) => ({
    invoice_id: invoiceId,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount: item.discount,
    tax_type: item.tax_type,
    iva_amount: item.iva_amount,
    line_total: item.line_total,
    bien_o_servicio: item.bien_o_servicio,
  }));

  const { error: itemsError } = await supabase
    .from("fel_invoice_items")
    .insert(itemRecords);

  if (itemsError) return { error: itemsError.message };

  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  revalidatePath("/dashboard/invoices");
  redirect(`/dashboard/invoices/${invoiceId}`);
}

export async function deleteInvoice(invoiceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Can only delete drafts
  const { data: invoice } = await supabase
    .from("fel_invoices")
    .select("status")
    .eq("id", invoiceId)
    .single();

  if (invoice?.status !== "DRAFT") {
    return { error: "Solo se pueden eliminar facturas en borrador" };
  }

  await supabase.from("fel_invoice_items").delete().eq("invoice_id", invoiceId);
  const { error } = await supabase.from("fel_invoices").delete().eq("id", invoiceId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/invoices");
  return { success: true };
}

// ─── PAYMENT FUNCTIONS ─────────────────────────────────────────

export async function getInvoicePayments(invoiceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoice_payments")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("payment_date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function recordPayment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const invoiceId = formData.get("invoice_id") as string;
  const orgId = formData.get("organization_id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const paymentDate = formData.get("payment_date") as string;
  const paymentMethod = (formData.get("payment_method") as string) || "EFECTIVO";
  const referenceNumber = formData.get("reference_number") as string;
  const bankAccountId = formData.get("bank_account_id") as string;
  const notes = formData.get("notes") as string;

  // Validate invoice exists and get its total
  const { data: invoice } = await supabase
    .from("fel_invoices")
    .select("total, client_name, organization_id")
    .eq("id", invoiceId)
    .single();

  if (!invoice) return { error: "Factura no encontrada" };
  
  // Check organization matches
  if (invoice.organization_id !== orgId) {
    return { error: "No tiene permiso para esta factura" };
  }

  if (isNaN(amount) || amount <= 0) return { error: "El monto debe ser mayor a cero" };

  // Get existing payments
  const { data: existingPayments } = await supabase
    .from("invoice_payments")
    .select("amount")
    .eq("invoice_id", invoiceId);

  const totalPaid = (existingPayments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Number(invoice.total) - totalPaid;

  if (amount > remaining + 0.01) {
    return { error: `El monto excede el saldo pendiente de Q${remaining.toFixed(2)}` };
  }

  // Insert payment
  const { data: payment, error: paymentError } = await supabase
    .from("invoice_payments")
    .insert({
      invoice_id: invoiceId,
      organization_id: orgId,
      amount,
      payment_date: paymentDate || new Date().toISOString().split("T")[0],
      payment_method: paymentMethod,
      reference_number: referenceNumber || null,
      bank_account_id: bankAccountId && bankAccountId !== "_none" ? bankAccountId : null,
      notes: notes || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (paymentError) return { error: paymentError.message };

  // Update payment status on invoice (trigger should do this, but let's be safe)
  const newTotalPaid = totalPaid + amount;
  const newStatus = newTotalPaid >= Number(invoice.total) ? "PAID" 
                  : newTotalPaid > 0 ? "PARTIAL" 
                  : "UNPAID";

  await supabase
    .from("fel_invoices")
    .update({ 
      payment_status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", invoiceId);

  // Log audit event
  await logAuditEvent({
    organization_id: orgId,
    user_id: user.id,
    action: "CREATE",
    entity_type: "invoice_payments",
    entity_id: payment.id,
    description: `Pago registrado: Q${amount.toFixed(2)} a ${invoice.client_name} (${PAYMENT_METHOD_LABELS[paymentMethod as PaymentMethod] || paymentMethod})`,
  });

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return { success: true, payment };
}

export async function deletePayment(paymentId: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get payment info first
  const { data: payment } = await supabase
    .from("invoice_payments")
    .select("*, invoice:fel_invoices(client_name, total)")
    .eq("id", paymentId)
    .single();

  if (!payment) return { error: "Pago no encontrado" };
  if (payment.organization_id !== orgId) {
    return { error: "No tiene permiso para este pago" };
  }

  const invoiceId = payment.invoice_id;

  // Delete payment
  const { error } = await supabase
    .from("invoice_payments")
    .delete()
    .eq("id", paymentId);

  if (error) return { error: error.message };

  // Recalculate payment status
  const { data: remainingPayments } = await supabase
    .from("invoice_payments")
    .select("amount")
    .eq("invoice_id", invoiceId);

  const totalPaid = (remainingPayments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  
  // Get invoice total
  const { data: invoice } = await supabase
    .from("fel_invoices")
    .select("total")
    .eq("id", invoiceId)
    .single();

  const newStatus = totalPaid >= Number(invoice?.total || 0) ? "PAID" 
                  : totalPaid > 0 ? "PARTIAL" 
                  : "UNPAID";

  await supabase
    .from("fel_invoices")
    .update({ 
      payment_status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", invoiceId);

  // Log audit
  await logAuditEvent({
    organization_id: orgId,
    user_id: user.id,
    action: "DELETE",
    entity_type: "invoice_payments",
    entity_id: paymentId,
    description: `Pago eliminado: Q${payment.amount}`,
  });

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return { success: true };
}

export async function getInvoiceWithPayments(invoiceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "fel_invoices", invoiceId);

  const { data: invoice, error: invoiceError } = await supabase
    .from("fel_invoices")
    .select(`*, contact:contacts(id, name, nit_number, email, phone, address), items:fel_invoice_items(*)`)
    .eq("id", invoiceId)
    .single();

  if (invoiceError) throw invoiceError;

  const { data: payments, error: paymentsError } = await supabase
    .from("invoice_payments")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("payment_date", { ascending: false });

  if (paymentsError) throw paymentsError;

  const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    ...invoice,
    amount_paid: totalPaid,
    payments: payments || [],
  };
}

// ─── Bulk Actions ──────────────────────────────────────────────

export async function bulkDeleteInvoices(ids: string[], orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only allow deleting DRAFT invoices
  const { data: invoices } = await supabase
    .from("fel_invoices")
    .select("id, status")
    .in("id", ids)
    .eq("organization_id", orgId);

  const draftIds = invoices?.filter(inv => inv.status === "DRAFT").map(inv => inv.id) || [];
  
  if (draftIds.length === 0) {
    return { error: "Solo se pueden eliminar facturas en borrador" };
  }

  const { error } = await supabase
    .from("fel_invoices")
    .delete()
    .in("id", draftIds)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };

  await logAuditEvent({
    user_id: user.id,
    organization_id: orgId,
    action: "BULK_DELETE",
    entity_type: "INVOICE",
    entity_id: null,
    description: `${draftIds.length} facturas eliminadas`,
  });

  revalidatePath("/dashboard/invoices");
  return { success: true, deleted: draftIds.length };
}

export async function bulkCertifyInvoices(ids: string[], orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only DRAFT invoices can be certified
  const { data: invoices } = await supabase
    .from("fel_invoices")
    .select("id, status")
    .in("id", ids)
    .eq("organization_id", orgId)
    .eq("status", "DRAFT");

  if (!invoices || invoices.length === 0) {
    return { error: "No hay facturas en borrador para certificar" };
  }

  // In production this would call FEL API, for now just update status
  const { error } = await supabase
    .from("fel_invoices")
    .update({ status: "CERTIFIED" })
    .in("id", invoices.map(inv => inv.id))
    .eq("organization_id", orgId);

  if (error) return { error: error.message };

  await logAuditEvent({
    user_id: user.id,
    organization_id: orgId,
    action: "BULK_UPDATE",
    entity_type: "INVOICE",
    entity_id: null,
    description: `${invoices.length} facturas certificadas`,
  });

  revalidatePath("/dashboard/invoices");
  return { success: true, certified: invoices.length };
}

export async function bulkVoidInvoices(ids: string[], orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only DRAFT or CERTIFIED can be voided
  const { data: invoices } = await supabase
    .from("fel_invoices")
    .select("id, status")
    .in("id", ids)
    .eq("organization_id", orgId)
    .in("status", ["DRAFT", "CERTIFIED"]);

  if (!invoices || invoices.length === 0) {
    return { error: "No hay facturas que se puedan anular" };
  }

  const { error } = await supabase
    .from("fel_invoices")
    .update({ status: "VOIDED" })
    .in("id", invoices.map(inv => inv.id))
    .eq("organization_id", orgId);

  if (error) return { error: error.message };

  await logAuditEvent({
    user_id: user.id,
    organization_id: orgId,
    action: "BULK_UPDATE",
    entity_type: "INVOICE",
    entity_id: null,
    description: `${invoices.length} facturas anuladas`,
  });

  revalidatePath("/dashboard/invoices");
  return { success: true, voided: invoices.length };
}
