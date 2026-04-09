import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileText, TrendingUp, TrendingDown, DollarSign, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getQuickFinancials, getDashboardTrends } from "@/app/actions/reports";
import { MONTH_NAMES } from "@/lib/tax-utils";
import { ReportsBarChart } from "@/components/dashboard/reports-charts";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");
  const orgId = membership.organization_id;

  const financials = await getQuickFinancials(orgId);
  const trends = await getDashboardTrends(orgId);
  const now = new Date();
  const currentMonth = MONTH_NAMES[now.getMonth()];

  const reports = [
    {
      title: "Balance General",
      description: "Estado de situación financiera — activos, pasivos y patrimonio",
      icon: FileText,
      href: "/dashboard/reports/balance-general",
      color: "kpi-blue",
    },
    {
      title: "Estado de Resultados",
      description: "Ingresos, costos, gastos y utilidad del período",
      icon: TrendingUp,
      href: "/dashboard/reports/estado-resultados",
      color: "kpi-emerald",
    },
    {
      title: "Balance de Comprobación",
      description: "Sumas y saldos de todas las cuentas contables",
      icon: BarChart3,
      href: "/dashboard/reports/balance-comprobacion",
      color: "kpi-slate",
    },
    {
      title: "Reporte de IVA",
      description: "Débito y crédito fiscal mensual para declaración SAT",
      icon: Calculator,
      href: "/dashboard/reports/iva",
      color: "kpi-orange",
    },
    {
      title: "Libro Mayor",
      description: "Detalle de movimientos por cuenta contable",
      icon: FileText,
      href: "/dashboard/reports/libro-mayor",
      color: "kpi-cyan",
    },
    {
      title: "Reporte de Planilla",
      description: "Detalle de nómina, IGSS, IRTRA, INTECAP",
      icon: FileText,
      href: "/dashboard/reports/planilla",
      color: "kpi-rose",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Reportes y Análisis</h1>
        <p>Estados financieros y reportes fiscales de Guatemala</p>
      </div>

      {/* Monthly Summary */}
      <div>
        <h2 className="section-title mb-3">{currentMonth} {now.getFullYear()}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Card className="card-hover">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Ingresos Mes</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatCurrency(financials.month.revenue)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Gastos Mes</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400">{formatCurrency(financials.month.expenses)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Utilidad Mes</p>
              <p className={`mt-1 text-lg font-bold tabular-nums ${financials.month.netIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {formatCurrency(financials.month.netIncome)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">IVA Débito</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{formatCurrency(financials.month.ivaDebito)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">IVA Crédito</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{formatCurrency(financials.month.ivaCredito)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">IVA a Pagar</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400">{formatCurrency(financials.month.ivaPagar)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Annual Summary */}
      <div>
        <h2 className="section-title mb-3">Acumulado {now.getFullYear()}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Card className="card-hover">
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Ingresos Anuales</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatCurrency(financials.year.revenue)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Gastos Anuales</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{formatCurrency(financials.year.expenses)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Utilidad Anual</p>
              <p className={`mt-1 text-xl font-bold tabular-nums ${financials.year.netIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {formatCurrency(financials.year.netIncome)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">IVA a Pagar Acumulado</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{formatCurrency(financials.year.ivaPagar)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue vs Expenses Chart */}
      <div>
        <h2 className="section-title mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Tendencia de 6 Meses
        </h2>
        <Card>
          <CardContent className="p-5 pt-6">
            <ReportsBarChart data={trends.monthly} />
          </CardContent>
        </Card>
      </div>

      {/* Report Links */}
      <div>
        <h2 className="section-title mb-3">Reportes Disponibles</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <Link key={r.title} href={r.href}>
              <Card className="card-hover cursor-pointer h-full">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${r.color}`}>
                    <r.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold tracking-tight">{r.title}</h3>
                    <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{r.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
