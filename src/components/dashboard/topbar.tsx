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
    <header className="flex items-center gap-3 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 h-14 flex-shrink-0">
      {/* Mobile menu */}
      <button onClick={onMenuToggle} aria-label="Abrir menú" className="lg:hidden -ml-1 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs */}
      <nav className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground flex-1 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />}
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
        <ThemeToggle />
        <NotificationBell />

        {/* User */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[11px] font-semibold">
              {initials}
            </div>
            <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">{displayName}</span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 rounded-lg border bg-popover shadow-lg shadow-black/5 z-50 overflow-hidden animate-scale-in origin-top-right">
              <div className="px-3 py-2.5 border-b">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <div className="p-1">
                <a href="/dashboard/settings" className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-muted transition-colors">
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" /> Mi Perfil
                </a>
                <a href="/dashboard/settings" className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-muted transition-colors">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" /> Configuración
                </a>
              </div>
              <div className="p-1 border-t">
                <form action={signOut}>
                  <button type="submit" className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
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
