"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TAX_RATES } from "@/lib/tax-utils";
import type { TaxCalculation } from "@/lib/tax-utils";
import { requireOrgMembership } from "@/lib/auth-guard";

export async function calculateIVA(orgId: string, month: number, year: number): Promise<TaxCalculation> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  // Get sales (debit fiscal) from certified invoices
  const { data: invoices } = await supabase
    .from("fel_invoices")
    .select("iva_amount, total")
    .eq("organization_id", orgId)
    .eq("status", "CERTIFIED")
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate);

  const debitoFiscal = invoices?.reduce((sum: number, i: any) => sum + Number(i.iva_amount || 0), 0) ?? 0;

  // Get purchases (credit fiscal) from approved deductible expenses
  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, iva_amount")
    .eq("organization_id", orgId)
    .eq("status", "APPROVED")
    .eq("is_deductible", true)
    .gte("expense_date", startDate)
    .lte("expense_date", endDate);

  const creditoFiscal = expenses?.reduce((sum: number, e: any) => sum + Number(e.iva_amount || 0), 0) ?? 0;

  return {
    type: "IVA_MENSUAL",
    period: `${year}-${String(month).padStart(2, "0")}`,
    taxableBase: debitoFiscal + creditoFiscal,
    rate: TAX_RATES.IVA,
    taxAmount: debitoFiscal,
    credits: creditoFiscal,
    netTax: Math.max(0, debitoFiscal - creditoFiscal),
  };
}

export async function calculateISR(
  orgId: string,
  quarter: number,
  year: number,
  regime: "UTILIDADES" | "SIMPLIFICADO"
): Promise<TaxCalculation> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = quarter * 3;
  const startDate = `${year}-${String(startMonth).padStart(2, "0")}-01`;
  const endDate = new Date(year, endMonth, 0).toISOString().split("T")[0];

  // Get income from certified invoices
  const { data: invoices } = await supabase
    .from("fel_invoices")
    .select("total, iva_amount")
    .eq("organization_id", orgId)
    .eq("status", "CERTIFIED")
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate);

  const grossIncome = invoices?.reduce((sum: number, i: any) =>
    sum + Number(i.total || 0) - Number(i.iva_amount || 0), 0) ?? 0;

  if (regime === "UTILIDADES") {
    // Get deductible expenses
    const { data: expenses } = await supabase
      .from("expenses")
      .select("amount")
      .eq("organization_id", orgId)
      .eq("status", "APPROVED")
      .eq("is_deductible", true)
      .gte("expense_date", startDate)
      .lte("expense_date", endDate);

    const totalExpenses = expenses?.reduce((sum: number, e: any) =>
      sum + Number(e.amount || 0) / (1 + TAX_RATES.IVA), 0) ?? 0;

    const netIncome = Math.max(0, grossIncome - totalExpenses);
    const taxAmount = netIncome * TAX_RATES.ISR_UTILIDADES;

    return {
      type: "ISR_TRIMESTRAL",
      period: `${year}-Q${quarter}`,
      taxableBase: netIncome,
      rate: TAX_RATES.ISR_UTILIDADES,
      taxAmount,
      credits: 0,
      netTax: taxAmount,
    };
  } else {
    // Simplified regime: 5% up to Q30k/month, 7% on excess
    let totalTax = 0;
    for (let m = startMonth; m <= endMonth; m++) {
      const monthlyIncome = grossIncome / 3; // Approximate
      if (monthlyIncome <= TAX_RATES.ISR_SIMPLIFICADO_THRESHOLD) {
        totalTax += monthlyIncome * TAX_RATES.ISR_SIMPLIFICADO_LOW;
      } else {
        totalTax += TAX_RATES.ISR_SIMPLIFICADO_THRESHOLD * TAX_RATES.ISR_SIMPLIFICADO_LOW +
          (monthlyIncome - TAX_RATES.ISR_SIMPLIFICADO_THRESHOLD) * TAX_RATES.ISR_SIMPLIFICADO_HIGH;
      }
    }

    return {
      type: "ISR_TRIMESTRAL",
      period: `${year}-Q${quarter}`,
      taxableBase: grossIncome,
      rate: grossIncome > TAX_RATES.ISR_SIMPLIFICADO_THRESHOLD * 3 ? 0.07 : 0.05,
      taxAmount: totalTax,
      credits: 0,
      netTax: totalTax,
    };
  }
}

export async function calculateISO(orgId: string, quarter: number, year: number): Promise<TaxCalculation> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  // ISO = 1% of the greater of: total net assets OR gross quarterly income / 4
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = quarter * 3;
  const startDate = `${year}-${String(startMonth).padStart(2, "0")}-01`;
  const endDate = new Date(year, endMonth, 0).toISOString().split("T")[0];

  const { data: invoices } = await supabase
    .from("fel_invoices")
    .select("total")
    .eq("organization_id", orgId)
    .eq("status", "CERTIFIED")
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate);

  const quarterlyIncome = invoices?.reduce((sum: number, i: any) => sum + Number(i.total || 0), 0) ?? 0;
  const annualizedIncome = quarterlyIncome * 4;

  // For simplicity, use quarterly income / 4 as base
  const taxBase = quarterlyIncome;
  const taxAmount = taxBase * TAX_RATES.ISO;

  return {
    type: "ISO_TRIMESTRAL",
    period: `${year}-Q${quarter}`,
    taxableBase: taxBase,
    rate: TAX_RATES.ISO,
    taxAmount,
    credits: 0,
    netTax: taxAmount,
  };
}

export async function createTaxFiling(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  const formType = (formData.get("tax_type") as string) || (formData.get("form_type") as string);
  const period = formData.get("period") as string;
  const taxableBase = parseFloat(formData.get("taxable_base") as string || "0");
  const taxAmount = parseFloat(formData.get("tax_amount") as string || "0");
  const credits = parseFloat(formData.get("credits") as string || "0");
  const netTax = parseFloat(formData.get("net_tax") as string || "0");

  // Parse period to extract year, month, quarter
  let periodYear = new Date().getFullYear();
  let periodMonth: number | null = null;
  let periodQuarter: number | null = null;

  if (period) {
    const [yearStr, rest] = period.split("-");
    periodYear = parseInt(yearStr);
    if (rest?.startsWith("Q")) {
      periodQuarter = parseInt(rest[1]);
    } else if (rest) {
      periodMonth = parseInt(rest);
    }
  }

  // Build the insert object based on form type
  const insertData: Record<string, any> = {
    organization_id: orgId,
    form_type: formType,
    period_year: periodYear,
    period_month: periodMonth,
    period_quarter: periodQuarter,
    status: "CALCULATED",
  };

  // Fill type-specific fields
  if (formType === "IVA_MENSUAL") {
    insertData.iva_debito = taxAmount;
    insertData.iva_credito = credits;
    insertData.iva_a_pagar = netTax;
  } else if (formType === "ISR_TRIMESTRAL" || formType === "ISR_MENSUAL") {
    insertData.gross_income = taxableBase + (formData.get("deductible_expenses") ? parseFloat(formData.get("deductible_expenses") as string) : 0);
    insertData.deductible_expenses = formData.get("deductible_expenses") ? parseFloat(formData.get("deductible_expenses") as string) : 0;
    insertData.taxable_income = taxableBase;
    insertData.isr_amount = taxAmount;
    insertData.isr_balance = netTax;
  } else if (formType === "ISO_TRIMESTRAL") {
    insertData.iso_base = taxableBase;
    insertData.iso_amount = taxAmount;
  }

  const { error } = await supabase.from("tax_filings").insert(insertData);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/tax");
  return { success: true };
}

export async function getTaxFilings(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { data, error } = await supabase
    .from("tax_filings")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
