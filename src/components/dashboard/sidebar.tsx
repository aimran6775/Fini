"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Receipt, Landmark, BookOpen, BookMarked,
  Package, Users2, Contact2, Calculator, BarChart3, Boxes, PiggyBank,
  Bot, Bell, ShieldCheck, Settings, ChevronsLeft, ChevronDown,
  Building2, Check,
} from "lucide-react";
import { useState } from "react";

const navGroups = [
  {
    label: "General",
    items: [
      { label: "Inicio", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { label: "Facturación FEL", href: "/dashboard/invoices", icon: FileText },
      { label: "Gastos", href: "/dashboard/expenses", icon: Receipt },
      { label: "Bancos", href: "/dashboard/banking", icon: Landmark },
    ],
  },
  {
    label: "Contabilidad",
    items: [
      { label: "Plan de Cuentas", href: "/dashboard/accounts", icon: BookOpen },
      { label: "Diario", href: "/dashboard/journal", icon: BookMarked },
      { label: "Activos Fijos", href: "/dashboard/assets", icon: Package },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { label: "Planilla", href: "/dashboard/payroll", icon: Users2 },
      { label: "Contactos", href: "/dashboard/contacts", icon: Contact2 },
      { label: "Inventario", href: "/dashboard/inventory", icon: Boxes },
    ],
  },
  {
    label: "Fiscal",
    items: [
      { label: "Impuestos", href: "/dashboard/tax", icon: Calculator },
      { label: "Presupuestos", href: "/dashboard/budgets", icon: PiggyBank },
      { label: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Asistente IA", href: "/dashboard/ai", icon: Bot },
      { label: "Auditoría", href: "/dashboard/audit", icon: ShieldCheck },
      { label: "Configuración", href: "/dashboard/settings", icon: Settings },
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
  const [orgOpen, setOrgOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground transition-[width] duration-200 ease-out",
        open ? "w-60" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-black">
            F
          </div>
          {open && (
            <span className="text-sm font-semibold text-white tracking-tight">
              FiniTax
            </span>
          )}
        </Link>
      </div>

      {/* Org Switcher */}
      {open && currentOrg && (
        <div className="px-3 py-2 border-b border-sidebar-border">
          <button
            onClick={() => setOrgOpen(!orgOpen)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sidebar-accent text-[10px] font-bold text-sidebar-primary flex-shrink-0">
              {currentOrg.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="flex-1 truncate text-xs font-medium text-sidebar-accent-foreground">{currentOrg.name}</span>
            <ChevronDown className={cn("h-3 w-3 text-sidebar-foreground/40 transition-transform", orgOpen && "rotate-180")} />
          </button>
          {orgOpen && organizations.length > 1 && (
            <div className="mt-1 rounded-md bg-sidebar-accent border border-sidebar-border overflow-hidden">
              {organizations.map((org: any) => (
                <button
                  key={org.id}
                  onClick={() => { onOrgChange(org); setOrgOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-sidebar-border/50 transition-colors"
                >
                  <span className="flex-1 truncate text-sidebar-foreground">{org.name}</span>
                  {org.id === currentOrg?.id && <Check className="h-3 w-3 text-sidebar-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {open && (
              <p className="px-2 pt-4 pb-1 text-[10px] font-medium text-sidebar-foreground/30 uppercase tracking-wider">
                {group.label}
              </p>
            )}
            {!open && <div className="my-1.5 mx-2 border-t border-sidebar-border/40" />}
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
                      ? "bg-sidebar-accent text-white font-medium"
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/60",
                    !open && "justify-center"
                  )}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r bg-sidebar-primary" />}
                  <item.icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80")} />
                  {open && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Toggle */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-md py-1.5 text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform duration-200", !open && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}
