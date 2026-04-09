"use client";

import {
  Plus,
  Trash2,
  Copy,
  Undo2,
  Redo2,
  Save,
  Download,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceToolbarProps {
  selectedCount: number;
  totalRows: number;
  errorCount: number;
  warningCount: number;
  canUndo: boolean;
  canRedo: boolean;
  onAddRow: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onValidate: () => void;
  onSave: () => void;
  onExport: () => void;
}

export function WorkspaceToolbar({
  selectedCount,
  totalRows,
  errorCount,
  warningCount,
  canUndo,
  canRedo,
  onAddRow,
  onDeleteSelected,
  onDuplicateSelected,
  onUndo,
  onRedo,
  onValidate,
  onSave,
  onExport,
}: WorkspaceToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm px-3 py-2">
      {/* Left: row actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onAddRow} title="Agregar fila">
          <Plus className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Fila</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDuplicateSelected}
          disabled={selectedCount !== 1}
          title="Duplicar fila seleccionada"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
          title="Eliminar seleccionadas"
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          {selectedCount > 0 && (
            <span className="ml-1 text-xs">{selectedCount}</span>
          )}
        </Button>

        <div className="mx-1 h-5 w-px bg-border/40" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Deshacer (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="Rehacer (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Center: status */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
        <span>{totalRows} filas</span>
        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-red-400">
            <XCircle className="h-3.5 w-3.5" />
            {errorCount}
          </span>
        )}
        {warningCount > 0 && (
          <span className="flex items-center gap-1 text-amber-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            {warningCount}
          </span>
        )}
        {errorCount === 0 && warningCount === 0 && totalRows > 0 && (
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Válido
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onValidate} title="Validar todo">
          <ShieldCheck className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Validar</span>
        </Button>
        <Button variant="outline" size="sm" onClick={onExport} title="Exportar a Excel">
          <Download className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Excel</span>
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={totalRows === 0}
          title="Guardar en sistema"
        >
          <Save className="h-4 w-4 mr-1" />
          Guardar
        </Button>
      </div>
    </div>
  );
}
