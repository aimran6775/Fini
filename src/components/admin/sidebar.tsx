"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, Users2, FileText, Receipt,
  Landmark, BookOpen, BookMarked, Package, Contact2,
  Calculator, Bell, ShieldCheck, Boxes, PiggyBank,
  ChevronsLeft, Shield, Wallet, RefreshCw, Clock,
  Database,
} from "lucide-react";

const adminNavGroups = [
  {
    label: "General",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Entidades Principales",
    items: [
      { label: "Organizaciones", href: "/admin/organizations", icon: Building2 },
      { label: "Usuarios", href: "/admin/users", icon: Users2 },
      { label: "Miembros", href: "/admin/members", icon: ShieldCheck },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { label: "Facturas FEL", href: "/admin/invoices", icon: FileText },
      { label: "Gastos", href: "/admin/expenses", icon: Receipt },
      { label: "Cuentas Bancarias", href: "/admin/bank-accounts", icon: Landmark },
      { label: "Transacciones", href: "/admin/transactions", icon: Wallet },
    ],
  },
  {
    label: "Contabilidad",
    items: [
      { label: "Plan de Cuentas", href: "/admin/accounts", icon: BookOpen },
      { label: "Diario Contable", href: "/admin/journal", icon: BookMarked },
      { label: "Activos Fijos", href: "/admin/assets", icon: Package },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { label: "Empleados", href: "/admin/employees", icon: Users2 },
      { label: "Planillas", href: "/admin/payroll", icon: PiggyBank },
      { label: "Contactos", href: "/admin/contacts", icon: Contact2 },
      { label: "Inventario", href: "/admin/inventory", icon: Boxes },
    ],
  },
  {
    label: "Fiscal",
    items: [
      { label: "Declaraciones", href: "/admin/tax-filings", icon: Calculator },
      { label: "Presupuestos", href: "/admin/budgets", icon: PiggyBank },
      { label: "Recurrentes", href: "/admin/recurring", icon: RefreshCw },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Notificaciones", href: "/admin/notifications", icon: Bell },
      { label: "Auditoría", href: "/admin/audit-logs", icon: Clock },
      { label: "SQL Directo", href: "/admin/sql", icon: Database },
    ],
  },
];

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-white/10 bg-[#0a0a1a] text-white/70 transition-[width] duration-200 ease-out",
        open ? "w-60" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-white/10 px-4">
        <Link href="/admin" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-600 text-white text-xs font-black">
            <Shield className="h-3.5 w-3.5" />
          </div>
          {open && (
            <span className="text-sm font-semibold text-white tracking-tight">
              Admin Panel
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {adminNavGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {open && (
              <p className="px-2 pt-4 pb-1 text-[10px] font-medium text-white/20 uppercase tracking-wider">
                {group.label}
              </p>
            )}
            {!open && <div className="my-1.5 mx-2 border-t border-white/10" />}
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!open ? item.label : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-md px-2 py-[7px] text-[13px] transition-colors relative",
                    active
                      ? "bg-red-500/10 text-white font-medium"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5",
                    !open && "justify-center"
                  )}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r bg-red-500" />}
                  <item.icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-red-400" : "text-white/30 group-hover:text-white/60")} />
                  {open && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Toggle */}
      <div className="border-t border-white/10 p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-md py-1.5 text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform duration-200", !open && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}
