import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import {
  Receipt, TrendingUp, TrendingDown, DollarSign,
  FileText, Users, Calculator, ArrowUpRight, ArrowDownRight,
  CalendarClock, Plus, ChevronRight, Landmark, Settings,
  BarChart3, AlertCircle, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { RevenueExpenseChart, ExpenseCategoryChart } from "@/components/dashboard/dashboard-charts";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { getPeriodRange } from "@/lib/period-utils";
import { getDashboardTrends } from "@/app/actions/reports";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organization:organizations(*)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  const orgId = membership.organization_id;
  const org = (membership as any).organization;
  if (!org) redirect("/onboarding");

  // Determine date range based on period selector
  const { start: periodStart, end: periodEnd } = getPeriodRange(params.period || null);

  // Build queries with optional date range
  let invoiceQuery = supabase
    .from("fel_invoices")
    .select("total, status", { count: "exact" })
    .eq("organization_id", orgId);

  let expenseQuery = supabase
    .from("expenses")
    .select("amount, status", { count: "exact" })
    .eq("organization_id", orgId);

  if (periodStart && periodEnd) {
    invoiceQuery = invoiceQuery.gte("invoice_date", periodStart).lte("invoice_date", periodEnd);
    expenseQuery = expenseQuery.gte("expense_date", periodStart).lte("expense_date", periodEnd);
  }

  const [invoicesRes, expensesRes, employeesRes, bankRes, trends] = await Promise.all([
    invoiceQuery,
    expenseQuery,
    supabase
      .from("employees")
      .select("id", { count: "exact" })
      .eq("organization_id", orgId)
      .eq("status", "ACTIVE"),
    supabase
      .from("bank_accounts")
      .select("current_balance")
      .eq("organization_id", orgId)
      .eq("is_active", true),
    getDashboardTrends(orgId),
  ]);

  const totalInvoiced = invoicesRes.data
    ?.filter((i: any) => i.status === "CERTIFIED")
    .reduce((sum: number, i: any) => sum + Number(i.total || 0), 0) ?? 0;

  const totalExpenses = expensesRes.data
    ?.filter((e: any) => e.status === "APPROVED")
    .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) ?? 0;

  const netIncome = totalInvoiced - totalExpenses;
  const bankBalance = bankRes.data?.reduce((sum: number, b: any) => sum + Number(b.current_balance || 0), 0) ?? 0;

  // ── Compute REAL trends ──
  const revenueTrend = computeTrendPercent(trends.currentMonthRevenue, trends.previousMonthRevenue);
  const expenseTrend = computeTrendPercent(trends.currentMonthExpenses, trends.previousMonthExpenses);

  // Get recent invoices
  const { data: recentInvoices } = await supabase
    .from("fel_invoices")
    .select("id, client_name, total, status, invoice_date")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("first_name")
    .eq("id", user.id)
    .single();

  const greeting = getGreeting();
  const firstName = userProfile?.first_name || user.user_metadata?.full_name?.split(" ")[0] || "Usuario";
  const needsSetup = org.nit_number === "CF" || org.nit_number.startsWith("CF-");
  const userRole = (membership as any).role;

  // ── Personalization data ──
  const draftCount = invoicesRes.data?.filter((i: any) => i.status === "DRAFT").length ?? 0;
  const obligations = getUpcomingObligations();
  const profitMargin = totalInvoiced > 0 ? Math.round((netIncome / totalInvoiced) * 100) : null;
  const subtitle = getPersonalizedSubtitle({
    totalInvoiced,
    totalExpenses,
    netIncome,
    draftCount,
    revenueTrend,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Setup Reminder Banner */}
      {needsSetup && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-200">Completa tu información fiscal</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Configura tu NIT y datos de empresa para poder emitir facturas FEL.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors whitespace-nowrap"
            >
              Configurar <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-2xl font-bold tracking-tight">{firstName}</h1>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary">
              {userRole === "ADMIN" ? "Admin" : userRole === "ACCOUNTANT" ? "Contador" : "Empleado"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {org.name} · NIT {org.nit_number}
          </p>
          <p className="text-sm text-muted-foreground/80 mt-1.5">{subtitle}</p>

          {/* Insight chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {draftCount > 0 && (
              <Link
                href="/dashboard/invoices"
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 hover:opacity-80 transition-opacity"
              >
                <AlertCircle className="h-3 w-3" />
                {draftCount} borrador{draftCount > 1 ? "es" : ""} por certificar
              </Link>
            )}
            {obligations[0]?.daysLeft <= 7 && (
              <Link
                href="/dashboard/tax"
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 hover:opacity-80 transition-opacity"
              >
                <CalendarClock className="h-3 w-3" />
                IVA vence en {obligations[0].daysLeft} días
              </Link>
            )}
            {profitMargin !== null && profitMargin > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                Margen: {profitMargin}%
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Suspense fallback={null}>
            <PeriodSelector />
          </Suspense>
          <Link href="/dashboard/invoices/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Nueva Factura
          </Link>
          <Link href="/dashboard/expenses/new"
            className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium hover:bg-muted transition-colors">
            <Plus className="h-4 w-4" /> Nuevo Gasto
          </Link>
        </div>
      </div>

      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Ingresos"
          value={formatCurrency(totalInvoiced)}
          icon={<TrendingUp className="h-4 w-4" />}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
          trend={revenueTrend}
          trendUp={revenueTrend ? !revenueTrend.startsWith("-") : undefined}
        />
        <KpiCard
          label="Gastos"
          value={formatCurrency(totalExpenses)}
          icon={<TrendingDown className="h-4 w-4" />}
          iconBg="bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
          trend={expenseTrend}
          trendUp={expenseTrend ? expenseTrend.startsWith("-") : undefined}
        />
        <KpiCard
          label="Utilidad Neta"
          value={formatCurrency(netIncome)}
          icon={<DollarSign className="h-4 w-4" />}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />
        <KpiCard
          label="Saldo Bancario"
          value={formatCurrency(bankBalance)}
          icon={<Landmark className="h-4 w-4" />}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />
      </div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Revenue vs Expenses — Area Chart */}
        <div className="lg:col-span-3 rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Ingresos vs Gastos</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Últimos 6 meses</p>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <RevenueExpenseChart data={trends.monthly} />
        </div>

        {/* Expense Categories — Donut */}
        <div className="lg:col-span-2 rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Gastos por Categoría</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Distribución últimos 6 meses</p>
            </div>
          </div>
          <ExpenseCategoryChart data={trends.expensesByCategory} />
        </div>
      </div>

      {/* ─── Middle Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Acciones Rápidas</h2>
          <div className="space-y-1.5">
            {[
              { label: "Nueva Factura", href: "/dashboard/invoices/new", icon: FileText, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950" },
              { label: "Registrar Gasto", href: "/dashboard/expenses/new", icon: Receipt, color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950" },
              { label: "Partida de Diario", href: "/dashboard/journal/new", icon: FileText, color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950" },
              { label: "Correr Planilla", href: "/dashboard/payroll/new", icon: Users, color: "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950" },
              { label: "Calcular Impuesto", href: "/dashboard/tax", icon: Calculator, color: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950" },
              { label: "Nuevo Contacto", href: "/dashboard/contacts/new", icon: Users, color: "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-950" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors group"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="font-medium flex-1">{action.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Facturas Recientes</h2>
            <Link href="/dashboard/invoices" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              Ver todas →
            </Link>
          </div>
          <div className="rounded-lg border overflow-hidden">
            {!recentInvoices || recentInvoices.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No hay facturas todavía</p>
                <Link href="/dashboard/invoices/new" className="text-sm text-primary hover:underline mt-1 inline-block">
                  Crear primera factura →
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Cliente</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Fecha</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">Monto</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/invoices/${inv.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                          {inv.client_name || "CF"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(inv.invoice_date).toLocaleDateString("es-GT", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-right">{formatCurrency(inv.total)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          inv.status === "CERTIFIED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" :
                          inv.status === "VOIDED" ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" :
                          "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}>
                          {inv.status === "CERTIFIED" ? "Certificada" : inv.status === "VOIDED" ? "Anulada" : "Borrador"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Stats Row ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tax Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" /> Resumen Fiscal
          </h2>
          <div className="rounded-lg border divide-y">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm">IVA Débito Fiscal</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(totalInvoiced * 0.12 / 1.12)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm">IVA Crédito Fiscal</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(totalExpenses * 0.12 / 1.12)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
              <span className="text-sm font-semibold">IVA a Pagar</span>
              <span className="text-sm font-bold text-primary">
                {formatCurrency(Math.max(0, (totalInvoiced - totalExpenses) * 0.12 / 1.12))}
              </span>
            </div>
          </div>
        </div>

        {/* Obligations — dynamic dates */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" /> Próximas Obligaciones
          </h2>
          <div className="rounded-lg border divide-y">
            {obligations.map((ob) => (
              <div key={ob.tax} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{ob.tax}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{ob.desc}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${ob.color}`}>
                  {ob.daysLeft <= 7 ? "¡Urgente!" : ob.daysLeft <= 15 ? "Próximo" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/tax" className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            Ver obligaciones fiscales <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ─── Counters ─── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border px-4 py-3 text-center">
          <p className="text-2xl font-bold">{invoicesRes.count ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Facturas Emitidas</p>
        </div>
        <div className="rounded-lg border px-4 py-3 text-center">
          <p className="text-2xl font-bold">{expensesRes.count ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Gastos Registrados</p>
        </div>
        <div className="rounded-lg border px-4 py-3 text-center">
          <p className="text-2xl font-bold">{employeesRes.count ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Empleados Activos</p>
        </div>
      </div>
    </div>
  );
}

/* ── Helper Components ── */

function KpiCard({ label, value, icon, iconBg, trend, trendUp }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: string | null;
  trendUp?: boolean;
}) {
  return (
    <div className="rounded-lg border px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendUp ? "text-emerald-600" : "text-rose-600"}`}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold tracking-tight mt-0.5">{value}</p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días,";
  if (h < 18) return "Buenas tardes,";
  return "Buenas noches,";
}

/** Personalized subtitle based on the user's data */
function getPersonalizedSubtitle(data: {
  totalInvoiced: number;
  totalExpenses: number;
  netIncome: number;
  draftCount: number;
  revenueTrend: string | null;
}): string {
  if (data.totalInvoiced === 0 && data.totalExpenses === 0) {
    return "Comienza registrando tus primeras facturas y gastos.";
  }
  if (data.revenueTrend && !data.revenueTrend.startsWith("-") && data.revenueTrend !== "+0%") {
    return "Tus ingresos van en aumento. Buen trabajo.";
  }
  if (data.netIncome < 0) {
    return "Tus gastos superan tus ingresos este período. Revisa tu presupuesto.";
  }
  if (data.draftCount > 0) {
    return `Tienes ${data.draftCount} factura${data.draftCount > 1 ? "s" : ""} en borrador pendiente${data.draftCount > 1 ? "s" : ""}.`;
  }
  return "Aquí tienes un resumen de tu actividad financiera.";
}

/** Compute month-over-month % change. Returns null when no data */
function computeTrendPercent(current: number, previous: number): string | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return "+100%";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}%`;
}

/** Dynamic upcoming tax obligations based on current date */
function getUpcomingObligations() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // IVA: 15th of next month
  const ivaDate = new Date(year, month + 1, 15);
  const ivaDays = Math.ceil((ivaDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // ISR Trimestral: end of next quarter month (Mar 31, Jun 30, Sep 30, Dec 31)
  const quarterEndMonths = [2, 5, 8, 11];
  let nextQuarter = quarterEndMonths.find((m) => m >= month) ?? quarterEndMonths[0];
  let nextQuarterYear = year;
  if (nextQuarter < month) nextQuarterYear++;
  const lastDayOfQuarter = new Date(nextQuarterYear, nextQuarter + 1, 0).getDate();
  const isrDate = new Date(nextQuarterYear, nextQuarter, lastDayOfQuarter);
  const isrDays = Math.ceil((isrDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const isoDate = isrDate;
  const isoDays = isrDays;

  return [
    {
      tax: "IVA Mensual",
      desc: `Vence ${ivaDate.toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric" })}`,
      daysLeft: ivaDays,
      color: ivaDays <= 7 ? "text-red-700 bg-red-50" : ivaDays <= 15 ? "text-amber-700 bg-amber-50" : "text-blue-700 bg-blue-50",
    },
    {
      tax: "ISR Trimestral",
      desc: `Vence ${isrDate.toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric" })}`,
      daysLeft: isrDays,
      color: isrDays <= 7 ? "text-red-700 bg-red-50" : isrDays <= 15 ? "text-amber-700 bg-amber-50" : "text-blue-700 bg-blue-50",
    },
    {
      tax: "ISO Trimestral",
      desc: `Vence ${isoDate.toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric" })}`,
      daysLeft: isoDays,
      color: isoDays <= 7 ? "text-red-700 bg-red-50" : isoDays <= 15 ? "text-amber-700 bg-amber-50" : "text-blue-700 bg-blue-50",
    },
  ];
}
