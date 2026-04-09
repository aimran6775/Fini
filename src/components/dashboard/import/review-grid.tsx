"use client";

import { useRef, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@/lib/import/schemas";
import type { ValidationIssue } from "@/lib/import/validation";

interface ReviewGridProps {
  columns: ColumnDef[];
  rows: Record<string, string>[];
  editedCells: Set<string>;
  selectedRows: Set<number>;
  validationIssues: ValidationIssue[];
  activeCell: { row: number; col: number } | null;
  onCellChange: (rowIndex: number, field: string, value: string) => void;
  onSetActiveCell: (cell: { row: number; col: number } | null) => void;
  onToggleRow: (rowIndex: number) => void;
  onSelectAll: (selected: boolean) => void;
}

export function ReviewGrid({
  columns,
  rows,
  editedCells,
  selectedRows,
  validationIssues,
  activeCell,
  onCellChange,
  onSetActiveCell,
  onToggleRow,
  onSelectAll,
}: ReviewGridProps) {
  const inputRefs = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(
    new Map()
  );

  // Index issues by "row-field" for fast lookup
  const issueMap = useMemo(() => {
    const map = new Map<string, ValidationIssue>();
    for (const issue of validationIssues) {
      const key = `${issue.row}-${issue.field}`;
      const existing = map.get(key);
      // Keep the most severe
      if (!existing || (issue.severity === "error" && existing.severity === "warning")) {
        map.set(key, issue);
      }
    }
    return map;
  }, [validationIssues]);

  const focusCell = useCallback(
    (row: number, col: number) => {
      const ref = inputRefs.current.get(`${row}-${col}`);
      ref?.focus();
      onSetActiveCell({ row, col });
    },
    [onSetActiveCell]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          // Previous cell
          if (colIndex > 0) focusCell(rowIndex, colIndex - 1);
          else if (rowIndex > 0) focusCell(rowIndex - 1, columns.length - 1);
        } else {
          // Next cell
          if (colIndex < columns.length - 1) focusCell(rowIndex, colIndex + 1);
          else if (rowIndex < rows.length - 1) focusCell(rowIndex + 1, 0);
        }
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (rowIndex < rows.length - 1) focusCell(rowIndex + 1, colIndex);
      } else if (e.key === "Escape") {
        (e.target as HTMLElement).blur();
        onSetActiveCell(null);
      } else if (e.key === "ArrowDown" && e.altKey) {
        e.preventDefault();
        if (rowIndex < rows.length - 1) focusCell(rowIndex + 1, colIndex);
      } else if (e.key === "ArrowUp" && e.altKey) {
        e.preventDefault();
        if (rowIndex > 0) focusCell(rowIndex - 1, colIndex);
      }
    },
    [columns.length, rows.length, focusCell, onSetActiveCell]
  );

  // Handle paste of tab-separated data (e.g. from Excel)
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const text = e.clipboardData?.getData("text/plain");
      if (!text || !activeCell) return;

      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length <= 1 && !text.includes("\t")) return; // single value, normal paste

      e.preventDefault();
      const pastedRows = lines.map((line) => line.split("\t"));

      for (let ri = 0; ri < pastedRows.length; ri++) {
        const targetRow = activeCell.row + ri;
        if (targetRow >= rows.length) break;

        for (let ci = 0; ci < pastedRows[ri].length; ci++) {
          const targetCol = activeCell.col + ci;
          if (targetCol >= columns.length) break;
          onCellChange(targetRow, columns[targetCol].key, pastedRows[ri][ci].trim());
        }
      }
    },
    [activeCell, rows.length, columns, onCellChange]
  );

  const allSelected = rows.length > 0 && selectedRows.size === rows.length;

  return (
    <div
      className="overflow-auto rounded-xl border border-border/50 dark:ring-1 dark:ring-white/[0.06]"
      onPaste={handlePaste}
    >
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
          <tr>
            {/* Checkbox column */}
            <th className="w-10 border-b border-border/40 px-2 py-2.5 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border accent-primary"
              />
            </th>
            {/* Row number */}
            <th className="w-10 border-b border-border/40 px-2 py-2.5 text-center text-[11px] font-medium text-muted-foreground">
              #
            </th>
            {/* Data columns */}
            {columns.map((col) => (
              <th
                key={col.key}
                className="border-b border-border/40 px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                style={{ minWidth: col.width }}
              >
                {col.label}
                {col.required && (
                  <span className="ml-0.5 text-red-400">*</span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, ri) => {
            const rowHasError = validationIssues.some(
              (i) => i.row === ri && i.severity === "error"
            );
            const rowHasWarning =
              !rowHasError &&
              validationIssues.some(
                (i) => i.row === ri && i.severity === "warning"
              );
            const isSelected = selectedRows.has(ri);

            return (
              <tr
                key={ri}
                className={cn(
                  "group transition-colors",
                  ri % 2 === 0 ? "bg-card" : "bg-card/50",
                  isSelected && "!bg-primary/5",
                  rowHasError && "!bg-red-500/[0.03]",
                  rowHasWarning && "!bg-amber-500/[0.03]"
                )}
              >
                <td className="border-b border-border/20 px-2 py-0 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleRow(ri)}
                    className="h-3.5 w-3.5 rounded border-border accent-primary"
                  />
                </td>
                <td className="border-b border-border/20 px-2 py-0 text-center text-[11px] text-muted-foreground/60 tabular-nums">
                  {ri + 1}
                </td>
                {columns.map((col, ci) => {
                  const cellKey = `${ri}-${col.key}`;
                  const issue = issueMap.get(cellKey);
                  const isEdited = editedCells.has(cellKey);
                  const isActive =
                    activeCell?.row === ri && activeCell?.col === ci;

                  return (
                    <td
                      key={col.key}
                      className={cn(
                        "border-b border-border/20 px-0 py-0 relative",
                        issue?.severity === "error" &&
                          "ring-1 ring-inset ring-red-500/40",
                        issue?.severity === "warning" &&
                          !issue &&
                          "ring-1 ring-inset ring-amber-500/40",
                        isEdited && "bg-blue-500/[0.04]",
                        isActive && "ring-2 ring-inset ring-primary"
                      )}
                      title={issue?.message}
                    >
                      {col.type === "select" && col.options ? (
                        <select
                          ref={(el) => {
                            if (el) inputRefs.current.set(`${ri}-${ci}`, el);
                          }}
                          value={row[col.key] || ""}
                          onChange={(e) =>
                            onCellChange(ri, col.key, e.target.value)
                          }
                          onFocus={() => onSetActiveCell({ row: ri, col: ci })}
                          onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                          className="w-full bg-transparent px-2 py-1.5 text-sm outline-none cursor-pointer"
                        >
                          <option value="">—</option>
                          {col.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          ref={(el) => {
                            if (el) inputRefs.current.set(`${ri}-${ci}`, el);
                          }}
                          type={
                            col.type === "currency" || col.type === "number"
                              ? "text"
                              : col.type === "date"
                                ? "date"
                                : "text"
                          }
                          value={row[col.key] || ""}
                          onChange={(e) =>
                            onCellChange(ri, col.key, e.target.value)
                          }
                          onFocus={() => onSetActiveCell({ row: ri, col: ci })}
                          onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                          className={cn(
                            "w-full bg-transparent px-2 py-1.5 text-sm outline-none",
                            (col.type === "currency" || col.type === "number") &&
                              "text-right tabular-nums"
                          )}
                          inputMode={
                            col.type === "currency" || col.type === "number"
                              ? "decimal"
                              : undefined
                          }
                        />
                      )}
                      {/* Issue indicator dot */}
                      {issue && (
                        <div
                          className={cn(
                            "absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full",
                            issue.severity === "error"
                              ? "bg-red-500"
                              : "bg-amber-500"
                          )}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 2}
                className="py-12 text-center text-muted-foreground"
              >
                No hay filas. Haz clic en &quot;Agregar fila&quot; para comenzar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
