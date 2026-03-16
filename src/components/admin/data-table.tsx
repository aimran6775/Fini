"use client";

import { useState, useTransition } from "react";
import { adminDeleteRow, adminUpdateRow, adminInsertRow } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import {
  Trash2, Pencil, Plus, X, Check, ChevronLeft, ChevronRight,
  Search, AlertCircle, Loader2,
} from "lucide-react";

interface Column {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "boolean" | "currency" | "json";
  options?: string[];
  editable?: boolean;
  searchable?: boolean;
  width?: string;
}

interface AdminDataTableProps {
  table: string;
  title: string;
  data: any[];
  columns: Column[];
  totalCount: number;
  page: number;
  pageSize: number;
  searchQuery?: string;
  orgFilterId?: string;
}

function formatValue(value: any, type?: string): string {
  if (value === null || value === undefined) return "—";
  if (type === "currency") return new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(value);
  if (type === "date") {
    try {
      return new Intl.DateTimeFormat("es-GT", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
    } catch { return String(value); }
  }
  if (type === "boolean") return value ? "Sí" : "No";
  if (type === "json") return JSON.stringify(value).slice(0, 60) + "...";
  return String(value);
}

export function AdminDataTable({
  table,
  title,
  data,
  columns,
  totalCount,
  page,
  pageSize,
  searchQuery = "",
}: AdminDataTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createValues, setCreateValues] = useState<Record<string, any>>({});
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchQuery);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  function navigate(newPage: number, newSearch?: string) {
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    if (newSearch !== undefined ? newSearch : search) {
      params.set("search", newSearch !== undefined ? newSearch : search);
    }
    router.push(`?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(1, search);
  }

  async function handleDelete(id: string) {
    setError("");
    startTransition(async () => {
      const result = await adminDeleteRow(table, id);
      if (result.error) setError(result.error);
      else {
        setDeleteConfirm(null);
        router.refresh();
      }
    });
  }

  function startEdit(row: any) {
    setEditingId(row.id);
    const vals: Record<string, any> = {};
    columns.filter(c => c.editable !== false).forEach(c => {
      vals[c.key] = row[c.key];
    });
    setEditValues(vals);
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    setError("");
    startTransition(async () => {
      const result = await adminUpdateRow(table, editingId, editValues);
      if (result.error) setError(result.error);
      else {
        setEditingId(null);
        router.refresh();
      }
    });
  }

  async function handleCreate() {
    setError("");
    startTransition(async () => {
      const result = await adminInsertRow(table, createValues);
      if (result.error) setError(result.error);
      else {
        setShowCreate(false);
        setCreateValues({});
        router.refresh();
      }
    });
  }

  const editableColumns = columns.filter(c => c.editable !== false && c.key !== "id" && c.key !== "created_at" && c.key !== "updated_at");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="text-xs text-white/40 mt-0.5">{totalCount.toLocaleString()} registros en <span className="font-mono text-white/50">{table}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-48 rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:border-red-500/50 focus:outline-none"
            />
          </form>
          <button
            onClick={() => { setShowCreate(!showCreate); setCreateValues({}); }}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Crear
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto"><X className="h-3 w-3" /></button>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Crear Nuevo Registro</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {editableColumns.map((col) => (
              <div key={col.key}>
                <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{col.label}</label>
                {col.type === "select" && col.options ? (
                  <select
                    value={createValues[col.key] ?? ""}
                    onChange={(e) => setCreateValues({ ...createValues, [col.key]: e.target.value })}
                    className="mt-0.5 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:border-red-500/50 focus:outline-none"
                  >
                    <option value="" className="bg-[#0a0a1a]">Seleccionar...</option>
                    {col.options.map(opt => (
                      <option key={opt} value={opt} className="bg-[#0a0a1a]">{opt}</option>
                    ))}
                  </select>
                ) : col.type === "boolean" ? (
                  <select
                    value={createValues[col.key] ?? ""}
                    onChange={(e) => setCreateValues({ ...createValues, [col.key]: e.target.value === "true" })}
                    className="mt-0.5 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:border-red-500/50 focus:outline-none"
                  >
                    <option value="" className="bg-[#0a0a1a]">Seleccionar...</option>
                    <option value="true" className="bg-[#0a0a1a]">Sí</option>
                    <option value="false" className="bg-[#0a0a1a]">No</option>
                  </select>
                ) : (
                  <input
                    type={col.type === "number" || col.type === "currency" ? "number" : col.type === "date" ? "datetime-local" : "text"}
                    step={col.type === "currency" ? "0.01" : undefined}
                    value={createValues[col.key] ?? ""}
                    onChange={(e) => setCreateValues({ ...createValues, [col.key]: col.type === "number" || col.type === "currency" ? Number(e.target.value) : e.target.value })}
                    className="mt-0.5 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-white/20 focus:border-red-500/50 focus:outline-none"
                    placeholder={col.label}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Guardar
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="h-3 w-3" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {columns.map((col) => (
                  <th key={col.key} className="px-3 py-2.5 text-left font-medium text-white/40 uppercase tracking-wider whitespace-nowrap" style={{ width: col.width }}>
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-medium text-white/40 uppercase tracking-wider w-24">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-3 py-8 text-center text-white/30">
                    No se encontraron registros
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2 whitespace-nowrap">
                        {editingId === row.id && editValues.hasOwnProperty(col.key) ? (
                          col.type === "select" && col.options ? (
                            <select
                              value={editValues[col.key] ?? ""}
                              onChange={(e) => setEditValues({ ...editValues, [col.key]: e.target.value })}
                              className="w-full rounded border border-red-500/50 bg-white/5 px-1.5 py-1 text-xs text-white focus:outline-none"
                            >
                              {col.options.map(opt => (
                                <option key={opt} value={opt} className="bg-[#0a0a1a]">{opt}</option>
                              ))}
                            </select>
                          ) : col.type === "boolean" ? (
                            <select
                              value={String(editValues[col.key])}
                              onChange={(e) => setEditValues({ ...editValues, [col.key]: e.target.value === "true" })}
                              className="w-full rounded border border-red-500/50 bg-white/5 px-1.5 py-1 text-xs text-white focus:outline-none"
                            >
                              <option value="true" className="bg-[#0a0a1a]">Sí</option>
                              <option value="false" className="bg-[#0a0a1a]">No</option>
                            </select>
                          ) : (
                            <input
                              type={col.type === "number" || col.type === "currency" ? "number" : "text"}
                              step={col.type === "currency" ? "0.01" : undefined}
                              value={editValues[col.key] ?? ""}
                              onChange={(e) => setEditValues({ ...editValues, [col.key]: col.type === "number" || col.type === "currency" ? Number(e.target.value) : e.target.value })}
                              className="w-full rounded border border-red-500/50 bg-white/5 px-1.5 py-1 text-xs text-white focus:outline-none"
                            />
                          )
                        ) : (
                          <span className={cn(
                            "text-white/70",
                            col.key === "id" && "font-mono text-white/30 text-[10px]",
                            col.type === "currency" && "font-medium text-white/80",
                          )}>
                            {col.key === "id" ? row[col.key]?.slice(0, 8) + "…" : formatValue(row[col.key], col.type)}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right">
                      {editingId === row.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={handleSaveEdit}
                            disabled={isPending}
                            className="p-1 rounded hover:bg-green-500/10 text-green-400 transition-colors"
                          >
                            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded hover:bg-white/10 text-white/40 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : deleteConfirm === row.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDelete(row.id)}
                            disabled={isPending}
                            className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-medium hover:bg-red-500 transition-colors"
                          >
                            {isPending ? "..." : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-1 rounded hover:bg-white/10 text-white/40 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(row)}
                            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(row.id)}
                            className="p-1 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 bg-white/[0.02]">
            <p className="text-xs text-white/30">
              Mostrando {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalCount)} de {totalCount}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(page - 1)}
                disabled={page <= 1}
                className="p-1 rounded hover:bg-white/10 text-white/40 disabled:text-white/10 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-white/50 px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => navigate(page + 1)}
                disabled={page >= totalPages}
                className="p-1 rounded hover:bg-white/10 text-white/40 disabled:text-white/10 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility for cn in this file
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
