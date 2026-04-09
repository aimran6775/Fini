"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, ClipboardPaste, X, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
  onExcelParsed: (
    headers: string[],
    rows: Record<string, string>[],
    fileName: string
  ) => void;
  onTextPaste: (text: string) => void;
  category: string;
}

const SUPPORTED_TEXT = [".txt", ".csv", ".tsv", ".json", ".xml"];
const SUPPORTED_EXCEL = [".xlsx", ".xls"];

/** Resolve ExcelJS cell values (formula, richText, hyperlink, Date, etc.) to plain strings */
function resolveCellValue(val: unknown): string {
  if (val == null) return "";
  if (val instanceof Date) return val.toISOString().split("T")[0];
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    // Formula result: { formula: '...', result: 42 }
    if ("result" in obj && obj.result != null) return resolveCellValue(obj.result);
    // Rich text: { richText: [{ text: '...' }, ...] }
    if ("richText" in obj && Array.isArray(obj.richText)) {
      return (obj.richText as { text?: string }[]).map((r) => r.text ?? "").join("");
    }
    // Hyperlink: { text: '...', hyperlink: '...' }
    if ("text" in obj && typeof obj.text === "string") return obj.text;
    return String(val);
  }
  return String(val).trim();
}

export function FileUpload({
  onFileContent,
  onExcelParsed,
  onTextPaste,
  category,
}: FileUploadProps) {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [pasteText, setPasteText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Enforce 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        setError("El archivo excede el límite de 10MB");
        return;
      }

      const ext = "." + file.name.split(".").pop()?.toLowerCase();

      // Excel files — parse with ExcelJS on client
      if (SUPPORTED_EXCEL.includes(ext)) {
        try {
          const buffer = await file.arrayBuffer();
          const ExcelJS = (await import("exceljs")).default;
          const wb = new ExcelJS.Workbook();
          await wb.xlsx.load(buffer);
          const sheet = wb.getWorksheet(1);
          if (!sheet || sheet.rowCount < 2) {
            setError("El archivo Excel está vacío o no tiene datos");
            return;
          }

          const headers: string[] = [];
          sheet.getRow(1).eachCell((cell) => {
            headers.push(String(cell.value ?? "").trim());
          });

          const rows: Record<string, string>[] = [];
          sheet.eachRow((row, num) => {
            if (num === 1) return;
            const record: Record<string, string> = {};
            row.eachCell((cell, colNum) => {
              const key = headers[colNum - 1] || `col_${colNum}`;
              const val = resolveCellValue(cell.value);
              record[key] = val;
            });
            if (Object.values(record).some((v) => v !== "")) {
              rows.push(record);
            }
          });

          setSelectedFile(file.name);
          onExcelParsed(headers, rows, file.name);
        } catch {
          setError("No se pudo leer el archivo Excel");
        }
        return;
      }

      // Text-based files
      if (SUPPORTED_TEXT.includes(ext) || file.type.startsWith("text/")) {
        const text = await file.text();
        if (!text.trim()) {
          setError("El archivo está vacío");
          return;
        }
        setSelectedFile(file.name);
        onFileContent(text, file.name);
        return;
      }

      // Try reading as text anyway
      try {
        const text = await file.text();
        if (text.trim()) {
          setSelectedFile(file.name);
          onFileContent(text, file.name);
          return;
        }
      } catch {
        // ignore
      }

      setError(
        "Formato no soportado. Usa archivos .xlsx, .csv, .txt o pega el texto directamente."
      );
    },
    [onFileContent, onExcelParsed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return;
    onTextPaste(pasteText.trim());
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-1 rounded-lg bg-muted/50 p-1">
        <button
          onClick={() => setMode("upload")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            mode === "upload"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="h-4 w-4" />
          Subir archivo
        </button>
        <button
          onClick={() => setMode("paste")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            mode === "paste"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ClipboardPaste className="h-4 w-4" />
          Pegar texto
        </button>
      </div>

      {/* Upload Mode */}
      {mode === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 cursor-pointer transition-all",
            dragActive
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border/50 hover:border-border hover:bg-accent/30",
            selectedFile && "border-emerald-500/50 bg-emerald-500/5"
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv,.tsv,.txt,.json,.xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {selectedFile ? (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <FileSpreadsheet className="h-7 w-7 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="font-medium">{selectedFile}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Archivo cargado correctamente
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setError(null);
                }}
              >
                <X className="h-4 w-4 mr-1" /> Cambiar archivo
              </Button>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Upload className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">
                  Arrastra un archivo aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Soporta .xlsx, .csv, .txt — máx 10MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Paste Mode */}
      {mode === "paste" && (
        <div className="space-y-4">
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Pega aquí el contenido de tus ${category}s...\n\nEjemplo:\nFactura #001, 15/01/2025, Cliente ABC, NIT 12345678, Total Q1,500.00\nFactura #002, 20/01/2025, Cliente XYZ, NIT 87654321, Total Q2,300.50`}
              className={cn(
                "w-full min-h-[240px] rounded-xl border border-border/50 bg-card px-4 py-3 pl-10 text-sm",
                "placeholder:text-muted-foreground/50 resize-none",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              )}
            />
            {pasteText && (
              <span className="absolute right-3 bottom-3 text-[11px] text-muted-foreground tabular-nums">
                {pasteText.length.toLocaleString()} caracteres
              </span>
            )}
          </div>
          <Button
            onClick={handlePasteSubmit}
            disabled={!pasteText.trim()}
            className="w-full"
          >
            Extraer datos con IA
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
