"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Table2, ShieldCheck, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@/lib/import/schemas";
import type { ValidationIssue } from "@/lib/import/validation";

interface ExportDrawerProps {
  open: boolean;
  onClose: () => void;
  columns: ColumnDef[];
  rows: Record<string, string>[];
  validationIssues: ValidationIssue[];
  selectedRows: Set<number>;
  categoryLabel: string;
}

type ExportScope = "all" | "selected" | "valid" | "errors";

interface ExportOptions {
  scope: ExportScope;
  includeValidation: boolean;
  includeMetadata: boolean;
  freezeHeader: boolean;
}

export function ExportDrawer({
  open,
  onClose,
  columns,
  rows,
  validationIssues,
  selectedRows,
  categoryLabel,
}: ExportDrawerProps) {
  const [options, setOptions] = useState<ExportOptions>({
    scope: "all",
    includeValidation: false,
    includeMetadata: false,
    freezeHeader: true,
  });
  const [exporting, setExporting] = useState(false);

  const getFilteredRows = (): Record<string, string>[] => {
    switch (options.scope) {
      case "selected":
        return rows.filter((_, i) => selectedRows.has(i));
      case "valid":
        return rows.filter(
          (_, i) => !validationIssues.some((v) => v.row === i && v.severity === "error")
        );
      case "errors":
        return rows.filter((_, i) =>
          validationIssues.some((v) => v.row === i && v.severity === "error")
        );
      default:
        return rows;
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const { saveAs } = await import("file-saver");
      const wb = new ExcelJS.Workbook();
      wb.creator = "FiniTax Guatemala";
      wb.created = new Date();

      // ── Main data sheet ──
      const ws = wb.addWorksheet("Datos");
      const filteredRows = getFilteredRows();

      // Header row
      const headerRow = ws.addRow(columns.map((c) => c.label));
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1A1F25" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          bottom: { style: "thin", color: { argb: "FF3A3F45" } },
        };
      });

      // Data rows
      for (const row of filteredRows) {
        const cells = columns.map((col) => {
          const val = row[col.key] || "";
          if (col.type === "currency" || col.type === "number") {
            const num = parseFloat(val);
            return isNaN(num) ? val : num;
          }
          return val;
        });
        ws.addRow(cells);
      }

      // Column widths
      columns.forEach((col, i) => {
        const wsCol = ws.getColumn(i + 1);
        wsCol.width = Math.max(col.width / 7, 12);
        if (col.type === "currency") {
          wsCol.numFmt = '#,##0.00';
        }
      });

      // Freeze header
      if (options.freezeHeader) {
        ws.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
      }

      // ── Validation sheet ──
      if (options.includeValidation && validationIssues.length > 0) {
        const vsWs = wb.addWorksheet("Validación");
        const vHeader = vsWs.addRow(["Fila", "Campo", "Severidad", "Mensaje", "Sugerencia"]);
        vHeader.eachCell((cell) => {
          cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF8B0000" },
          };
        });
        for (const issue of validationIssues) {
          vsWs.addRow([
            issue.row + 1,
            issue.field,
            issue.severity === "error" ? "Error" : "Advertencia",
            issue.message,
            issue.suggestion || "",
          ]);
        }
        vsWs.getColumn(1).width = 8;
        vsWs.getColumn(2).width = 18;
        vsWs.getColumn(3).width = 14;
        vsWs.getColumn(4).width = 40;
        vsWs.getColumn(5).width = 20;
      }

      // ── Metadata sheet ──
      if (options.includeMetadata) {
        const mWs = wb.addWorksheet("Info");
        mWs.addRow(["Propiedad", "Valor"]);
        mWs.addRow(["Categoría", categoryLabel]);
        mWs.addRow(["Filas exportadas", filteredRows.length]);
        mWs.addRow(["Total filas", rows.length]);
        mWs.addRow(["Errores", validationIssues.filter((i) => i.severity === "error").length]);
        mWs.addRow(["Advertencias", validationIssues.filter((i) => i.severity === "warning").length]);
        mWs.addRow(["Exportado", new Date().toLocaleString("es-GT")]);
        mWs.addRow(["Sistema", "FiniTax Guatemala"]);
        mWs.getColumn(1).width = 20;
        mWs.getColumn(2).width = 30;
        mWs.getRow(1).font = { bold: true };
      }

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const timestamp = new Date().toISOString().split("T")[0];
      saveAs(blob, `FiniTax_Import_${categoryLabel}_${timestamp}.xlsx`);
      onClose();
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  if (!open) return null;

  const scopeOptions: { value: ExportScope; label: string; count: number }[] = [
    { value: "all", label: "Todas las filas", count: rows.length },
    { value: "selected", label: "Seleccionadas", count: selectedRows.size },
    {
      value: "valid",
      label: "Solo válidas",
      count: rows.filter(
        (_, i) => !validationIssues.some((v) => v.row === i && v.severity === "error")
      ).length,
    },
    {
      value: "errors",
      label: "Solo con errores",
      count: rows.filter((_, i) =>
        validationIssues.some((v) => v.row === i && v.severity === "error")
      ).length,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold">Exportar a Excel</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scope */}
        <div className="space-y-3 mb-5">
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
            Alcance
          </label>
          <div className="grid grid-cols-2 gap-2">
            {scopeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOptions((o) => ({ ...o, scope: opt.value }))}
                disabled={opt.count === 0}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all",
                  options.scope === opt.value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border/40 text-muted-foreground hover:border-border",
                  opt.count === 0 && "opacity-40 cursor-not-allowed"
                )}
              >
                <span>{opt.label}</span>
                <span className="text-xs tabular-nums">{opt.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
            Opciones
          </label>
          <div className="space-y-2">
            {[
              {
                key: "freezeHeader" as const,
                label: "Congelar fila de encabezados",
                icon: Table2,
              },
              {
                key: "includeValidation" as const,
                label: "Incluir hoja de validación",
                icon: ShieldCheck,
              },
              {
                key: "includeMetadata" as const,
                label: "Incluir hoja de información",
                icon: Info,
              },
            ].map(({ key, label, icon: Icon }) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2.5 cursor-pointer hover:bg-accent/30 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={(e) =>
                    setOptions((o) => ({ ...o, [key]: e.target.checked }))
                  }
                  className="h-3.5 w-3.5 rounded border-border accent-primary"
                />
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exportando…" : "Descargar .xlsx"}
          </Button>
        </div>
      </div>
    </div>
  );
}
