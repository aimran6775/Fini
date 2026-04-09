"use client";

import { DataExportMenu } from "@/components/dashboard/export-button";
import { exportJournalToCSV } from "@/app/actions/export";
import { exportJournalToExcel } from "@/lib/excel/export-excel";

interface JournalExportProps {
  orgId: string;
  orgName: string;
  entries: any[];
  filters?: { dateFrom?: string; dateTo?: string };
}

export function JournalExportButton({ orgId, orgName, entries, filters }: JournalExportProps) {
  return (
    <DataExportMenu
      label="Exportar"
      csvAction={() => exportJournalToCSV(orgId, filters)}
      onExcelExport={() => {
        // Flatten journal entries into rows
        const rows = entries.flatMap((entry: any) =>
          (entry.lines || []).map((line: any) => ({
            entry_date: entry.entry_date,
            reference_number: entry.reference_number,
            description: entry.description,
            account_code: line.account?.account_code || "",
            account_name: line.account?.account_name || "",
            line_description: line.description,
            debit: line.debit,
            credit: line.credit,
            status: entry.status,
          }))
        );
        return exportJournalToExcel(rows, orgName);
      }}
    />
  );
}
