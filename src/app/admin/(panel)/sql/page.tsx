"use client";

import { useState, useTransition } from "react";
import { adminListTable } from "@/app/actions/admin";
import { Database, Play, Loader2, AlertCircle, Table2 } from "lucide-react";

const TABLES = [
  "organizations",
  "user_profiles",
  "organization_members",
  "invitations",
  "chart_of_accounts",
  "journal_entries",
  "journal_entry_lines",
  "fel_invoices",
  "fel_invoice_items",
  "invoice_payments",
  "expenses",
  "employees",
  "payroll_runs",
  "payroll_details",
  "tax_filings",
  "inventory_items",
  "inventory_adjustments",
  "contacts",
  "bank_accounts",
  "bank_transactions",
  "bank_reconciliations",
  "notifications",
  "audit_logs",
  "consent_logs",
  "recurring_transactions",
  "currency_rates",
  "budgets",
  "fixed_assets",
  "depreciation_entries",
  "stamp_tax_records",
];

export default function AdminSQLPage() {
  const [selectedTable, setSelectedTable] = useState("organizations");
  const [limit, setLimit] = useState(20);
  const [results, setResults] = useState<any[] | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleQuery() {
    setError("");
    startTransition(async () => {
      const result = await adminListTable(selectedTable, { limit, offset: 0 });
      if (result.error) {
        setError(result.error);
        setResults(null);
      } else {
        setResults(result.data);
        setTotalCount(result.count);
      }
    });
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-red-400" />
          <h1 className="text-xl font-bold text-white">Explorador de Base de Datos</h1>
        </div>
        <p className="text-xs text-white/40 mt-1">
          Consulta directa a todas las tablas del sistema — Solo lectura
        </p>
      </div>

      {/* Query Builder */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Tabla</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none"
            >
              {TABLES.map(t => (
                <option key={t} value={t} className="bg-[#0a0a1a]">{t}</option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Límite</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              min={1}
              max={500}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleQuery}
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Consultar
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table List */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Table2 className="h-4 w-4 text-white/40" />
          Tablas Disponibles ({TABLES.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {TABLES.map(t => (
            <button
              key={t}
              onClick={() => { setSelectedTable(t); }}
              className={`text-left rounded-md px-2.5 py-1.5 text-xs font-mono transition-colors ${
                selectedTable === t
                  ? "bg-red-500/10 text-red-400 border border-red-500/30"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results !== null && (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/50">
              Tabla: <span className="font-mono text-white/70">{selectedTable}</span>
            </span>
            <span className="text-xs text-white/40">
              {results.length} de {totalCount} registros
            </span>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/30 text-xs">
                Tabla vacía
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#0a0a1a]">
                  <tr className="border-b border-white/10">
                    {Object.keys(results[0]).map(key => (
                      <th key={key} className="px-3 py-2 text-left font-medium text-white/40 uppercase tracking-wider whitespace-nowrap">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03]">
                      {Object.entries(row).map(([key, value]) => (
                        <td key={key} className="px-3 py-1.5 whitespace-nowrap text-white/60 max-w-[200px] truncate" title={String(value ?? "")}>
                          {value === null ? (
                            <span className="text-white/20 italic">null</span>
                          ) : typeof value === "boolean" ? (
                            <span className={value ? "text-green-400" : "text-red-400"}>
                              {value ? "true" : "false"}
                            </span>
                          ) : typeof value === "object" ? (
                            <span className="font-mono text-white/30">{JSON.stringify(value).slice(0, 50)}</span>
                          ) : (
                            String(value)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
