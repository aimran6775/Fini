"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, FileText, Receipt, Users, Landmark, Calculator, Package,
  BookOpen, Shield, Settings, BarChart3, CalendarClock, Sparkles,
  Wallet, Building2, ArrowRight,
} from "lucide-react";

interface Command {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  keywords?: string;
}

const COMMANDS: Command[] = [
  // Acciones rápidas
  { label: "Nueva Factura", href: "/dashboard/invoices/new", icon: FileText, group: "Acciones", keywords: "crear factura fel" },
  { label: "Nuevo Gasto", href: "/dashboard/expenses/new", icon: Receipt, group: "Acciones", keywords: "crear gasto" },
  { label: "Importar con IA", href: "/dashboard/imports/ai-workspace", icon: Sparkles, group: "Acciones", keywords: "importar ai excel csv" },
  { label: "Nueva Partida de Diario", href: "/dashboard/journal/new", icon: BookOpen, group: "Acciones", keywords: "partida diario contable" },
  { label: "Correr Planilla", href: "/dashboard/payroll/new", icon: Users, group: "Acciones", keywords: "planilla nomina" },
  { label: "Nuevo Empleado", href: "/dashboard/payroll/employees/new", icon: Users, group: "Acciones", keywords: "crear empleado" },
  { label: "Nuevo Contacto", href: "/dashboard/contacts/new", icon: Building2, group: "Acciones", keywords: "crear contacto cliente proveedor" },
  { label: "Nuevo Producto", href: "/dashboard/inventory/new", icon: Package, group: "Acciones", keywords: "crear producto inventario" },
  { label: "Nuevo Presupuesto", href: "/dashboard/budgets/new", icon: Wallet, group: "Acciones", keywords: "crear presupuesto" },
  { label: "Nuevo Activo Fijo", href: "/dashboard/assets/new", icon: Package, group: "Acciones", keywords: "crear activo fijo" },
  // Páginas
  { label: "Inicio", href: "/dashboard", icon: BarChart3, group: "Páginas", keywords: "dashboard resumen" },
  { label: "Facturación FEL", href: "/dashboard/invoices", icon: FileText, group: "Páginas", keywords: "facturas listado" },
  { label: "Gastos", href: "/dashboard/expenses", icon: Receipt, group: "Páginas", keywords: "gastos listado" },
  { label: "Bancos", href: "/dashboard/banking", icon: Landmark, group: "Páginas", keywords: "bancos cuentas" },
  { label: "Contactos", href: "/dashboard/contacts", icon: Building2, group: "Páginas", keywords: "clientes proveedores" },
  { label: "Inventario", href: "/dashboard/inventory", icon: Package, group: "Páginas", keywords: "productos stock" },
  { label: "Planilla", href: "/dashboard/payroll", icon: Users, group: "Páginas", keywords: "planilla nomina empleados" },
  { label: "Impuestos", href: "/dashboard/tax", icon: Calculator, group: "Páginas", keywords: "impuestos iva isr iso" },
  { label: "Plan de Cuentas", href: "/dashboard/accounts", icon: BookOpen, group: "Páginas", keywords: "cuentas contables nomenclatura" },
  { label: "Diario Contable", href: "/dashboard/journal", icon: FileText, group: "Páginas", keywords: "partidas diario" },
  { label: "Activos Fijos", href: "/dashboard/assets", icon: Package, group: "Páginas", keywords: "depreciacion activos" },
  { label: "Presupuestos", href: "/dashboard/budgets", icon: Wallet, group: "Páginas", keywords: "presupuestos" },
  { label: "Recurrentes", href: "/dashboard/recurring", icon: CalendarClock, group: "Páginas", keywords: "transacciones recurrentes" },
  { label: "ISR Personal", href: "/dashboard/personal-tax", icon: Calculator, group: "Páginas", keywords: "impuesto personal isr" },
  { label: "Reportes", href: "/dashboard/reports", icon: BarChart3, group: "Páginas", keywords: "reportes financieros balance" },
  { label: "Asistente IA", href: "/dashboard/ai", icon: Sparkles, group: "Páginas", keywords: "chat ia asistente" },
  { label: "Auditoría", href: "/dashboard/audit", icon: Shield, group: "Páginas", keywords: "bitacora auditoria" },
  { label: "Notificaciones", href: "/dashboard/notifications", icon: CalendarClock, group: "Páginas", keywords: "alertas notificaciones" },
  { label: "Configuración", href: "/dashboard/settings", icon: Settings, group: "Páginas", keywords: "ajustes perfil empresa equipo" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ⌘K listener + custom event from topbar button
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpen() {
      setOpen(true);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("open-command-palette", onOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  // Auto-focus on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = COMMANDS.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.label.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q) ||
      (c.keywords && c.keywords.includes(q))
    );
  });

  const groups = [...new Set(filtered.map((c) => c.group))];

  const select = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        select(filtered[selectedIndex].href);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, selectedIndex, select]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-border/50 bg-popover/95 shadow-2xl shadow-black/20 backdrop-blur-2xl dark:border-white/[0.08] dark:shadow-black/40 animate-scale-in overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar páginas, acciones..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
          />
          <kbd className="hidden sm:flex h-5 items-center rounded border border-border/50 bg-muted/50 px-1.5 text-[10px] font-medium text-muted-foreground/50">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground/60">No se encontraron resultados</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group} className="mb-1">
                <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                  {group}
                </p>
                {filtered
                  .filter((c) => c.group === group)
                  .map((c) => {
                    flatIndex++;
                    const idx = flatIndex;
                    return (
                      <button
                        key={c.href}
                        data-index={idx}
                        onClick={() => select(c.href)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          idx === selectedIndex
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <c.icon className={`h-4 w-4 flex-shrink-0 ${idx === selectedIndex ? "text-primary" : "text-muted-foreground/60"}`} />
                        <span className="flex-1 font-medium">{c.label}</span>
                        {idx === selectedIndex && (
                          <ArrowRight className="h-3.5 w-3.5 text-primary/60" />
                        )}
                      </button>
                    );
                  })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-border/40 px-4 py-2 text-[11px] text-muted-foreground/40">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border/50 bg-muted/50 px-1 text-[10px]">↑↓</kbd> navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border/50 bg-muted/50 px-1 text-[10px]">↵</kbd> seleccionar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border/50 bg-muted/50 px-1 text-[10px]">esc</kbd> cerrar
          </span>
        </div>
      </div>
    </div>
  );
}
