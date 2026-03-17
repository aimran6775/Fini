import { getAdminDashboardStats, getRecentActivity } from "@/app/actions/admin";
import {
  Building2, Users2, FileText, Receipt, Landmark, BookMarked,
  Contact2, Bell, Clock, PiggyBank, Calculator, Boxes,
  TrendingUp, TrendingDown, Activity, DollarSign,
} from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-GT", { dateStyle: "short", timeStyle: "short" }).format(new Date(date));
}

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([
    getAdminDashboardStats(),
    getRecentActivity(),
  ]);

  const statCards = [
    { label: "Organizaciones", value: stats.orgCount, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Usuarios", value: stats.userCount, icon: Users2, color: "text-sky-400", bg: "bg-sky-500/10" },
    { label: "Facturas", value: stats.invoiceCount, icon: FileText, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Gastos", value: stats.expenseCount, icon: Receipt, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Empleados", value: stats.employeeCount, icon: Users2, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Contactos", value: stats.contactCount, icon: Contact2, color: "text-pink-400", bg: "bg-pink-500/10" },
    { label: "Cuentas Bancarias", value: stats.bankAccountCount, icon: Landmark, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Asientos Diario", value: stats.journalCount, icon: BookMarked, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Planillas", value: stats.payrollCount, icon: PiggyBank, color: "text-teal-400", bg: "bg-teal-500/10" },
    { label: "Declaraciones", value: stats.taxCount, icon: Calculator, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Notificaciones", value: stats.notifCount, icon: Bell, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Registros Auditoría", value: stats.auditCount, icon: Clock, color: "text-slate-400", bg: "bg-slate-500/10" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
        <p className="text-sm text-white/40 mt-1">
          Vista general del sistema — Todos los datos en tiempo real
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-white/40">Ingresos Totales</p>
              <p className="text-xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-white/40">Gastos Totales</p>
              <p className="text-xl font-bold text-white">{formatCurrency(stats.totalExpenses)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/40">Utilidad Neta</p>
              <p className="text-xl font-bold text-white">{formatCurrency(stats.totalRevenue - stats.totalExpenses)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Entity Stats Grid */}
      <div>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Entidades del Sistema</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/[0.07] transition-colors"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg} mb-3`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Organizations */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Organizaciones Recientes</h3>
          </div>
          <div className="space-y-2">
            {activity.recentOrgs.length === 0 ? (
              <p className="text-xs text-white/30">Sin organizaciones aún</p>
            ) : (
              activity.recentOrgs.map((org: any) => (
                <div key={org.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-sm text-white/80">{org.name}</span>
                  <span className="text-xs text-white/30">{formatDate(org.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-green-400" />
            <h3 className="text-sm font-semibold text-white">Facturas Recientes</h3>
          </div>
          <div className="space-y-2">
            {activity.recentInvoices.length === 0 ? (
              <p className="text-xs text-white/30">Sin facturas aún</p>
            ) : (
              activity.recentInvoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <div>
                    <span className="text-sm text-white/80">{inv.client_name}</span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      inv.status === "AUTHORIZED" ? "bg-green-500/10 text-green-400" :
                      inv.status === "DRAFT" ? "bg-white/10 text-white/40" :
                      "bg-yellow-500/10 text-yellow-400"
                    }`}>{inv.status}</span>
                  </div>
                  <span className="text-sm font-medium text-white/60">{formatCurrency(inv.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-white">Gastos Recientes</h3>
          </div>
          <div className="space-y-2">
            {activity.recentExpenses.length === 0 ? (
              <p className="text-xs text-white/30">Sin gastos aún</p>
            ) : (
              activity.recentExpenses.map((exp: any) => (
                <div key={exp.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <div>
                    <span className="text-sm text-white/80 truncate max-w-[200px] inline-block">{exp.description}</span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      exp.status === "APPROVED" ? "bg-green-500/10 text-green-400" :
                      exp.status === "DRAFT" ? "bg-white/10 text-white/40" :
                      "bg-red-500/10 text-red-400"
                    }`}>{exp.status}</span>
                  </div>
                  <span className="text-sm font-medium text-white/60">{formatCurrency(exp.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Log */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Actividad Reciente</h3>
          </div>
          <div className="space-y-2">
            {activity.recentAudit.length === 0 ? (
              <p className="text-xs text-white/30">Sin actividad aún</p>
            ) : (
              activity.recentAudit.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-mono">{log.action}</span>
                    <span className="text-xs text-white/40">{log.entity_type}</span>
                  </div>
                  <span className="text-xs text-white/30">{formatDate(log.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
