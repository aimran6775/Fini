"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Receipt, Wallet, BookOpen, Calculator,
  Users, Landmark, FileText, BarChart3, Bot, Settings,
  ChevronLeft, Building2, Package, PiggyBank, Wrench,
  Bell, Shield, ChevronsUpDown
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/dashboard/invoices", label: "Facturación FEL", icon: Receipt },
  { href: "/dashboard/expenses", label: "Gastos", icon: Wallet },
  { href: "/dashboard/accounts", label: "Plan de Cuentas", icon: BookOpen },
  { href: "/dashboard/journal", label: "Diario Contable", icon: FileText },
  { href: "/dashboard/payroll", label: "Planilla", icon: Users },
  { href: "/dashboard/tax", label: "Impuestos", icon: Calculator },
  { href: "/dashboard/banking", label: "Bancos", icon: Landmark },
  { href: "/dashboard/contacts", label: "Contactos", icon: Building2 },
  { href: "/dashboard/inventory", label: "Inventario", icon: Package },
  { href: "/dashboard/assets", label: "Activos Fijos", icon: Wrench },
  { href: "/dashboard/budgets", label: "Presupuestos", icon: PiggyBank },
  { href: "/dashboard/reports", label: "Reportes", icon: BarChart3 },
  { href: "/dashboard/ai", label: "Asistente IA", icon: Bot },
  { href: "/dashboard/notifications", label: "Notificaciones", icon: Bell },
  { href: "/dashboard/audit", label: "Auditoría", icon: Shield },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
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
        "flex flex-col bg-sidebar-background text-sidebar-foreground transition-all duration-300",
        open ? "w-64" : "w-16"
      )}
    >
      {/* Org Switcher */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-3">
        {open ? (
          <div className="flex w-full items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-white font-bold text-sm">
              {currentOrg?.name?.[0] ?? "F"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{currentOrg?.name ?? "FiniTax"}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">NIT: {currentOrg?.nit ?? ""}</p>
            </div>
            {organizations.length > 1 && (
              <select
                className="absolute opacity-0 w-full h-full cursor-pointer"
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
            )}
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-white font-bold text-sm">
            {currentOrg?.name?.[0] ?? "F"}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors mb-0.5",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
              title={!open ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {open && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex h-10 items-center justify-center border-t border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", !open && "rotate-180")} />
      </button>
    </aside>
  );
}
