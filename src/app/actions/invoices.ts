"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAuditEvent } from "@/app/actions/audit";

export async function getInvoices(orgId: string, filters?: {
  status?: string;
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("fel_invoices")
    .select(`*, contact:contacts(id, name, nit_number), items:fel_invoice_items(*)`)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.type) query = query.eq("fel_type", filters.type);
  if (filters?.search) query = query.or(`client_name.ilike.%${filters.search}%,client_nit.ilike.%${filters.search}%,fel_serie.ilike.%${filters.search}%`);
  if (filters?.dateFrom) query = query.gte("invoice_date", filters.dateFrom);
  if (filters?.dateTo) query = query.lte("invoice_date", filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getInvoice(id: string) {
  const supabase = await createClient();
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
    if (itemTaxType === "GRAVADA") {
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
      retencion_isr: 0,
      retencion_iva: 0,
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

  // Get user for audit
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
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
  }

  revalidatePath("/dashboard/invoices");
  return { success: true, uuid };
}

export async function voidInvoice(invoiceId: string, reason: string) {
  const supabase = await createClient();

  // In production, this would call the FEL anulación API
  const { error } = await supabase
    .from("fel_invoices")
    .update({
      status: "VOIDED",
      notes: reason,
    })
    .eq("id", invoiceId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/invoices");
  return { success: true };
}

export async function updateInvoice(invoiceId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
    if (itemTaxType === "GRAVADA") {
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
