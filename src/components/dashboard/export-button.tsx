"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <Spinner size="sm" />
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}

interface ExportMenuProps {
  exports: {
    id: string;
    label: string;
    onExport: () => Promise<{ csv?: string; filename?: string; error?: string }>;
  }[];
}

export function ExportMenu({ exports }: ExportMenuProps) {
  const [isPending, startTransition] = useTransition();
  const [currentExport, setCurrentExport] = useState<string | null>(null);

  const handleExport = (exportId: string, onExport: () => Promise<{ csv?: string; filename?: string; error?: string }>) => {
    setCurrentExport(exportId);
    startTransition(async () => {
      const result = await onExport();
      if (result.error) {
        alert(result.error);
      } else if (result.csv && result.filename) {
        downloadCSV(result.csv, result.filename);
      }
      setCurrentExport(null);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          {isPending ? (
            <Spinner size="sm" />
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {exports.map((exp) => (
          <DropdownMenuItem
            key={exp.id}
            onClick={() => handleExport(exp.id, exp.onExport)}
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
