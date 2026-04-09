"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Single CSV Export Button ──────────────────────────────────

interface ExportButtonProps {
  onExport: () => Promise<{ csv?: string; filename?: string; error?: string }>;
  label?: string;
}

export function ExportButton({ onExport, label = "Exportar CSV" }: ExportButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      const result = await onExport();
      if (result.error) {
        alert(result.error);
        return;
      }
      if (result.csv && result.filename) {
        downloadCSV(result.csv, result.filename);
      }
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isPending}>
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {label}
    </Button>
  );
}

// ─── Multi-format Export Menu (CSV + Excel) ────────────────────

interface ExportMenuProps {
  exports: {
    id: string;
    label: string;
    onExport: () => Promise<{ csv?: string; filename?: string; error?: string }>;
  }[];
}

export function ExportMenu({ exports }: ExportMenuProps) {
  const [isPending, startTransition] = useTransition();

  const handleExport = (onExport: () => Promise<{ csv?: string; filename?: string; error?: string }>) => {
    startTransition(async () => {
      const result = await onExport();
      if (result.error) {
        alert(result.error);
      } else if (result.csv && result.filename) {
        downloadCSV(result.csv, result.filename);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {exports.map((exp) => (
          <DropdownMenuItem
            key={exp.id}
            onClick={() => handleExport(exp.onExport)}
            disabled={isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {exp.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── CSV + Excel Dropdown ──────────────────────────────────────

interface DataExportMenuProps {
  csvAction: () => Promise<{ csv?: string; filename?: string; error?: string }>;
  onExcelExport: () => Promise<void>;
  label?: string;
}

export function DataExportMenu({ csvAction, onExcelExport, label = "Exportar" }: DataExportMenuProps) {
  const [isPending, setIsPending] = useState(false);
  const [, startTransition] = useTransition();

  const handleCSV = () => {
    startTransition(async () => {
      setIsPending(true);
      try {
        const result = await csvAction();
        if (result.error) {
          alert(result.error);
        } else if (result.csv && result.filename) {
          downloadCSV(result.csv, result.filename);
        }
      } finally {
        setIsPending(false);
      }
    });
  };

  const handleExcel = async () => {
    setIsPending(true);
    try {
      await onExcelExport();
    } catch {
      alert("Error al generar el archivo Excel");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Formato</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExcel} disabled={isPending}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCSV} disabled={isPending}>
          <FileText className="h-4 w-4 mr-2 text-blue-600" />
          CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Helpers ───────────────────────────────────────────────────

function downloadCSV(content: string, filename: string) {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
