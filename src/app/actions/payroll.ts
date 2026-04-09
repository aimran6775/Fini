"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TAX_RATES } from "@/lib/tax-utils";
import { requireOrgMembership, verifyEntityOwnership } from "@/lib/auth-guard";
import { employeeSchema } from "@/lib/types/forms";

// ISR employee brackets (monthly) — per Decreto 10-2012
// Must deduct IGSS (4.83%) before applying ISR brackets
function calculateMonthlyISR(monthlyGross: number): number {
  const annualGross = monthlyGross * 12;
  const annualIGSS = monthlyGross * TAX_RATES.IGSS_EMPLOYEE * 12;
  const taxableIncome = Math.max(0, annualGross - annualIGSS - TAX_RATES.ISR_EMPLOYEE_DEDUCTION);
  let annualISR = 0;

  if (taxableIncome <= TAX_RATES.ISR_EMPLOYEE_THRESHOLD) {
    annualISR = taxableIncome * TAX_RATES.ISR_EMPLOYEE_LOW;
  } else {
    annualISR = TAX_RATES.ISR_EMPLOYEE_THRESHOLD * TAX_RATES.ISR_EMPLOYEE_LOW + (taxableIncome - TAX_RATES.ISR_EMPLOYEE_THRESHOLD) * TAX_RATES.ISR_EMPLOYEE_HIGH;
  }

  return annualISR / 12;
}

export async function getEmployees(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("organization_id", orgId)
    .order("last_name");

  if (error) throw error;
  return data;
}

export async function createEmployee(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  await requireOrgMembership(user.id, orgId);

  // Validate with Zod schema
  const validation = employeeSchema.safeParse({
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    dpi_number: formData.get("dpi_number") as string,
    base_salary: parseFloat(formData.get("base_salary") as string || "0"),
    hire_date: formData.get("hire_date") as string,
  });
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Datos inválidos" };
  }

  const { error } = await supabase.from("employees").insert({
    organization_id: orgId,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    dpi_number: formData.get("dpi_number") as string,
    nit_number: (formData.get("nit_number") as string) || null,
    igss_affiliation: (formData.get("igss_affiliation") as string) || null,
    position: (formData.get("position") as string) || null,
    department: (formData.get("department") as string) || null,
    hire_date: formData.get("hire_date") as string,
    base_salary: parseFloat(formData.get("base_salary") as string),
    work_shift: (formData.get("work_shift") as string) || "DIURNA",
    bank_account: (formData.get("bank_account") as string) || null,
    bank_name: (formData.get("bank_name") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    address: (formData.get("address") as string) || null,
    status: "ACTIVE",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/payroll");
  return { success: true };
}

export async function getPayrollRuns(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireOrgMembership(user.id, orgId);

  const { data, error } = await supabase
    .from("payroll_runs")
    .select(`*, details:payroll_details(*, employee:employees(id, first_name, last_name, dpi_number))`)
    .eq("organization_id", orgId)
    .order("period_start", { ascending: false });

  if (error) throw error;
  return data;
}

export async function runPayroll(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = formData.get("organization_id") as string;
  const periodStart = formData.get("period_start") as string;
  const periodEnd = formData.get("period_end") as string;
  const periodLabel = formData.get("period_label") as string || `${periodStart} al ${periodEnd}`;

  // Get active employees
  const { data: employees, error: empError } = await supabase
    .from("employees")
    .select("*")
    .eq("organization_id", orgId)
    .eq("status", "ACTIVE");

  if (empError || !employees?.length) {
    return { error: empError?.message || "No hay empleados activos" };
  }

  // Calculate totals
  let totalGross = 0;
  let totalIgssEmployee = 0;
  let totalIgssEmployer = 0;
  let totalIrtra = 0;
  let totalIntecap = 0;
  let totalIsr = 0;
  let totalDeductions = 0;
  let totalNet = 0;
  let totalEmployerCost = 0;

  const details = employees.map((emp: any) => {
    const baseSalary = Number(emp.base_salary);
    const igssEmployee = Math.round(baseSalary * TAX_RATES.IGSS_EMPLOYEE * 100) / 100;
    const isrWithholding = Math.round(calculateMonthlyISR(baseSalary) * 100) / 100;
    const igssEmployer = Math.round(baseSalary * TAX_RATES.IGSS_EMPLOYER * 100) / 100;
    const irtra = Math.round(baseSalary * TAX_RATES.IRTRA * 100) / 100;
    const intecap = Math.round(baseSalary * TAX_RATES.INTECAP * 100) / 100;

    // Accruals (monthly provision)
    const aguinaldoAccrual = Math.round(baseSalary / 12 * 100) / 100;
    const bono14Accrual = Math.round(baseSalary / 12 * 100) / 100;
    const vacationAccrual = Math.round(baseSalary * 15 / 365 * 1.3 * 100) / 100; // 30% surcharge Art. 130
    const indemnizacionAccrual = Math.round(baseSalary / 12 * 100) / 100;

    const empTotalDeductions = igssEmployee + isrWithholding;
    const netSalary = Math.round((baseSalary - empTotalDeductions) * 100) / 100;
    const empTotalEmployerCost = Math.round((igssEmployer + irtra + intecap) * 100) / 100;

    totalGross += baseSalary;
    totalIgssEmployee += igssEmployee;
    totalIgssEmployer += igssEmployer;
    totalIrtra += irtra;
    totalIntecap += intecap;
    totalIsr += isrWithholding;
    totalDeductions += empTotalDeductions;
    totalNet += netSalary;
    totalEmployerCost += baseSalary + empTotalEmployerCost;

    return {
      employee_id: emp.id,
      base_salary: baseSalary,
      overtime_hours: 0,
      overtime_amount: 0,
      bonuses: 0,
      commissions: 0,
      gross_salary: baseSalary,
      igss_employee: igssEmployee,
      isr_withholding: isrWithholding,
      other_deductions: 0,
      total_deductions: empTotalDeductions,
      net_salary: netSalary,
      igss_employer: igssEmployer,
      irtra,
      intecap,
      total_employer_cost: empTotalEmployerCost,
      aguinaldo_accrual: aguinaldoAccrual,
      bono14_accrual: bono14Accrual,
      vacation_accrual: vacationAccrual,
      indemnizacion_accrual: indemnizacionAccrual,
    };
  });

  // Create payroll run — matches payroll_runs table exactly
  const { data: payrollRun, error: runError } = await supabase
    .from("payroll_runs")
    .insert({
      organization_id: orgId,
      period_start: periodStart,
      period_end: periodEnd,
      period_label: periodLabel,
      total_gross: Math.round(totalGross * 100) / 100,
      total_igss_employee: Math.round(totalIgssEmployee * 100) / 100,
      total_igss_employer: Math.round(totalIgssEmployer * 100) / 100,
      total_irtra: Math.round(totalIrtra * 100) / 100,
      total_intecap: Math.round(totalIntecap * 100) / 100,
      total_isr: Math.round(totalIsr * 100) / 100,
      total_deductions: Math.round(totalDeductions * 100) / 100,
      total_net: Math.round(totalNet * 100) / 100,
      total_employer_cost: Math.round(totalEmployerCost * 100) / 100,
      status: "DRAFT",
      created_by: user.id,
    })
    .select()
    .single();

  if (runError) return { error: runError.message };

  // Insert payroll details
  const detailRecords = details.map((d: any) => ({
    ...d,
    payroll_run_id: payrollRun.id,
  }));

  const { error: detailError } = await supabase
    .from("payroll_details")
    .insert(detailRecords);

  if (detailError) return { error: detailError.message };

  revalidatePath("/dashboard/payroll");
  redirect("/dashboard/payroll");
}

export async function approvePayroll(payrollRunId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "payroll_runs", payrollRunId);

  const { error } = await supabase
    .from("payroll_runs")
    .update({ status: "APPROVED", approved_by: user.id })
    .eq("id", payrollRunId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/payroll");
  return { success: true };
}

export async function getEmployee(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "employees", id);

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateEmployee(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "employees", id);

  const { error } = await supabase
    .from("employees")
    .update({
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      dpi_number: formData.get("dpi_number") as string,
      nit_number: (formData.get("nit_number") as string) || null,
      igss_affiliation: (formData.get("igss_affiliation") as string) || null,
      position: (formData.get("position") as string) || null,
      department: (formData.get("department") as string) || null,
      base_salary: parseFloat(formData.get("base_salary") as string),
      work_shift: (formData.get("work_shift") as string) || "DIURNA",
      bank_account: (formData.get("bank_account") as string) || null,
      bank_name: (formData.get("bank_name") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/payroll");
  revalidatePath(`/dashboard/payroll/employees/${id}`);
  return { success: true };
}

export async function terminateEmployee(id: string, terminationDate: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await verifyEntityOwnership(user.id, "employees", id);

  const { error } = await supabase
    .from("employees")
    .update({
      status: "TERMINATED",
      termination_date: terminationDate,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/payroll");
  return { success: true };
}