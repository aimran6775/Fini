import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import {
  Receipt, Wallet, TrendingUp, TrendingDown, DollarSign,
  FileText, Users, Calculator, ArrowUpRight, ArrowDownRight,
  CalendarClock, Plus, ChevronRight, Landmark, Boxes, Settings,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
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

  const [invoicesRes, expensesRes, employeesRes, bankRes] = await Promise.all([
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
    supabase
      .from("bank_accounts")
      .select("current_balance")
      .eq("organization_id", orgId)
      .eq("is_active", true),
  ]);

  const totalInvoiced = invoicesRes.data
    ?.filter((i: any) => i.status === "CERTIFIED")
    .reduce((sum: number, i: any) => sum + Number(i.total || 0), 0) ?? 0;

  const totalExpenses = expensesRes.data
    ?.filter((e: any) => e.status === "APPROVED")
    .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) ?? 0;

  const netIncome = totalInvoiced - totalExpenses;
  const bankBalance = bankRes.data?.reduce((sum: number, b: any) => sum + Number(b.current_balance || 0), 0) ?? 0;

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
  const needsSetup = org.nit_number === "CF";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Setup Reminder Banner */}
      {needsSetup && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Settings className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-900">Completa tu información fiscal</p>
                <p className="text-sm text-amber-700">
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
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">{firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {org.name} · NIT {org.nit_number}
          </p>
        </div>
        <div className="flex gap-2">
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
          iconBg="bg-emerald-50 text-emerald-600"
          trend={totalInvoiced > 0 ? "+12%" : undefined}
          trendUp={true}
        />
        <KpiCard
          label="Gastos"
          value={formatCurrency(totalExpenses)}
          icon={<TrendingDown className="h-4 w-4" />}
          iconBg="bg-rose-50 text-rose-600"
          trend={totalExpenses > 0 ? "-3%" : undefined}
          trendUp={false}
        />
        <KpiCard
          label="Utilidad Neta"
          value={formatCurrency(netIncome)}
          icon={<DollarSign className="h-4 w-4" />}
          iconBg="bg-violet-50 text-violet-600"
        />
        <KpiCard
          label="Saldo Bancario"
          value={formatCurrency(bankBalance)}
          icon={<Landmark className="h-4 w-4" />}
          iconBg="bg-blue-50 text-blue-600"
        />
      </div>

      {/* ─── Middle Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Acciones Rápidas</h2>
          <div className="space-y-1.5">
            {[
              { label: "Nueva Factura", href: "/dashboard/invoices/new", icon: FileText, color: "text-indigo-600 bg-indigo-50" },
              { label: "Registrar Gasto", href: "/dashboard/expenses/new", icon: Receipt, color: "text-amber-600 bg-amber-50" },
              { label: "Partida de Diario", href: "/dashboard/journal/new", icon: FileText, color: "text-emerald-600 bg-emerald-50" },
              { label: "Correr Planilla", href: "/dashboard/payroll/new", icon: Users, color: "text-cyan-600 bg-cyan-50" },
              { label: "Calcular Impuesto", href: "/dashboard/tax", icon: Calculator, color: "text-rose-600 bg-rose-50" },
              { label: "Nuevo Contacto", href: "/dashboard/contacts/new", icon: Users, color: "text-purple-600 bg-purple-50" },
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
                          inv.status === "CERTIFIED" ? "bg-emerald-50 text-emerald-700" :
                          inv.status === "VOIDED" ? "bg-red-50 text-red-700" :
                          "bg-neutral-100 text-neutral-600"
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

        {/* Obligations */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" /> Próximas Obligaciones
          </h2>
          <div className="rounded-lg border divide-y">
            {[
              { tax: "IVA Mensual", desc: "Vence día 15 del mes siguiente", status: "Pendiente", color: "text-amber-700 bg-amber-50" },
              { tax: "ISR Trimestral", desc: "Vence cada trimestre", status: "Próximo", color: "text-blue-700 bg-blue-50" },
              { tax: "ISO Trimestral", desc: "1% sobre activos o ingresos", status: "Próximo", color: "text-violet-700 bg-violet-50" },
            ].map((ob) => (
              <div key={ob.tax} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{ob.tax}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{ob.desc}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${ob.color}`}>
                  {ob.status}
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
  trend?: string;
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
