"use client";

import { useState, useRef, useEffect } from "react";
import { type User } from "@supabase/supabase-js";
import { cn, getInitials } from "@/lib/utils";
import { signOut } from "@/app/actions/auth";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { ThemeToggle } from "@/components/theme-provider";
import { usePathname } from "next/navigation";
import {
  Menu, Search, Settings, LogOut, User as UserIcon, ChevronRight,
} from "lucide-react";

/* Breadcrumb labels from path segments */
const segmentLabels: Record<string, string> = {
  dashboard: "Inicio",
  invoices: "Facturación",
  expenses: "Gastos",
  banking: "Bancos",
  accounts: "Plan de Cuentas",
  journal: "Diario",
  assets: "Activos Fijos",
  payroll: "Planilla",
  contacts: "Contactos",
  inventory: "Inventario",
  tax: "Impuestos",
  budgets: "Presupuestos",
  reports: "Reportes",
  ai: "Asistente IA",
  audit: "Auditoría",
  settings: "Configuración",
  notifications: "Notificaciones",
  new: "Nuevo",
  employees: "Empleados",
};

interface TopbarProps {
  user: User;
  profile: any;
  onMenuToggle: () => void;
}

export function Topbar({ user, profile, onMenuToggle }: TopbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const displayName =
    profile?.first_name
      ? `${profile.first_name} ${profile.last_name || ""}`.trim()
      : user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";
  const initials = getInitials(displayName);

  // Build breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: segmentLabels[seg] || seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 mx-3 mt-3 flex h-14 flex-shrink-0 items-center gap-3 rounded-2xl border border-border/40 bg-background/80 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-2xl sm:mx-4 sm:px-5 dark:border-white/[0.06] dark:shadow-none">
      {/* Mobile menu */}
      <button onClick={onMenuToggle} aria-label="Abrir menú" className="-ml-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs */}
      <nav className="hidden min-w-0 flex-1 items-center gap-1 text-[13px] text-muted-foreground sm:flex">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0 text-muted-foreground/40" />}
            <span className={cn("truncate", crumb.isLast ? "text-foreground font-medium" : "")}>
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Mobile: just show page title */}
      <div className="sm:hidden flex-1">
        <span className="text-sm font-medium text-foreground">
          {breadcrumbs[breadcrumbs.length - 1]?.label ?? "Inicio"}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => document.dispatchEvent(new Event("open-command-palette"))}
          className="hidden items-center gap-2.5 rounded-lg border border-border/40 bg-muted/25 px-3 py-1.5 text-[13px] text-muted-foreground/50 transition-all duration-150 hover:bg-muted/40 hover:border-border/60 md:flex w-[220px]"
          aria-label="Buscar"
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="flex h-5 items-center rounded border border-border/50 bg-background/80 px-1.5 text-[10px] font-medium text-muted-foreground/50">⌘K</kbd>
        </button>
        <ThemeToggle />
        <NotificationBell />

        {/* User */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 transition-colors hover:border-border hover:bg-muted/70"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[11px] font-semibold">
              {initials}
            </div>
            <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">{displayName}</span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-border/50 bg-popover/95 shadow-xl shadow-black/10 backdrop-blur-2xl animate-scale-in dark:border-white/[0.08] dark:shadow-black/30">
              <div className="border-b border-border/50 px-3 py-2.5">
                <p className="text-[13px] font-medium">{displayName}</p>
                <p className="text-[11px] text-muted-foreground/70 truncate">{user.email}</p>
              </div>
              <div className="p-1">
                <a href="/dashboard/settings" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] hover:bg-muted/70 transition-colors">
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground/60" /> Mi Perfil
                </a>
                <a href="/dashboard/settings" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] hover:bg-muted/70 transition-colors">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground/60" /> Configuración
                </a>
              </div>
              <div className="p-1 border-t border-border/50">
                <form action={signOut}>
                  <button type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <LogOut className="h-3.5 w-3.5" /> Cerrar Sesión
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
