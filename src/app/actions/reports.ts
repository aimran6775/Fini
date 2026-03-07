"use server";

import { createClient } from "@/lib/supabase/server";

export interface AccountBalance {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  total_debit: number;
  total_credit: number;
  balance: number;
}

export interface BalanceGeneralData {
  fecha: string;
  activos: AccountBalance[];
  pasivos: AccountBalance[];
  patrimonio: AccountBalance[];
  totalActivos: number;
  totalPasivos: number;
  totalPatrimonio: number;
}

export interface EstadoResultadosData {
  periodoInicio: string;
  periodoFin: string;
  ingresos: AccountBalance[];
  costos: AccountBalance[];
  gastos: AccountBalance[];
  totalIngresos: number;
  totalCostos: number;
  totalGastos: number;
  utilidadBruta: number;
  utilidadNeta: number;
}

export interface TrialBalanceRow {
  account_code: string;
  account_name: string;
  account_type: string;
  total_debit: number;
  total_credit: number;
  debit_balance: number;
  credit_balance: number;
}

// Get account balances from journal entries
async function getAccountBalances(orgId: string, asOfDate?: string): Promise<AccountBalance[]> {
  const supabase = await createClient();

  // Get all accounts
  const { data: accounts } = await supabase
    .from("chart_of_accounts")
    .select("id, account_code, account_name, account_type")
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("account_code");

  if (!accounts) return [];

  // Get all journal entry lines with their entries (for date filtering)
  let query = supabase
    .from("journal_entry_lines")
    .select(`
      account_id,
      debit,
      credit,
      journal_entry:journal_entries!inner(entry_date, organization_id)
    `)
    .eq("journal_entry.organization_id", orgId);

  if (asOfDate) {
    query = query.lte("journal_entry.entry_date", asOfDate);
  }

  const { data: lines } = await query;

  // Aggregate by account
  const balanceMap = new Map<string, { debit: number; credit: number }>();
  if (lines) {
    for (const line of lines) {
      const current = balanceMap.get(line.account_id) || { debit: 0, credit: 0 };
      current.debit += Number(line.debit || 0);
      current.credit += Number(line.credit || 0);
      balanceMap.set(line.account_id, current);
    }
  }

  return accounts.map((acc) => {
    const bal = balanceMap.get(acc.id) || { debit: 0, credit: 0 };
    // Asset & Expense accounts have debit-normal balance
    // Liability, Equity, Revenue accounts have credit-normal balance
    const isDebitNormal = ["ASSET", "EXPENSE", "COST"].includes(acc.account_type);
    const balance = isDebitNormal
      ? bal.debit - bal.credit
      : bal.credit - bal.debit;

    return {
      account_id: acc.id,
      account_code: acc.account_code,
      account_name: acc.account_name,
      account_type: acc.account_type,
      total_debit: Math.round(bal.debit * 100) / 100,
      total_credit: Math.round(bal.credit * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    };
  });
}

// Get account balances for a specific date range (income statement)
async function getAccountBalancesForPeriod(
  orgId: string,
  startDate: string,
  endDate: string
): Promise<AccountBalance[]> {
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from("chart_of_accounts")
    .select("id, account_code, account_name, account_type")
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .in("account_type", ["REVENUE", "COST", "EXPENSE"])
    .order("account_code");

  if (!accounts) return [];

  const { data: lines } = await supabase
    .from("journal_entry_lines")
    .select(`
      account_id,
      debit,
      credit,
      journal_entry:journal_entries!inner(entry_date, organization_id)
    `)
    .eq("journal_entry.organization_id", orgId)
    .gte("journal_entry.entry_date", startDate)
    .lte("journal_entry.entry_date", endDate);

  const balanceMap = new Map<string, { debit: number; credit: number }>();
  if (lines) {
    for (const line of lines) {
      const current = balanceMap.get(line.account_id) || { debit: 0, credit: 0 };
      current.debit += Number(line.debit || 0);
      current.credit += Number(line.credit || 0);
      balanceMap.set(line.account_id, current);
    }
  }

  return accounts.map((acc) => {
    const bal = balanceMap.get(acc.id) || { debit: 0, credit: 0 };
    const isDebitNormal = ["EXPENSE", "COST"].includes(acc.account_type);
    const balance = isDebitNormal
      ? bal.debit - bal.credit
      : bal.credit - bal.debit;

    return {
      account_id: acc.id,
      account_code: acc.account_code,
      account_name: acc.account_name,
      account_type: acc.account_type,
      total_debit: Math.round(bal.debit * 100) / 100,
      total_credit: Math.round(bal.credit * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    };
  });
}

export async function getBalanceGeneral(orgId: string, asOfDate?: string): Promise<BalanceGeneralData> {
  const fecha = asOfDate || new Date().toISOString().split("T")[0];
  const balances = await getAccountBalances(orgId, fecha);

  const activos = balances.filter((b) => b.account_type === "ASSET" && b.balance !== 0);
  const pasivos = balances.filter((b) => b.account_type === "LIABILITY" && b.balance !== 0);
  const patrimonio = balances.filter((b) => b.account_type === "EQUITY" && b.balance !== 0);

  const totalActivos = activos.reduce((s, a) => s + a.balance, 0);
  const totalPasivos = pasivos.reduce((s, a) => s + a.balance, 0);
  const totalPatrimonio = patrimonio.reduce((s, a) => s + a.balance, 0);

  return {
    fecha,
    activos,
    pasivos,
    patrimonio,
    totalActivos: Math.round(totalActivos * 100) / 100,
    totalPasivos: Math.round(totalPasivos * 100) / 100,
    totalPatrimonio: Math.round(totalPatrimonio * 100) / 100,
  };
}

export async function getEstadoResultados(
  orgId: string,
  startDate: string,
  endDate: string
): Promise<EstadoResultadosData> {
  const balances = await getAccountBalancesForPeriod(orgId, startDate, endDate);

  const ingresos = balances.filter((b) => b.account_type === "REVENUE" && b.balance !== 0);
  const costos = balances.filter((b) => b.account_type === "COST" && b.balance !== 0);
  const gastos = balances.filter((b) => b.account_type === "EXPENSE" && b.balance !== 0);

  const totalIngresos = ingresos.reduce((s, a) => s + a.balance, 0);
  const totalCostos = costos.reduce((s, a) => s + a.balance, 0);
  const totalGastos = gastos.reduce((s, a) => s + a.balance, 0);

  return {
    periodoInicio: startDate,
    periodoFin: endDate,
    ingresos,
    costos,
    gastos,
    totalIngresos: Math.round(totalIngresos * 100) / 100,
    totalCostos: Math.round(totalCostos * 100) / 100,
    totalGastos: Math.round(totalGastos * 100) / 100,
    utilidadBruta: Math.round((totalIngresos - totalCostos) * 100) / 100,
    utilidadNeta: Math.round((totalIngresos - totalCostos - totalGastos) * 100) / 100,
  };
}

export async function getTrialBalance(orgId: string, asOfDate?: string): Promise<TrialBalanceRow[]> {
  const balances = await getAccountBalances(orgId, asOfDate);

  return balances
    .filter((b) => b.total_debit !== 0 || b.total_credit !== 0)
    .map((b) => ({
      account_code: b.account_code,
      account_name: b.account_name,
      account_type: b.account_type,
      total_debit: b.total_debit,
      total_credit: b.total_credit,
      debit_balance: b.balance > 0 ? b.balance : 0,
      credit_balance: b.balance < 0 ? Math.abs(b.balance) : 0,
    }));
}

// Quick summary data using invoices and expenses (for when no journal entries exist)
export async function getQuickFinancials(orgId: string) {
  const supabase = await createClient();

  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const yearEnd = `${now.getFullYear()}-12-31`;
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const [
    { data: yearInvoices },
    { data: yearExpenses },
    { data: monthInvoices },
    { data: monthExpenses },
  ] = await Promise.all([
    supabase.from("fel_invoices").select("total, iva_amount").eq("organization_id", orgId).eq("status", "CERTIFIED").gte("invoice_date", yearStart).lte("invoice_date", yearEnd),
    supabase.from("expenses").select("amount, iva_amount").eq("organization_id", orgId).eq("status", "APPROVED").gte("expense_date", yearStart).lte("expense_date", yearEnd),
    supabase.from("fel_invoices").select("total, iva_amount").eq("organization_id", orgId).eq("status", "CERTIFIED").gte("invoice_date", monthStart).lte("invoice_date", monthEnd),
    supabase.from("expenses").select("amount, iva_amount").eq("organization_id", orgId).eq("status", "APPROVED").gte("expense_date", monthStart).lte("expense_date", monthEnd),
  ]);

  const yearRevenue = yearInvoices?.reduce((s: number, i: any) => s + Number(i.total), 0) ?? 0;
  const yearIvaDebito = yearInvoices?.reduce((s: number, i: any) => s + Number(i.iva_amount), 0) ?? 0;
  const yearExpTotal = yearExpenses?.reduce((s: number, e: any) => s + Number(e.amount), 0) ?? 0;
  const yearIvaCredito = yearExpenses?.reduce((s: number, e: any) => s + Number(e.iva_amount), 0) ?? 0;

  const monthRevenue = monthInvoices?.reduce((s: number, i: any) => s + Number(i.total), 0) ?? 0;
  const monthIvaDebito = monthInvoices?.reduce((s: number, i: any) => s + Number(i.iva_amount), 0) ?? 0;
  const monthExpTotal = monthExpenses?.reduce((s: number, e: any) => s + Number(e.amount), 0) ?? 0;
  const monthIvaCredito = monthExpenses?.reduce((s: number, e: any) => s + Number(e.iva_amount), 0) ?? 0;

  return {
    year: {
      revenue: yearRevenue,
      expenses: yearExpTotal,
      ivaDebito: yearIvaDebito,
      ivaCredito: yearIvaCredito,
      netIncome: yearRevenue - yearExpTotal,
      ivaPagar: Math.max(0, yearIvaDebito - yearIvaCredito),
    },
    month: {
      revenue: monthRevenue,
      expenses: monthExpTotal,
      ivaDebito: monthIvaDebito,
      ivaCredito: monthIvaCredito,
      netIncome: monthRevenue - monthExpTotal,
      ivaPagar: Math.max(0, monthIvaDebito - monthIvaCredito),
    },
  };
}

// ─── LIBRO MAYOR (General Ledger) ──────────────────────────────

export interface LedgerEntry {
  entry_date: string;
  entry_number: string;
  description: string;
  debit: number;
  credit: number;
  running_balance: number;
}

export interface LedgerAccount {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  entries: LedgerEntry[];
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  closing_balance: number;
}

export async function getLibroMayor(
  orgId: string,
  startDate: string,
  endDate: string,
  accountId?: string
): Promise<LedgerAccount[]> {
  const supabase = await createClient();

  // Get accounts
  let accountsQuery = supabase
    .from("chart_of_accounts")
    .select("id, account_code, account_name, account_type")
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("account_code");

  if (accountId) {
    accountsQuery = accountsQuery.eq("id", accountId);
  }

  const { data: accounts } = await accountsQuery;
  if (!accounts || accounts.length === 0) return [];

  // Get journal entry lines within period
  const { data: lines } = await supabase
    .from("journal_entry_lines")
    .select(`
      account_id,
      debit,
      credit,
      journal_entry:journal_entries!inner(
        entry_number,
        entry_date,
        description,
        organization_id
      )
    `)
    .eq("journal_entry.organization_id", orgId)
    .gte("journal_entry.entry_date", startDate)
    .lte("journal_entry.entry_date", endDate);

  // Get opening balances (all entries before startDate)
  const { data: priorLines } = await supabase
    .from("journal_entry_lines")
    .select(`
      account_id,
      debit,
      credit,
      journal_entry:journal_entries!inner(organization_id, entry_date)
    `)
    .eq("journal_entry.organization_id", orgId)
    .lt("journal_entry.entry_date", startDate);

  // Calculate opening balances
  const openingMap = new Map<string, number>();
  if (priorLines) {
    for (const line of priorLines) {
      const prev = openingMap.get(line.account_id) || 0;
      const acc = accounts.find(a => a.id === line.account_id);
      const isDebitNormal = acc && ["ASSET", "EXPENSE", "COST"].includes(acc.account_type);
      const amount = isDebitNormal
        ? Number(line.debit || 0) - Number(line.credit || 0)
        : Number(line.credit || 0) - Number(line.debit || 0);
      openingMap.set(line.account_id, prev + amount);
    }
  }

  // Group lines by account
  const linesByAccount = new Map<string, any[]>();
  if (lines) {
    for (const line of lines) {
      const arr = linesByAccount.get(line.account_id) || [];
      arr.push(line);
      linesByAccount.set(line.account_id, arr);
    }
  }

  return accounts
    .map((acc) => {
      const isDebitNormal = ["ASSET", "EXPENSE", "COST"].includes(acc.account_type);
      const opening = openingMap.get(acc.id) || 0;
      const accLines = linesByAccount.get(acc.id) || [];

      // Sort by date
      accLines.sort((a: any, b: any) => {
        const je_a = a.journal_entry as any;
        const je_b = b.journal_entry as any;
        return new Date(je_a.entry_date).getTime() - new Date(je_b.entry_date).getTime();
      });

      let runningBalance = opening;
      let totalDebit = 0;
      let totalCredit = 0;

      const entries: LedgerEntry[] = accLines.map((line: any) => {
        const je = line.journal_entry as any;
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);
        totalDebit += debit;
        totalCredit += credit;

        if (isDebitNormal) {
          runningBalance += debit - credit;
        } else {
          runningBalance += credit - debit;
        }

        return {
          entry_date: je.entry_date,
          entry_number: je.entry_number || "",
          description: je.description || "",
          debit,
          credit,
          running_balance: runningBalance,
        };
      });

      return {
        account_id: acc.id,
        account_code: acc.account_code,
        account_name: acc.account_name,
        account_type: acc.account_type,
        entries,
        opening_balance: opening,
        total_debit: totalDebit,
        total_credit: totalCredit,
        closing_balance: opening + (isDebitNormal ? totalDebit - totalCredit : totalCredit - totalDebit),
      };
    })
    .filter(a => a.entries.length > 0 || a.opening_balance !== 0);
}

// ─── PLANILLA (Payroll Report) ──────────────────────────────────

export interface PayrollReportRow {
  employee_name: string;
  dpi: string | null;
  base_salary: number;
  bonificacion: number;
  total_ingresos: number;
  igss_employee: number;
  isr: number;
  total_deducciones: number;
  liquido: number;
  igss_patronal: number;
  irtra: number;
  intecap: number;
  total_costo_patronal: number;
}

export async function getPayrollReport(orgId: string, month?: string) {
  const supabase = await createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .eq("organization_id", orgId)
    .eq("status", "ACTIVE")
    .order("last_name");

  if (!employees) return [];

  const IGSS_EMP = 0.0483;
  const IGSS_PAT = 0.1067;
  const IRTRA = 0.01;
  const INTECAP = 0.01;
  const BONO_14_MONTHLY = 1 / 12;
  const ISR_SIMPLIFICADO_THRESHOLD = 150000;

  return employees.map((emp: any) => {
    const base = Number(emp.base_salary || 0);
    const bonificacion = 250; // Bonificación incentivo legal
    const totalIngresos = base + bonificacion;

    const igssEmployee = base * IGSS_EMP;
    const annualSalary = base * 12;
    const annualAfterIGSS = annualSalary - (igssEmployee * 12);
    let isrAnnual = 0;
    if (annualAfterIGSS > ISR_SIMPLIFICADO_THRESHOLD) {
      isrAnnual = ISR_SIMPLIFICADO_THRESHOLD * 0.05 + (annualAfterIGSS - ISR_SIMPLIFICADO_THRESHOLD) * 0.07;
    } else if (annualAfterIGSS > 0) {
      isrAnnual = annualAfterIGSS * 0.05;
    }
    const isrMonthly = isrAnnual / 12;
    const totalDeducciones = igssEmployee + isrMonthly;
    const liquido = totalIngresos - totalDeducciones;

    const igssPatronal = base * IGSS_PAT;
    const irtra = base * IRTRA;
    const intecap = base * INTECAP;

    return {
      employee_name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
      dpi: emp.dpi_number,
      base_salary: base,
      bonificacion,
      total_ingresos: totalIngresos,
      igss_employee: igssEmployee,
      isr: isrMonthly,
      total_deducciones: totalDeducciones,
      liquido,
      igss_patronal: igssPatronal,
      irtra,
      intecap,
      total_costo_patronal: base + igssPatronal + irtra + intecap,
    };
  });
}
