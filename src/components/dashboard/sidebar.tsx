"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Receipt, Landmark, BookOpen, BookMarked,
  Package, Users2, Contact2, Calculator, BarChart3, Boxes, PiggyBank,
  Bot, ShieldCheck, Settings, ChevronsLeft, ChevronDown,
  Check, Wallet, RefreshCw, Sparkles,
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
      { label: "Recurrentes", href: "/dashboard/recurring", icon: RefreshCw },
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
      { label: "ISR Personal", href: "/dashboard/personal-tax", icon: Wallet },
      { label: "Impuestos Empresa", href: "/dashboard/tax", icon: Calculator },
      { label: "Presupuestos", href: "/dashboard/budgets", icon: PiggyBank },
      { label: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Importar con IA", href: "/dashboard/imports/ai-workspace", icon: Sparkles },
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
        "flex h-[calc(100vh-24px)] flex-col rounded-2xl border border-sidebar-border/60 bg-sidebar-background text-sidebar-foreground shadow-2xl shadow-black/30 ring-1 ring-white/[0.04] transition-[width] duration-200 ease-out",
        open ? "w-60" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border/60 px-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 text-white text-sm font-black shadow-lg shadow-blue-500/25 ring-1 ring-white/10">
            F
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-white tracking-tight leading-none">
                FiniTax
              </span>
              <span className="text-[10px] text-sidebar-foreground/40 mt-0.5">Guatemala</span>
            </div>
          )}
        </Link>
      </div>

      {/* Org Switcher */}
      {open && currentOrg && (
        <div className="border-b border-sidebar-border/60 px-3 py-2.5">
          <button
            onClick={() => setOrgOpen(!orgOpen)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-sidebar-accent/60 transition-colors"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-accent to-sidebar-border/80 text-[10px] font-bold text-sidebar-primary ring-1 ring-white/[0.06]">
              {currentOrg.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="flex-1 truncate text-[12px] font-medium text-sidebar-accent-foreground">{currentOrg.name}</span>
            <ChevronDown className={cn("h-3 w-3 text-sidebar-foreground/30 transition-transform duration-200", orgOpen && "rotate-180")} />
          </button>
          {orgOpen && organizations.length > 1 && (
            <div className="mt-1.5 overflow-hidden rounded-lg border border-sidebar-border/60 bg-sidebar-accent/80 shadow-lg shadow-black/20">
              {organizations.map((org: any) => (
                <button
                  key={org.id}
                  onClick={() => { onOrgChange(org); setOrgOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-sidebar-border/40"
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
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {navGroups.map((group) => (
          <div key={group.label}>
            {open && (
              <p className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35">
                {group.label}
              </p>
            )}
            {!open && <div className="my-2.5 mx-2 border-t border-sidebar-border/25" />}
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!open ? item.label : undefined}
                  className={cn(
                    "relative group flex items-center gap-3 rounded-lg px-3 py-[9px] text-[13px] transition-all duration-150",
                    active
                      ? "bg-sidebar-accent font-medium text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    !open && "justify-center px-0"
                  )}
                >
                  {active && <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary shadow-[0_0_8px_rgba(96,165,250,0.4)]" />}
                  <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0 transition-colors duration-150", active ? "text-sidebar-primary" : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/70")} />
                  {open && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Toggle */}
      <div className="border-t border-sidebar-border/60 p-2.5">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg py-2 text-sidebar-foreground/25 transition-all duration-200 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground/50"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform duration-200", !open && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}
