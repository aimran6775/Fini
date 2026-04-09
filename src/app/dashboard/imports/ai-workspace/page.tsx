"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOrg } from "@/components/dashboard/shell";

import type { ImportCategory } from "@/lib/import/schemas";
import {
  getCategoryConfig,
  getEmptyRow,
  autoMapColumns,
  applyColumnMapping,
} from "@/lib/import/schemas";
import {
  validateRows,
  getIssueSummary,
  type ValidationIssue,
} from "@/lib/import/validation";

import { CategorySelect } from "@/components/dashboard/import/category-select";
import { FileUpload } from "@/components/dashboard/import/file-upload";
import { ExtractionProgress } from "@/components/dashboard/import/extraction-progress";
import { ReviewGrid } from "@/components/dashboard/import/review-grid";
import { ValidationPanel } from "@/components/dashboard/import/validation-panel";
import { WorkspaceToolbar } from "@/components/dashboard/import/workspace-toolbar";
import { ExportDrawer } from "@/components/dashboard/import/export-drawer";

// ─── Types ─────────────────────────────────────────────────────

type Step = "category" | "upload" | "processing" | "review" | "result";

interface SaveResult {
  saved: number;
  failed: number;
  errors: string[];
}

// ─── History (Undo/Redo) ───────────────────────────────────────

function useHistory(initial: Record<string, string>[]) {
  const [rows, setRowsInternal] = useState(initial);
  const past = useRef<Record<string, string>[][]>([]);
  const future = useRef<Record<string, string>[][]>([]);

  const setRows = useCallback(
    (newRows: Record<string, string>[] | ((prev: Record<string, string>[]) => Record<string, string>[])) => {
      setRowsInternal((prev) => {
        const next = typeof newRows === "function" ? newRows(prev) : newRows;
        past.current.push(prev);
        future.current = [];
        if (past.current.length > 50) past.current.shift();
        return next;
      });
    },
    []
  );

  const resetRows = useCallback((newRows: Record<string, string>[]) => {
    setRowsInternal(newRows);
    past.current = [];
    future.current = [];
  }, []);

  const undo = useCallback(() => {
    setRowsInternal((current) => {
      const prev = past.current.pop();
      if (!prev) return current;
      future.current.push(current);
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setRowsInternal((current) => {
      const next = future.current.pop();
      if (!next) return current;
      past.current.push(current);
      return next;
    });
  }, []);

  return {
    rows,
    setRows,
    resetRows,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}

// ─── CSV Parser (RFC 4180 — handles quoted fields) ────────────

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };

  const sep = lines[0].includes("\t") ? "\t" : ",";

  function splitRow(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            current += '"';
            i++; // skip escaped quote
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === sep) {
          result.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitRow(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = splitRow(line);
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = values[i] || "";
    });
    return record;
  });

  return { headers, rows };
}

// ─── Main Page ─────────────────────────────────────────────────

export default function AIWorkspacePage() {
  const router = useRouter();
  const { currentOrg } = useOrg();

  // Step state
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<ImportCategory | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Data
  const { rows, setRows, resetRows, undo, redo, canUndo, canRedo } =
    useHistory([]);
  const [editedCells, setEditedCells] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [activeCell, setActiveCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(
    []
  );

  // Processing
  const [extractionStatus, setExtractionStatus] = useState<
    "reading" | "extracting" | "structuring" | "validating" | "done" | "error"
  >("reading");
  const [extractionError, setExtractionError] = useState<string>("");
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0);

  // Save / Export
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(true);

  // Bank account picker (for bank_transaction category)
  const [bankAccounts, setBankAccounts] = useState<{ id: string; bank_name: string; account_number: string }[]>([]);
  const [bankAccountId, setBankAccountId] = useState<string | null>(null);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);

  // Fetch bank accounts when category = bank_transaction
  useEffect(() => {
    if (category === "bank_transaction" && currentOrg?.id) {
      setLoadingBankAccounts(true);
      import("@/app/actions/banking").then(({ getBankAccounts }) =>
        getBankAccounts(currentOrg.id).then((accts) => {
          setBankAccounts(accts || []);
          if (accts && accts.length === 1) setBankAccountId(accts[0].id);
        }).catch(() => setBankAccounts([]))
      ).finally(() => setLoadingBankAccounts(false));
    }
  }, [category, currentOrg?.id]);

  const config = category ? getCategoryConfig(category) : null;
  const columns = config?.columns || [];

  // ── Validation (run on rows change) ──
  useEffect(() => {
    if (step === "review" && category && rows.length > 0) {
      const issues = validateRows(rows, category);
      setValidationIssues(issues);
    }
  }, [rows, step, category]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (step !== "review") return;
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, undo, redo]);

  // ── Step: Category ──
  const handleCategorySelect = (cat: ImportCategory) => {
    setCategory(cat);
    setStep("upload");
  };

  // ── Step: File Upload Handlers ──

  // Structured file (Excel) — skip AI
  const handleExcelParsed = useCallback(
    (headers: string[], rawRows: Record<string, string>[], name: string) => {
      if (!category) return;
      setFileName(name);
      const mapping = autoMapColumns(headers, category);
      const mapped = applyColumnMapping(rawRows, mapping);
      resetRows(mapped);
      setEditedCells(new Set());
      setSelectedRows(new Set());
      setConfidence(1);
      setAiWarnings([]);
      setStep("review");
    },
    [category, resetRows]
  );

  // CSV/text file — check if structured
  const handleFileContent = useCallback(
    (content: string, name: string) => {
      if (!category) return;
      setFileName(name);

      // Try CSV parse first
      if (name.endsWith(".csv") || name.endsWith(".tsv") || content.includes("\t")) {
        const { headers, rows: csvRows } = parseCSV(content);
        if (headers.length > 1 && csvRows.length > 0) {
          const mapping = autoMapColumns(headers, category);
          const mapped = applyColumnMapping(csvRows, mapping);
          resetRows(mapped);
          setEditedCells(new Set());
          setSelectedRows(new Set());
          setConfidence(1);
          setAiWarnings([]);
          setStep("review");
          return;
        }
      }

      // Not structured — use AI extraction
      runAIExtraction(content);
    },
    [category, resetRows]
  );

  // Text paste — always use AI
  const handleTextPaste = useCallback(
    (text: string) => {
      setFileName(null);
      runAIExtraction(text);
    },
    [category]
  );

  // ── AI Extraction ──
  const runAIExtraction = async (content: string) => {
    if (!category) return;
    setStep("processing");
    setExtractionStatus("reading");
    setExtractionError("");

    try {
      await sleep(300);
      setExtractionStatus("extracting");

      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, content }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setExtractionStatus("error");
        setExtractionError(data.error || "Error desconocido");
        return;
      }

      setExtractionStatus("structuring");
      await sleep(200);

      const extractedRows: Record<string, string>[] = data.rows || [];
      setConfidence(data.confidence || 0);
      setAiWarnings(data.warnings || []);

      setExtractionStatus("validating");
      await sleep(200);

      resetRows(extractedRows);
      setEditedCells(new Set());
      setSelectedRows(new Set());

      setExtractionStatus("done");

      // Transition to review after brief pause
      await sleep(800);
      setStep("review");
    } catch (err) {
      setExtractionStatus("error");
      setExtractionError(
        err instanceof Error ? err.message : "Error de conexión"
      );
    }
  };

  // ── Grid Handlers ──
  const handleCellChange = useCallback(
    (rowIndex: number, field: string, value: string) => {
      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex] = { ...updated[rowIndex], [field]: value };
        return updated;
      });
      setEditedCells((prev) => {
        const next = new Set(prev);
        next.add(`${rowIndex}-${field}`);
        return next;
      });
    },
    [setRows]
  );

  const handleAddRow = useCallback(() => {
    if (!category) return;
    setRows((prev) => [...prev, getEmptyRow(category)]);
  }, [category, setRows]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.size === 0) return;
    setRows((prev) => prev.filter((_, i) => !selectedRows.has(i)));
    setSelectedRows(new Set());
  }, [selectedRows, setRows]);

  const handleDuplicateSelected = useCallback(() => {
    if (selectedRows.size !== 1) return;
    const idx = Array.from(selectedRows)[0];
    setRows((prev) => {
      const copy = { ...prev[idx] };
      const updated = [...prev];
      updated.splice(idx + 1, 0, copy);
      return updated;
    });
  }, [selectedRows, setRows]);

  const handleValidate = useCallback(() => {
    if (!category) return;
    const issues = validateRows(rows, category);
    setValidationIssues(issues);
    setShowValidation(true);
  }, [rows, category]);

  const handleJumpToCell = useCallback(
    (row: number, field: string) => {
      const colIdx = columns.findIndex((c) => c.key === field);
      if (colIdx >= 0) setActiveCell({ row, col: colIdx });
    },
    [columns]
  );

  const handleApplySuggestion = useCallback(
    (row: number, field: string, value: string) => {
      handleCellChange(row, field, value);
    },
    [handleCellChange]
  );

  // ── Save ──
  const handleSave = async () => {
    if (!category || rows.length === 0) return;
    if (category === "bank_transaction" && !bankAccountId) return;
    setSaving(true);

    try {
      const { bulkSaveImport } = await import("@/app/actions/import");

      const orgId = currentOrg?.id;
      if (!orgId) {
        setSaveResult({
          saved: 0,
          failed: rows.length,
          errors: ["No se encontró la organización activa"],
        });
        setStep("result");
        setSaving(false);
        return;
      }

      const result = await bulkSaveImport(orgId, category, rows, bankAccountId || undefined);
      setSaveResult(result);
      setStep("result");
    } catch (err) {
      setSaveResult({
        saved: 0,
        failed: rows.length,
        errors: [err instanceof Error ? err.message : "Error al guardar"],
      });
      setStep("result");
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ──
  const handleBack = () => {
    switch (step) {
      case "upload":
        setStep("category");
        break;
      case "processing":
        setStep("upload");
        break;
      case "review":
        setStep("upload");
        break;
      case "result":
        setStep("review");
        break;
    }
  };

  const handleStartOver = () => {
    setStep("category");
    setCategory(null);
    resetRows([]);
    setEditedCells(new Set());
    setSelectedRows(new Set());
    setActiveCell(null);
    setValidationIssues([]);
    setSaveResult(null);
    setFileName(null);
    setAiWarnings([]);
    setConfidence(0);
    setBankAccountId(null);
  };

  const summary = getIssueSummary(validationIssues);

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {step !== "category" && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="page-header">
            <h1 className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Importar con IA
            </h1>
            <p>
              {step === "category" && "Extrae datos de archivos y texto con inteligencia artificial"}
              {step === "upload" && config && `Sube un archivo o pega texto de ${config.label}`}
              {step === "processing" && "Procesando contenido con IA..."}
              {step === "review" && `${rows.length} registros — revisa y edita antes de guardar`}
              {step === "result" && "Resultado de la importación"}
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
          {["Tipo", "Fuente", "Extracción", "Revisión", "Listo"].map(
            (label, i) => {
              const stepOrder: Step[] = [
                "category",
                "upload",
                "processing",
                "review",
                "result",
              ];
              const isActive = stepOrder.indexOf(step) >= i;
              return (
                <span key={label} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
                  )}
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground/50"
                    )}
                  >
                    {label}
                  </span>
                </span>
              );
            }
          )}
        </div>
      </div>

      {/* Step: Category Selection */}
      {step === "category" && (
        <CategorySelect onSelect={handleCategorySelect} />
      )}

      {/* Step: Upload/Paste */}
      {step === "upload" && category && (
        <FileUpload
          category={config!.label}
          onFileContent={handleFileContent}
          onExcelParsed={handleExcelParsed}
          onTextPaste={handleTextPaste}
        />
      )}

      {/* Step: Processing */}
      {step === "processing" && (
        <div className="max-w-md mx-auto">
          <ExtractionProgress
            status={extractionStatus}
            error={extractionError}
            rowCount={rows.length}
          />
          {extractionStatus === "error" && (
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button onClick={() => handleStartOver()}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reiniciar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step: Review */}
      {step === "review" && config && (
        <>
          {/* Confidence badge + Bank account picker row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* AI Confidence Badge */}
            {confidence > 0 && (
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border",
                  confidence >= 0.85
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : confidence >= 0.6
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    : "border-red-500/30 bg-red-500/10 text-red-400"
                )}
              >
                <Sparkles className="h-3 w-3" />
                Confianza IA: {Math.round(confidence * 100)}%
              </div>
            )}

            {/* Bank Account Picker (only for bank_transaction) */}
            {category === "bank_transaction" && (
              <div className="flex items-center gap-2 ml-auto">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Cuenta destino:</span>
                {loadingBankAccounts ? (
                  <span className="text-xs text-muted-foreground animate-pulse">Cargando cuentas…</span>
                ) : bankAccounts.length === 0 ? (
                  <span className="text-xs text-red-400">No hay cuentas bancarias — créala primero</span>
                ) : (
                  <select
                    value={bankAccountId || ""}
                    onChange={(e) => setBankAccountId(e.target.value || null)}
                    className="rounded-lg border border-border/50 bg-card px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Seleccionar cuenta…</option>
                    {bankAccounts.map((acct) => (
                      <option key={acct.id} value={acct.id}>
                        {acct.bank_name} — {acct.account_number}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* AI Warnings */}
          {aiWarnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="flex items-start gap-2 text-sm text-amber-400">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium mb-1">Notas de la extracción:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-300/80">
                    {aiWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <WorkspaceToolbar
            selectedCount={selectedRows.size}
            totalRows={rows.length}
            errorCount={summary.errors}
            warningCount={summary.warnings}
            canUndo={canUndo}
            canRedo={canRedo}
            onAddRow={handleAddRow}
            onDeleteSelected={handleDeleteSelected}
            onDuplicateSelected={handleDuplicateSelected}
            onUndo={undo}
            onRedo={redo}
            onValidate={handleValidate}
            onSave={handleSave}
            onExport={() => setExportOpen(true)}
          />

          {/* Grid + Validation Panel */}
          <div className="flex gap-4">
            {/* Grid */}
            <div className="flex-1 min-w-0">
              <ReviewGrid
                columns={columns}
                rows={rows}
                editedCells={editedCells}
                selectedRows={selectedRows}
                validationIssues={validationIssues}
                activeCell={activeCell}
                onCellChange={handleCellChange}
                onSetActiveCell={setActiveCell}
                onToggleRow={(i) => {
                  setSelectedRows((prev) => {
                    const next = new Set(prev);
                    next.has(i) ? next.delete(i) : next.add(i);
                    return next;
                  });
                }}
                onSelectAll={(all) => {
                  setSelectedRows(
                    all
                      ? new Set(rows.map((_, i) => i))
                      : new Set()
                  );
                }}
              />
            </div>

            {/* Validation Sidebar */}
            {showValidation && (
              <div className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-4 rounded-xl border border-border/50 bg-card p-4 dark:ring-1 dark:ring-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Validación</h3>
                    <button
                      onClick={() => setShowValidation(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Ocultar
                    </button>
                  </div>
                  <ValidationPanel
                    issues={validationIssues}
                    onJumpToCell={handleJumpToCell}
                    onApplySuggestion={handleApplySuggestion}
                  />
                </div>
              </div>
            )}

            {!showValidation && (
              <button
                onClick={() => setShowValidation(true)}
                className="hidden lg:flex items-center justify-center w-8 shrink-0 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors"
                title="Mostrar validación"
              >
                <span className="[writing-mode:vertical-rl] text-[11px] text-muted-foreground font-medium tracking-wide">
                  Validación
                </span>
              </button>
            )}
          </div>

          {/* Saving overlay */}
          {saving && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
                <div className="h-8 w-8 mx-auto mb-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="font-medium">Guardando {rows.length} registros…</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Esto puede tardar unos segundos
                </p>
              </div>
            </div>
          )}

          {/* Export Drawer */}
          <ExportDrawer
            open={exportOpen}
            onClose={() => setExportOpen(false)}
            columns={columns}
            rows={rows}
            validationIssues={validationIssues}
            selectedRows={selectedRows}
            categoryLabel={config.label}
          />
        </>
      )}

      {/* Step: Result */}
      {step === "result" && saveResult && config && (
        <div className="max-w-md mx-auto space-y-6 py-8">
          <div className="text-center space-y-3">
            {saveResult.saved > 0 && (
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
                <span className="text-xl font-semibold">
                  {saveResult.saved} registros guardados
                </span>
              </div>
            )}
            {saveResult.failed > 0 && (
              <div className="flex items-center justify-center gap-2 text-red-400">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">
                  {saveResult.failed} registros fallidos
                </span>
              </div>
            )}
          </div>

          {/* Error details */}
          {saveResult.errors.length > 0 && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 max-h-40 overflow-y-auto">
              <p className="text-xs font-medium text-red-400 mb-2">
                Detalles de errores:
              </p>
              <ul className="space-y-1">
                {saveResult.errors.map((err, i) => (
                  <li key={i} className="text-xs text-red-300/80">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {saveResult.saved > 0 && (
              <Button
                className="w-full"
                onClick={() => router.push(config.destinationPath)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver en {config.destination}
              </Button>
            )}
            {saveResult.failed > 0 && (
              <Button variant="outline" className="w-full" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a editar
              </Button>
            )}
            <Button variant="ghost" className="w-full" onClick={handleStartOver}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Nueva importación
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Utility ───────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
