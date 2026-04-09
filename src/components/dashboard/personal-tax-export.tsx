"use client";

import { DataExportMenu } from "@/components/dashboard/export-button";
import { exportPersonalTaxToCSV } from "@/app/actions/export";
import { exportPersonalTaxToExcel } from "@/lib/excel/export-excel";

interface PersonalTaxExportProps {
  orgId: string;
  orgName: string;
  year: number;
  incomes: any[];
  deductions: any[];
  retenciones: any[];
}

export function PersonalTaxExportButton({ orgId, orgName, year, incomes, deductions, retenciones }: PersonalTaxExportProps) {
  return (
    <DataExportMenu
      label="Exportar"
      csvAction={() => exportPersonalTaxToCSV(orgId, year)}
      onExcelExport={() =>
        exportPersonalTaxToExcel(
          {
            income: incomes.map((i: any) => ({
              income_date: i.income_date,
              income_type: i.income_type,
              description: i.description || "",
              gross_amount: i.gross_amount,
              isr_withheld: i.isr_withheld || 0,
            })),
            deductions: deductions.map((d: any) => ({
              date: d.date,
              deduction_type: d.deduction_type,
              description: d.description || "",
              amount: d.amount,
            })),
            retenciones: retenciones.map((r: any) => ({
              date: r.date,
              agent_name: r.agent_name || "",
              agent_nit: r.agent_nit || "",
              amount: r.amount,
            })),
          },
          year,
          orgName
        )
      }
    />
  );
}
