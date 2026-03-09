"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FiniTaxMark } from "@/components/logo";
import {
  LayoutDashboard, FileText, Receipt, Landmark, BookOpen, BookMarked,
  Package, Users2, Contact2, Calculator, BarChart3, Boxes, PiggyBank,
  Bot, Bell, ShieldCheck, Settings, ChevronLeft, ChevronDown, Building2,
  Check, Sparkles,
} from "lucide-react";
import { useState } from "react";

/* ── Navigation structure ────────────────────────────────────── */
const navGroups = [
  {
    label: "General",
    items: [
      { label: "Panel Principal", href: "/dashboard", icon: LayoutDashboard },
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
      { label: "Diario Contable", href: "/dashboard/journal", icon: BookMarked },
      { label: "Activos Fijos", href: "/dashboard/assets", icon: Package },
    ],
  },
  {
    label: "RRHH",
    items: [
      { label: "Planilla", href: "/dashboard/payroll", icon: Users2 },
      { label: "Contactos", href: "/dashboard/contacts", icon: Contact2 },
    ],
  },
  {
    label: "Reportes",
    items: [
      { label: "Impuestos", href: "/dashboard/tax", icon: Calculator },
      { label: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
      { label: "Inventario", href: "/dashboard/inventory", icon: Boxes },
      { label: "Presupuestos", href: "/dashboard/budgets", icon: PiggyBank },
    ],
  },
  {
    label: "Herramientas",
    items: [
      { label: "Asistente IA", href: "/dashboard/ai", icon: Bot },
      { label: "Notificaciones", href: "/dashboard/notifications", icon: Bell },
      { label: "Auditoría", href: "/dashboard/audit", icon: ShieldCheck },
      { label: "Configuración", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

/* ── Types ────────────────────────────────────────────────────── */
interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  currentOrg: any;
  organizations: any[];
  onOrgChange: (org: any) => void;
}

export function Sidebar({ open, onToggle, currentOrg, organizations, onOrgChange }: SidebarProps) {
  const pathname = usePathname();
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out relative",
        open ? "w-[264px]" : "w-[70px]"
      )}
    >
      {/* ── Top: logo + org switcher ── */}
      <div className="flex-shrink-0 p-3">
        {/* Logo */}
        <div className={cn("flex items-center gap-2.5 px-2 py-2", !open && "justify-center")}>
          <FiniTaxMark size={32} />
          {open && (
            <span className="font-bold text-base tracking-tight text-white">
              Fini<span className="text-sidebar-primary">Tax</span>
            </span>
          )}
        </div>

        {/* Org Switcher */}
        {open && currentOrg && (
          <div className="mt-3 relative">
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className="w-full flex items-center gap-2.5 rounded-xl bg-sidebar-accent/50 border border-sidebar-border px-3 py-2.5 text-left hover:bg-sidebar-accent transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary text-xs font-bold flex-shrink-0">
                {currentOrg.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentOrg.name}</p>
                <p className="text-[10px] text-sidebar-foreground/40 capitalize">{currentOrg.role}</p>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-sidebar-foreground/30 transition-transform", orgDropdownOpen && "rotate-180")} />
            </button>

            {orgDropdownOpen && organizations.length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-[#0f0f2e] border border-sidebar-border shadow-xl z-50 overflow-hidden">
                {organizations.map((org: any) => (
                  <button
                    key={org.id}
                    onClick={() => { onOrgChange(org); setOrgDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-sidebar-accent/50 transition-colors text-sm"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary/10 text-sidebar-primary text-xs font-bold">
                      {org.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="flex-1 truncate text-xs text-sidebar-foreground">{org.name}</span>
                    {org.id === currentOrg?.id && <Check className="h-3.5 w-3.5 text-sidebar-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {open && (
              <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold text-sidebar-foreground/25 uppercase tracking-[0.15em]">
                {group.label}
              </p>
            )}
            {!open && <div className="my-2 mx-3 border-t border-sidebar-border/30" />}
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 relative",
                    active
                      ? "bg-sidebar-primary/10 text-white font-medium"
                      : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/40",
                    !open && "justify-center px-0"
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary" />
                  )}
                  <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", active ? "text-sidebar-primary" : "text-sidebar-foreground/35 group-hover:text-sidebar-foreground/60")} />
                  {open && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom: Upgrade + Toggle ── */}
      <div className="flex-shrink-0 p-3 border-t border-sidebar-border/30">
        {open && (
          <div className="mb-3 rounded-xl bg-gradient-to-br from-sidebar-primary/10 to-purple-500/10 border border-sidebar-primary/15 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-sidebar-primary" />
              <span className="text-xs font-semibold text-white">Pro</span>
            </div>
            <p className="text-[11px] text-sidebar-foreground/40 leading-relaxed mb-3">
              Desbloquee reportes avanzados, múltiples usuarios y soporte prioritario.
            </p>
            <button className="w-full rounded-lg bg-sidebar-primary/20 text-sidebar-primary text-xs font-medium py-2 hover:bg-sidebar-primary/30 transition-colors">
              Actualizar Plan
            </button>
          </div>
        )}

        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full rounded-lg py-2 text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent/40 transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", !open && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}
