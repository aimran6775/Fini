import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Receipt, Wallet, TrendingUp, TrendingDown, DollarSign,
  FileText, Users, Calculator, ArrowRight, ArrowUpRight,
  CalendarClock, Sparkles
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

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organization:organizations(*)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");

  const orgId = membership.organization_id;
  const org = (membership as any).organization;

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

  const netIncome = totalInvoiced - totalExpenses;

  const kpis = [
    {
      title: "Ingresos Facturados",
      value: formatCurrency(totalInvoiced),
      icon: TrendingUp,
      gradient: "from-emerald-500 to-green-600",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      change: "+12.5%",
      changePositive: true,
    },
    {
      title: "Gastos Aprobados",
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      gradient: "from-rose-500 to-red-600",
      bg: "bg-rose-50",
      text: "text-rose-700",
      change: "-3.2%",
      changePositive: false,
    },
    {
      title: "Utilidad Neta",
      value: formatCurrency(netIncome),
      icon: DollarSign,
      gradient: "from-violet-500 to-indigo-600",
      bg: "bg-violet-50",
      text: "text-violet-700",
      change: "+8.1%",
      changePositive: true,
    },
    {
      title: "Facturas Emitidas",
      value: String(invoicesRes.count ?? 0),
      icon: Receipt,
      gradient: "from-purple-500 to-fuchsia-600",
      bg: "bg-purple-50",
      text: "text-purple-700",
    },
    {
      title: "Gastos Registrados",
      value: String(expensesRes.count ?? 0),
      icon: Wallet,
      gradient: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      title: "Empleados Activos",
      value: String(employeesRes.count ?? 0),
      icon: Users,
      gradient: "from-cyan-500 to-blue-600",
      bg: "bg-cyan-50",
      text: "text-cyan-700",
    },
  ];

  const quickActions = [
    { label: "Nueva Factura", href: "/dashboard/invoices/new", icon: Receipt, gradient: "from-violet-500 to-indigo-600" },
    { label: "Nuevo Gasto", href: "/dashboard/expenses/new", icon: Wallet, gradient: "from-amber-500 to-orange-600" },
    { label: "Nueva Partida", href: "/dashboard/journal/new", icon: FileText, gradient: "from-emerald-500 to-green-600" },
    { label: "Correr Planilla", href: "/dashboard/payroll/new", icon: Users, gradient: "from-cyan-500 to-blue-600" },
    { label: "Declarar Impuesto", href: "/dashboard/tax", icon: Calculator, gradient: "from-rose-500 to-red-600" },
  ];

  return (
    <div className="space-y-8">
      {/* ─── Welcome Banner ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-violet-700 p-8 text-white">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-medium text-white/70">Panel Principal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bienvenido de vuelta 👋
            </h1>
            <p className="mt-1 text-white/60 text-sm sm:text-base">
              {org.name} • NIT: {org.nit_number} • {org.isr_regime === "UTILIDADES" ? "Régimen sobre Utilidades (25%)" : "Régimen Simplificado (5%/7%)"}
            </p>
          </div>
          <Link href="/dashboard/invoices/new">
            <Button className="bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 rounded-xl h-11 px-6 shadow-lg shadow-black/10 transition-all">
              <Receipt className="mr-2 h-4 w-4" />
              Nueva Factura
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={kpi.title} className="group rounded-2xl border-border/40 hover:border-border hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.gradient} text-white shadow-lg shadow-black/10`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                {kpi.change && (
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    kpi.changePositive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}>
                    <ArrowUpRight className={`h-3 w-3 ${!kpi.changePositive && "rotate-90"}`} />
                    {kpi.change}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
              <p className="text-2xl font-extrabold tracking-tight mt-1">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Quick Actions ─── */}
      <Card className="rounded-2xl border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="outline"
                  className="rounded-xl h-11 gap-2.5 border-border/60 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all duration-200"
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${action.gradient} text-white`}>
                    <action.icon className="h-3.5 w-3.5" />
                  </div>
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Tax Summary + Upcoming ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tax Summary */}
        <Card className="rounded-2xl border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Resumen Fiscal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">IVA Débito Fiscal (12%)</span>
              </div>
              <span className="text-sm font-bold">{formatCurrency(totalInvoiced * 0.12 / 1.12)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">IVA Crédito Fiscal</span>
              </div>
              <span className="text-sm font-bold">{formatCurrency(totalExpenses * 0.12 / 1.12)}</span>
            </div>
            <div className="border-t pt-4 flex items-center justify-between">
              <span className="text-sm font-bold">IVA a Pagar</span>
              <span className="text-lg font-extrabold text-primary">
                {formatCurrency(Math.max(0, (totalInvoiced - totalExpenses) * 0.12 / 1.12))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Obligations */}
        <Card className="rounded-2xl border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Próximas Obligaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-100">
              <div>
                <p className="text-sm font-semibold text-amber-900">IVA Mensual</p>
                <p className="text-xs text-amber-700/70 mt-0.5">Vence día 15 del mes siguiente</p>
              </div>
              <span className="inline-flex items-center rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Pendiente
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div>
                <p className="text-sm font-semibold text-blue-900">ISR Trimestral</p>
                <p className="text-xs text-blue-700/70 mt-0.5">Vence cada trimestre</p>
              </div>
              <span className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                Próximo
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-violet-50 border border-violet-100">
              <div>
                <p className="text-sm font-semibold text-violet-900">ISO Trimestral</p>
                <p className="text-xs text-violet-700/70 mt-0.5">1% sobre activos o ingresos</p>
              </div>
              <span className="inline-flex items-center rounded-lg bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
                Próximo
              </span>
            </div>
            <Link href="/dashboard/tax" className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 pt-2 transition-colors">
              Ver todas las obligaciones
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
