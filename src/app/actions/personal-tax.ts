"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TAX_RATES } from "@/lib/tax-utils";

// ─── Personal Income Actions ───────────────────────────────────────────────

export async function getPersonalIncome(orgId: string, year?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const targetYear = year || new Date().getFullYear();
  
  const { data, error } = await supabase
    .from("personal_income")
    .select("*")
    .eq("organization_id", orgId)
    .eq("period_year", targetYear)
    .order("income_date", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createPersonalIncome(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  const incomeDate = new Date(formData.get("income_date") as string);
  
  const { error } = await supabase.from("personal_income").insert({
    organization_id: orgId,
    user_id: user.id,
    income_type: formData.get("income_type") as string,
    description: formData.get("description") as string,
    source_name: formData.get("source_name") as string || null,
    source_nit: formData.get("source_nit") as string || null,
    gross_amount: parseFloat(formData.get("gross_amount") as string) || 0,
    isr_withheld: parseFloat(formData.get("isr_withheld") as string) || 0,
    igss_withheld: parseFloat(formData.get("igss_withheld") as string) || 0,
    net_amount: parseFloat(formData.get("net_amount") as string) || 0,
    income_date: formData.get("income_date") as string,
    period_year: incomeDate.getFullYear(),
    period_month: incomeDate.getMonth() + 1,
    constancia_numero: formData.get("constancia_numero") as string || null,
    has_constancia: formData.get("has_constancia") === "true",
    notes: formData.get("notes") as string || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/personal-tax");
  return { success: true };
}

export async function deletePersonalIncome(id: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("personal_income")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/personal-tax");
  return { success: true };
}

// ─── Personal Deductions Actions ───────────────────────────────────────────

export async function getPersonalDeductions(orgId: string, year?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const targetYear = year || new Date().getFullYear();
  
  const { data, error } = await supabase
    .from("personal_deductions")
    .select("*")
    .eq("organization_id", orgId)
    .eq("period_year", targetYear)
    .order("deduction_date", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createPersonalDeduction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  const deductionDate = new Date(formData.get("deduction_date") as string);
  
  const { error } = await supabase.from("personal_deductions").insert({
    organization_id: orgId,
    user_id: user.id,
    deduction_type: formData.get("deduction_type") as string,
    description: formData.get("description") as string,
    amount: parseFloat(formData.get("amount") as string) || 0,
    deduction_date: formData.get("deduction_date") as string,
    period_year: deductionDate.getFullYear(),
    document_ref: formData.get("document_ref") as string || null,
    vendor_nit: formData.get("vendor_nit") as string || null,
    is_verified: false,
    notes: formData.get("notes") as string || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/personal-tax");
  return { success: true };
}

export async function deletePersonalDeduction(id: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("personal_deductions")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/personal-tax");
  return { success: true };
}

// ─── ISR Retenciones Actions ───────────────────────────────────────────────

export async function getIsrRetenciones(orgId: string, year?: number, direction?: "RECEIVED" | "MADE") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const targetYear = year || new Date().getFullYear();
  
  let query = supabase
    .from("isr_retenciones")
    .select("*")
    .eq("organization_id", orgId)
    .eq("period_year", targetYear)
    .order("constancia_date", { ascending: false });
  
  if (direction) {
    query = query.eq("direction", direction);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createIsrRetencion(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  const constanciaDate = new Date(formData.get("constancia_date") as string);
  const grossAmount = parseFloat(formData.get("gross_amount") as string) || 0;
  const retentionRate = parseFloat(formData.get("retention_rate") as string) || 0;
  
  const { error } = await supabase.from("isr_retenciones").insert({
    organization_id: orgId,
    direction: formData.get("direction") as string,
    retention_type: formData.get("retention_type") as string,
    retenedor_name: formData.get("retenedor_name") as string,
    retenedor_nit: formData.get("retenedor_nit") as string,
    beneficiario_name: formData.get("beneficiario_name") as string || null,
    beneficiario_nit: formData.get("beneficiario_nit") as string || null,
    gross_amount: grossAmount,
    retention_rate: retentionRate,
    retention_amount: grossAmount * retentionRate,
    constancia_numero: formData.get("constancia_numero") as string || null,
    constancia_date: formData.get("constancia_date") as string,
    period_year: constanciaDate.getFullYear(),
    period_month: constanciaDate.getMonth() + 1,
    expense_id: formData.get("expense_id") as string || null,
    invoice_id: formData.get("invoice_id") as string || null,
    notes: formData.get("notes") as string || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/personal-tax");
  revalidatePath("/dashboard/tax");
  return { success: true };
}

export async function deleteIsrRetencion(id: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("isr_retenciones")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/personal-tax");
  revalidatePath("/dashboard/tax");
  return { success: true };
}

// ─── Personal Tax Calculation ──────────────────────────────────────────────

export interface PersonalTaxSummary {
  year: number;
  income: {
    trabajoDependiente: number;
    trabajoIndependiente: number;
    capitalMobiliario: number;
    capitalInmobiliario: number;
    gananciasCapital: number;
    otros: number;
    total: number;
  };
  deductions: {
    deduccionFija: number;
    ivaPersonal: number;
    donaciones: number;
    cuotasIgss: number;
    otras: number;
    total: number;
  };
  retention: {
    isrRetenido: number;
    igssRetenido: number;
    total: number;
  };
  calculation: {
    rentaImponible: number;
    isrBruto: number;
    isrRetenido: number;
    isrAPagar: number;
    isrAFavor: number;
  };
}

export async function calculatePersonalTax(orgId: string, year: number): Promise<PersonalTaxSummary> {
  const supabase = await createClient();
  
  // Get all income for the year
  const { data: incomes } = await supabase
    .from("personal_income")
    .select("*")
    .eq("organization_id", orgId)
    .eq("period_year", year);
  
  // Get all deductions for the year
  const { data: deductions } = await supabase
    .from("personal_deductions")
    .select("*")
    .eq("organization_id", orgId)
    .eq("period_year", year);
  
  // Get all retenciones received for the year
  const { data: retenciones } = await supabase
    .from("isr_retenciones")
    .select("*")
    .eq("organization_id", orgId)
    .eq("period_year", year)
    .eq("direction", "RECEIVED");
  
  // Summarize income by type
  const incomeByType = {
    trabajoDependiente: 0,
    trabajoIndependiente: 0,
    capitalMobiliario: 0,
    capitalInmobiliario: 0,
    gananciasCapital: 0,
    otros: 0,
    total: 0,
  };
  
  let totalIsrWithheld = 0;
  let totalIgssWithheld = 0;
  
  (incomes || []).forEach((inc: any) => {
    const amount = Number(inc.gross_amount) || 0;
    incomeByType.total += amount;
    totalIsrWithheld += Number(inc.isr_withheld) || 0;
    totalIgssWithheld += Number(inc.igss_withheld) || 0;
    
    switch (inc.income_type) {
      case "TRABAJO_DEPENDIENTE": incomeByType.trabajoDependiente += amount; break;
      case "TRABAJO_INDEPENDIENTE": incomeByType.trabajoIndependiente += amount; break;
      case "CAPITAL_MOBILIARIO": incomeByType.capitalMobiliario += amount; break;
      case "CAPITAL_INMOBILIARIO": incomeByType.capitalInmobiliario += amount; break;
      case "GANANCIAS_CAPITAL": incomeByType.gananciasCapital += amount; break;
      default: incomeByType.otros += amount;
    }
  });
  
  // Add retenciones to ISR withheld
  (retenciones || []).forEach((ret: any) => {
    totalIsrWithheld += Number(ret.retention_amount) || 0;
  });
  
  // Summarize deductions by type
  const deductionsByType = {
    deduccionFija: TAX_RATES.ISR_EMPLOYEE_DEDUCTION, // Q48,000 fixed
    ivaPersonal: 0,
    donaciones: 0,
    cuotasIgss: totalIgssWithheld, // IGSS counts as deduction
    otras: 0,
    total: 0,
  };
  
  (deductions || []).forEach((ded: any) => {
    const amount = Number(ded.amount) || 0;
    switch (ded.deduction_type) {
      case "STANDARD": break; // Already added as fixed
      case "IVA_PERSONAL": deductionsByType.ivaPersonal += amount; break;
      case "DONACIONES": deductionsByType.donaciones += amount; break;
      case "CUOTAS_IGSS": deductionsByType.cuotasIgss += amount; break;
      default: deductionsByType.otras += amount;
    }
  });
  
  // IVA personal max is 12% of renta
  const maxIvaDeduction = incomeByType.total * 0.12;
  deductionsByType.ivaPersonal = Math.min(deductionsByType.ivaPersonal, maxIvaDeduction);
  
  // Donaciones max is 5% of renta
  const maxDonaciones = incomeByType.total * 0.05;
  deductionsByType.donaciones = Math.min(deductionsByType.donaciones, maxDonaciones);
  
  deductionsByType.total = deductionsByType.deduccionFija + deductionsByType.ivaPersonal + 
    deductionsByType.donaciones + deductionsByType.cuotasIgss + deductionsByType.otras;
  
  // Calculate ISR
  const rentaImponible = Math.max(0, incomeByType.total - deductionsByType.total);
  
  // Guatemala ISR brackets for individuals (Rentas de Trabajo):
  // Up to Q300,000: 5%
  // Over Q300,000: 7%
  let isrBruto = 0;
  if (rentaImponible > TAX_RATES.ISR_EMPLOYEE_THRESHOLD) {
    // First Q300,000 at 5%
    isrBruto = TAX_RATES.ISR_EMPLOYEE_THRESHOLD * TAX_RATES.ISR_EMPLOYEE_LOW;
    // Excess at 7%
    isrBruto += (rentaImponible - TAX_RATES.ISR_EMPLOYEE_THRESHOLD) * TAX_RATES.ISR_EMPLOYEE_HIGH;
  } else {
    isrBruto = rentaImponible * TAX_RATES.ISR_EMPLOYEE_LOW;
  }
  
  const isrAPagar = Math.max(0, isrBruto - totalIsrWithheld);
  const isrAFavor = Math.max(0, totalIsrWithheld - isrBruto);
  
  return {
    year,
    income: incomeByType,
    deductions: deductionsByType,
    retention: {
      isrRetenido: totalIsrWithheld,
      igssRetenido: totalIgssWithheld,
      total: totalIsrWithheld + totalIgssWithheld,
    },
    calculation: {
      rentaImponible,
      isrBruto,
      isrRetenido: totalIsrWithheld,
      isrAPagar,
      isrAFavor,
    },
  };
}

// ─── Save Personal Tax Return ──────────────────────────────────────────────

export async function savePersonalTaxReturn(orgId: string, year: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  
  const summary = await calculatePersonalTax(orgId, year);
  
  const { error } = await supabase.from("personal_tax_returns").upsert({
    organization_id: orgId,
    user_id: user.id,
    period_year: year,
    status: "CALCULATED",
    
    total_trabajo_dependiente: summary.income.trabajoDependiente,
    total_trabajo_independiente: summary.income.trabajoIndependiente,
    total_capital_mobiliario: summary.income.capitalMobiliario,
    total_capital_inmobiliario: summary.income.capitalInmobiliario,
    total_ganancias_capital: summary.income.gananciasCapital,
    total_otros: summary.income.otros,
    gross_income_total: summary.income.total,
    
    deduccion_fija: summary.deductions.deduccionFija,
    iva_personal: summary.deductions.ivaPersonal,
    donaciones: summary.deductions.donaciones,
    cuotas_igss: summary.deductions.cuotasIgss,
    otras_deducciones: summary.deductions.otras,
    total_deducciones: summary.deductions.total,
    
    renta_imponible: summary.calculation.rentaImponible,
    isr_causado: summary.calculation.isrBruto,
    isr_retenido_total: summary.calculation.isrRetenido,
    isr_a_pagar: summary.calculation.isrAPagar,
    isr_a_favor: summary.calculation.isrAFavor,
  }, {
    onConflict: "organization_id,user_id,period_year",
  });
  
  if (error) return { error: error.message };
  revalidatePath("/dashboard/personal-tax");
  return { success: true };
}

export async function getPersonalTaxReturn(orgId: string, year: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  
  const { data, error } = await supabase
    .from("personal_tax_returns")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .eq("period_year", year)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}
