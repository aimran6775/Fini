"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Receipt, Wallet, BookOpen, Calculator,
  Users, Landmark, FileText, BarChart3, Bot, Settings,
  ChevronLeft, Building2, Package, PiggyBank, Wrench,
  Bell, Shield, ChevronsUpDown, Sparkles
} from "lucide-react";
import { FiniTaxMark } from "@/components/logo";

/* ─── Navigation Groups ─── */
const navGroups = [
  {
    label: "General",
    items: [
      { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { href: "/dashboard/invoices", label: "Facturación FEL", icon: Receipt },
      { href: "/dashboard/expenses", label: "Gastos", icon: Wallet },
      { href: "/dashboard/banking", label: "Bancos", icon: Landmark },
    ],
  },
  {
    label: "Contabilidad",
    items: [
      { href: "/dashboard/accounts", label: "Plan de Cuentas", icon: BookOpen },
      { href: "/dashboard/journal", label: "Diario Contable", icon: FileText },
      { href: "/dashboard/assets", label: "Activos Fijos", icon: Wrench },
    ],
  },
  {
    label: "RRHH",
    items: [
      { href: "/dashboard/payroll", label: "Planilla", icon: Users },
      { href: "/dashboard/contacts", label: "Contactos", icon: Building2 },
    ],
  },
  {
    label: "Reportes",
    items: [
      { href: "/dashboard/tax", label: "Impuestos", icon: Calculator },
      { href: "/dashboard/reports", label: "Reportes", icon: BarChart3 },
      { href: "/dashboard/inventory", label: "Inventario", icon: Package },
      { href: "/dashboard/budgets", label: "Presupuestos", icon: PiggyBank },
    ],
  },
  {
    label: "Herramientas",
    items: [
      { href: "/dashboard/ai", label: "Asistente IA", icon: Bot },
      { href: "/dashboard/notifications", label: "Notificaciones", icon: Bell },
      { href: "/dashboard/audit", label: "Auditoría", icon: Shield },
      { href: "/dashboard/settings", label: "Configuración", icon: Settings },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  currentOrg: any;
  organizations: any[];
  onOrgChange: (org: any) => void;
}

export function Sidebar({ open, onToggle, currentOrg, organizations, onOrgChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-[70px]"
      )}
    >
      {/* ─── Org Switcher ─── */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-3">
        {open ? (
          <div className="relative flex w-full items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-indigo-400 text-white font-bold text-sm flex-shrink-0 shadow-md shadow-sidebar-primary/20">
              {currentOrg?.name?.[0] ?? "F"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">{currentOrg?.name ?? "FiniTax"}</p>
              <p className="truncate text-xs text-sidebar-foreground/40">NIT: {currentOrg?.nit_number ?? ""}</p>
            </div>
            {organizations.length > 1 && (
              <div className="relative">
                <ChevronsUpDown className="h-4 w-4 text-sidebar-foreground/40" />
                <select
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  value={currentOrg?.id}
                  onChange={(e) => {
                    const org = organizations.find((o: any) => o.id === e.target.value);
                    if (org) onOrgChange(org);
                  }}
                >
                  {organizations.map((org: any) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto">
            <FiniTaxMark size={36} />
          </div>
        )}
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {open && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/30">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary/15 text-sidebar-primary font-semibold shadow-sm shadow-sidebar-primary/5"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                    title={!open ? item.label : undefined}
                  >
                    <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive && "text-sidebar-primary")} />
                    {open && <span className="truncate">{item.label}</span>}
                    {isActive && open && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Upgrade Banner (collapsed = icon only) ─── */}
      {open && (
        <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-sidebar-primary/20 to-indigo-500/10 p-4 border border-sidebar-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-sidebar-primary" />
            <span className="text-xs font-semibold text-sidebar-primary">Pro</span>
          </div>
          <p className="text-[11px] text-sidebar-foreground/50 leading-relaxed">
            Asistente IA, reportes avanzados y más
          </p>
        </div>
      )}

      {/* ─── Toggle Button ─── */}
      <button
        onClick={onToggle}
        className="flex h-12 items-center justify-center border-t border-sidebar-border text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent transition-all duration-200"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", !open && "rotate-180")} />
      </button>
    </aside>
  );
}
