import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Receipt, Wallet, TrendingUp, TrendingDown, DollarSign,
  FileText, Users, Calculator
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get first org for the user
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organization:organizations(*)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  const orgId = membership.organization_id;
  const org = (membership as any).organization;

  // Fetch summary data
  const [invoicesRes, expensesRes, employeesRes] = await Promise.all([
    supabase
      .from("fel_invoices")
      .select("total, status", { count: "exact" })
      .eq("organization_id", orgId),
    supabase
      .from("expenses")
      .select("amount, status", { count: "exact" })
      .eq("organization_id", orgId),
    supabase
      .from("employees")
      .select("id", { count: "exact" })
      .eq("organization_id", orgId)
      .eq("status", "ACTIVE"),
  ]);

  const totalInvoiced = invoicesRes.data
    ?.filter((i: any) => i.status === "CERTIFIED")
    .reduce((sum: number, i: any) => sum + Number(i.total || 0), 0) ?? 0;

  const totalExpenses = expensesRes.data
    ?.filter((e: any) => e.status === "APPROVED")
    .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) ?? 0;

  const kpis = [
    {
      title: "Ingresos Facturados",
      value: formatCurrency(totalInvoiced),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Gastos Aprobados",
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Utilidad Neta",
      value: formatCurrency(totalInvoiced - totalExpenses),
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Facturas Emitidas",
      value: String(invoicesRes.count ?? 0),
      icon: Receipt,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Gastos Registrados",
      value: String(expensesRes.count ?? 0),
      icon: Wallet,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Empleados Activos",
      value: String(employeesRes.count ?? 0),
      icon: Users,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  const quickActions = [
    { label: "Nueva Factura FEL", href: "/dashboard/invoices/new", icon: Receipt },
    { label: "Registrar Gasto", href: "/dashboard/expenses/new", icon: Wallet },
    { label: "Nueva Partida", href: "/dashboard/journal/new", icon: FileText },
    { label: "Correr Planilla", href: "/dashboard/payroll/new", icon: Users },
    { label: "Declarar Impuesto", href: "/dashboard/tax", icon: Calculator },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Panel Principal</h1>
        <p className="text-muted-foreground">
          {org.name} • NIT: {org.nit_number} • Régimen: {org.isr_regime === "UTILIDADES" ? "Sobre Utilidades (25%)" : "Simplificado (5%/7%)"}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button variant="outline" className="gap-2">
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tax Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumen Fiscal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">IVA Débito Fiscal (12%)</span>
              <span className="font-medium">{formatCurrency(totalInvoiced * 0.12 / 1.12)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">IVA Crédito Fiscal</span>
              <span className="font-medium">{formatCurrency(totalExpenses * 0.12 / 1.12)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="text-sm font-medium">IVA a Pagar</span>
              <span className="font-bold text-primary">
                {formatCurrency(Math.max(0, (totalInvoiced - totalExpenses) * 0.12 / 1.12))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Obligaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3">
              <div>
                <p className="text-sm font-medium">IVA Mensual</p>
                <p className="text-xs text-muted-foreground">Vence día 15 del mes siguiente</p>
              </div>
              <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">Pendiente</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
              <div>
                <p className="text-sm font-medium">ISR Trimestral</p>
                <p className="text-xs text-muted-foreground">Vence cada trimestre</p>
              </div>
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">Próximo</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div>
                <p className="text-sm font-medium">ISO Trimestral (1%)</p>
                <p className="text-xs text-muted-foreground">Sobre activos netos o ingresos brutos</p>
              </div>
              <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">Próximo</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
