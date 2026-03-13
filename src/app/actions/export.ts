"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ─── Export Invoices ───────────────────────────────────────────

export async function exportInvoicesToCSV(
  orgId: string,
  filters?: { dateFrom?: string; dateTo?: string; status?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("fel_invoices")
    .select(`
      id, fel_serie, fel_numero, fel_type, fel_uuid,
      client_name, client_nit, invoice_date, 
      subtotal, iva_amount, total,
      status, payment_status,
      contact:contacts(name, nit_number)
    `)
    .eq("organization_id", orgId)
    .order("invoice_date", { ascending: false });

  if (filters?.dateFrom) {
    query = query.gte("invoice_date", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("invoice_date", filters.dateTo);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data: invoices, error } = await query;
  if (error) return { error: error.message };

  // Build CSV content
  const headers = [
    "Serie",
    "Número",
    "Tipo",
    "UUID FEL",
    "Cliente",
    "NIT",
    "Fecha",
    "Subtotal",
    "IVA",
    "Total",
    "Estado",
    "Estado Pago",
  ];

  const statusLabels: Record<string, string> = {
    DRAFT: "Borrador",
    CERTIFIED: "Certificada",
    VOIDED: "Anulada",
  };

  const paymentLabels: Record<string, string> = {
    UNPAID: "Sin Pagar",
    PARTIAL: "Parcial",
    PAID: "Pagada",
  };

  const rows = (invoices || []).map((inv: any) => [
    inv.fel_serie || "",
    inv.fel_numero || "",
    inv.fel_type,
    inv.fel_uuid || "",
    inv.contact?.name || inv.client_name || "CF",
    inv.contact?.nit_number || inv.client_nit || "CF",
    inv.invoice_date,
    inv.subtotal?.toFixed(2) || "0.00",
    inv.iva_amount?.toFixed(2) || "0.00",
    inv.total?.toFixed(2) || "0.00",
    statusLabels[inv.status] || inv.status,
    paymentLabels[inv.payment_status] || inv.payment_status,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return { csv, filename: `facturas_${new Date().toISOString().split("T")[0]}.csv` };
}

// ─── Export Expenses ───────────────────────────────────────────

export async function exportExpensesToCSV(
  orgId: string,
  filters?: { dateFrom?: string; dateTo?: string; status?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("expenses")
    .select(`
      id, expense_date, description, category,
      amount, iva_amount, currency,
      supplier_name, supplier_nit,
      tax_type, is_deductible, deduction_category,
      status, has_receipt,
      account:chart_of_accounts(account_code, account_name)
    `)
    .eq("organization_id", orgId)
    .order("expense_date", { ascending: false });

  if (filters?.dateFrom) {
    query = query.gte("expense_date", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("expense_date", filters.dateTo);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data: expenses, error } = await query;
  if (error) return { error: error.message };

  const headers = [
    "Fecha",
    "Descripción",
    "Categoría",
    "Cuenta Contable",
    "Proveedor",
    "NIT Proveedor",
    "Monto",
    "IVA",
    "Moneda",
    "Tipo Fiscal",
    "Deducible",
    "Cat. Deducción",
    "Factura",
    "Estado",
  ];

  const statusLabels: Record<string, string> = {
    DRAFT: "Pendiente",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
  };

  const rows = (expenses || []).map((exp: any) => [
    exp.expense_date,
    exp.description,
    exp.category || "",
    exp.account ? `${exp.account.account_code} - ${exp.account.account_name}` : "",
    exp.supplier_name || "",
    exp.supplier_nit || "",
    exp.amount?.toFixed(2) || "0.00",
    exp.iva_amount?.toFixed(2) || "0.00",
    exp.currency || "GTQ",
    exp.tax_type || "",
    exp.is_deductible ? "Sí" : "No",
    exp.deduction_category || "",
    exp.has_receipt ? "Sí" : "No",
    statusLabels[exp.status] || exp.status,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return { csv, filename: `gastos_${new Date().toISOString().split("T")[0]}.csv` };
}

// ─── Export Journal Entries ────────────────────────────────────

export async function exportJournalToCSV(
  orgId: string,
  filters?: { dateFrom?: string; dateTo?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("journal_entries")
    .select(`
      id, entry_date, description, reference_number, status,
      lines:journal_entry_lines(
        account:chart_of_accounts(account_code, account_name),
        debit, credit, description
      )
    `)
    .eq("organization_id", orgId)
    .order("entry_date", { ascending: false });

  if (filters?.dateFrom) {
    query = query.gte("entry_date", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("entry_date", filters.dateTo);
  }

  const { data: entries, error } = await query;
  if (error) return { error: error.message };

  const headers = [
    "Fecha",
    "Referencia",
    "Descripción Partida",
    "Cuenta",
    "Nombre Cuenta",
    "Descripción Línea",
    "Debe",
    "Haber",
    "Estado",
  ];

  const rows: string[][] = [];
  for (const entry of entries || []) {
    const lines = (entry.lines as any[]) || [];
    for (const line of lines) {
      rows.push([
        entry.entry_date,
        entry.reference_number || "",
        entry.description || "",
        line.account?.account_code || "",
        line.account?.account_name || "",
        line.description || "",
        line.debit?.toFixed(2) || "0.00",
        line.credit?.toFixed(2) || "0.00",
        entry.status === "POSTED" ? "Contabilizada" : "Borrador",
      ]);
    }
  }

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return { csv, filename: `partidas_${new Date().toISOString().split("T")[0]}.csv` };
}

// ─── Export Payroll ────────────────────────────────────────────

export async function exportPayrollToCSV(
  orgId: string,
  filters?: { year?: number; month?: number }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("payroll_periods")
    .select(`
      id, period_start, period_end, status, total_net_pay, total_gross_pay,
      payslips:payroll_payslips(
        employee:employees(first_name, last_name, dpi_number),
        base_salary, igss_employee, isr_withholding, bonus_incentive,
        other_deductions, net_pay
      )
    `)
    .eq("organization_id", orgId)
    .order("period_start", { ascending: false });

  if (filters?.year) {
    const startDate = `${filters.year}-01-01`;
    const endDate = `${filters.year}-12-31`;
    query = query.gte("period_start", startDate).lte("period_start", endDate);
  }

  const { data: periods, error } = await query;
  if (error) return { error: error.message };

  const headers = [
    "Período Inicio",
    "Período Fin",
    "Empleado",
    "DPI",
    "Salario Base",
    "IGSS Empleado",
    "ISR",
    "Bonificación",
    "Otras Deducciones",
    "Salario Neto",
    "Estado Período",
  ];

  const rows: string[][] = [];
  for (const period of periods || []) {
    const payslips = (period.payslips as any[]) || [];
    for (const slip of payslips) {
      rows.push([
        period.period_start,
        period.period_end,
        `${slip.employee?.first_name || ""} ${slip.employee?.last_name || ""}`.trim(),
        slip.employee?.dpi_number || "",
        slip.base_salary?.toFixed(2) || "0.00",
        slip.igss_employee?.toFixed(2) || "0.00",
        slip.isr_withholding?.toFixed(2) || "0.00",
        slip.bonus_incentive?.toFixed(2) || "0.00",
        slip.other_deductions?.toFixed(2) || "0.00",
        slip.net_pay?.toFixed(2) || "0.00",
        period.status === "PAID" ? "Pagado" : period.status === "PROCESSED" ? "Procesado" : "Borrador",
      ]);
    }
  }

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return { csv, filename: `planilla_${new Date().toISOString().split("T")[0]}.csv` };
}

// ─── Export Bank Transactions ──────────────────────────────────

export async function exportBankTransactionsToCSV(
  accountId: string,
  filters?: { dateFrom?: string; dateTo?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get account info
  const { data: account } = await supabase
    .from("bank_accounts")
    .select("account_name, bank_name")
    .eq("id", accountId)
    .single();

  let query = supabase
    .from("bank_transactions")
    .select("*")
    .eq("bank_account_id", accountId)
    .order("transaction_date", { ascending: false });

  if (filters?.dateFrom) {
    query = query.gte("transaction_date", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("transaction_date", filters.dateTo);
  }

  const { data: transactions, error } = await query;
  if (error) return { error: error.message };

  const headers = [
    "Fecha",
    "Descripción",
    "Categoría",
    "Referencia",
    "Monto",
    "Reconciliado",
  ];

  const categoryLabels: Record<string, string> = {
    DEPOSIT: "Depósito",
    WITHDRAWAL: "Retiro",
    TRANSFER: "Transferencia",
    FEE: "Comisión",
    INTEREST: "Interés",
    OTHER: "Otro",
  };

  const rows = (transactions || []).map((txn: any) => [
    txn.transaction_date,
    txn.description || "",
    categoryLabels[txn.category] || txn.category,
    txn.reference || "",
    txn.amount?.toFixed(2) || "0.00",
    txn.is_reconciled ? "Sí" : "No",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const bankName = account?.bank_name || "banco";
  return { csv, filename: `transacciones_${bankName.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv` };
}

// ─── Export Personal Tax Data ──────────────────────────────────

export async function exportPersonalTaxToCSV(orgId: string, year: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get income
  const { data: income } = await supabase
    .from("personal_income")
    .select("*")
    .eq("organization_id", orgId)
    .eq("tax_year", year)
    .order("income_date");

  // Get deductions
  const { data: deductions } = await supabase
    .from("personal_deductions")
    .select("*")
    .eq("organization_id", orgId)
    .eq("tax_year", year)
    .order("date");

  // Get retenciones
  const { data: retenciones } = await supabase
    .from("isr_retenciones")
    .select("*")
    .eq("organization_id", orgId)
    .eq("tax_year", year)
    .order("date");

  // Build multi-section CSV
  let csv = "=== INGRESOS ===\n";
  csv += "Fecha,Tipo,Descripción,Monto Bruto,ISR Retenido\n";
  for (const inc of income || []) {
    csv += `"${inc.income_date}","${inc.income_type}","${inc.description || ""}","${inc.gross_amount?.toFixed(2)}","${inc.isr_withheld?.toFixed(2) || "0.00"}"\n`;
  }

  csv += "\n=== DEDUCCIONES ===\n";
  csv += "Fecha,Tipo,Descripción,Monto\n";
  for (const ded of deductions || []) {
    csv += `"${ded.date}","${ded.deduction_type}","${ded.description || ""}","${ded.amount?.toFixed(2)}"\n`;
  }

  csv += "\n=== RETENCIONES ISR ===\n";
  csv += "Fecha,Agente Retenedor,NIT,Monto\n";
  for (const ret of retenciones || []) {
    csv += `"${ret.date}","${ret.agent_name || ""}","${ret.agent_nit || ""}","${ret.amount?.toFixed(2)}"\n`;
  }

  // Calculate totals
  const totalIncome = (income || []).reduce((sum, i: any) => sum + Number(i.gross_amount || 0), 0);
  const totalDeductions = (deductions || []).reduce((sum, d: any) => sum + Number(d.amount || 0), 0);
  const totalRetenciones = (retenciones || []).reduce((sum, r: any) => sum + Number(r.amount || 0), 0);

  csv += "\n=== RESUMEN ===\n";
  csv += `Total Ingresos,,"${totalIncome.toFixed(2)}"\n`;
  csv += `Total Deducciones,,"${totalDeductions.toFixed(2)}"\n`;
  csv += `Total Retenciones,,"${totalRetenciones.toFixed(2)}"\n`;

  return { csv, filename: `isr_personal_${year}.csv` };
}
