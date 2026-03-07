import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileText, TrendingUp, TrendingDown, DollarSign, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getQuickFinancials } from "@/app/actions/reports";
import { MONTH_NAMES } from "@/lib/tax-utils";

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

  if (!membership) redirect("/onboarding");
  const orgId = membership.organization_id;

  const financials = await getQuickFinancials(orgId);
  const now = new Date();
  const currentMonth = MONTH_NAMES[now.getMonth()];

  const reports = [
    {
      title: "Balance General",
      description: "Estado de situación financiera — activos, pasivos y patrimonio",
      icon: FileText,
      href: "/dashboard/reports/balance-general",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Estado de Resultados",
      description: "Ingresos, costos, gastos y utilidad del período",
      icon: TrendingUp,
      href: "/dashboard/reports/estado-resultados",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Balance de Comprobación",
      description: "Sumas y saldos de todas las cuentas contables",
      icon: BarChart3,
      href: "/dashboard/reports/balance-comprobacion",
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Reporte de IVA",
      description: "Débito y crédito fiscal mensual para declaración SAT",
      icon: Calculator,
      href: "/dashboard/reports/iva",
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Libro Mayor",
      description: "Detalle de movimientos por cuenta contable",
      icon: FileText,
      href: "/dashboard/reports/libro-mayor",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Reporte de Planilla",
      description: "Detalle de nómina, IGSS, IRTRA, INTECAP",
      icon: FileText,
      href: "/dashboard/reports/planilla",
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes y Análisis</h1>
        <p className="text-muted-foreground">Estados financieros y reportes fiscales de Guatemala</p>
      </div>

      {/* Monthly Summary */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">{currentMonth} {now.getFullYear()}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Ingresos Mes</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(financials.month.revenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Gastos Mes</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(financials.month.expenses)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Utilidad Mes</p>
              <p className={`text-lg font-bold ${financials.month.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(financials.month.netIncome)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">IVA Débito</p>
              <p className="text-lg font-bold">{formatCurrency(financials.month.ivaDebito)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">IVA Crédito</p>
              <p className="text-lg font-bold">{formatCurrency(financials.month.ivaCredito)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">IVA a Pagar</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(financials.month.ivaPagar)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Annual Summary */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Acumulado {now.getFullYear()}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Ingresos Anuales</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(financials.year.revenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Gastos Anuales</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(financials.year.expenses)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Utilidad Anual</p>
              <p className={`text-xl font-bold ${financials.year.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(financials.year.netIncome)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">IVA a Pagar Acumulado</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(financials.year.ivaPagar)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Links */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Reportes Disponibles</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <Link key={r.title} href={r.href}>
              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 h-full">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${r.color}`}>
                    <r.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{r.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
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
