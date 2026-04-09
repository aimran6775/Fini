"use client";

import { DataExportMenu } from "@/components/dashboard/export-button";
import { exportExpensesToCSV } from "@/app/actions/export";
import { exportExpensesToExcel } from "@/lib/excel/export-excel";

interface ExpenseExportProps {
  orgId: string;
  orgName: string;
  expenses: any[];
  filters?: { dateFrom?: string; dateTo?: string; status?: string };
}

export function ExpenseExportButton({ orgId, orgName, expenses, filters }: ExpenseExportProps) {
  return (
    <DataExportMenu
      label="Exportar"
      csvAction={() => exportExpensesToCSV(orgId, filters)}
      onExcelExport={() =>
        exportExpensesToExcel(
          expenses.map((exp: any) => ({
            expense_date: exp.expense_date,
            description: exp.description,
            category: exp.category,
            account_code: exp.account?.account_code,
            account_name: exp.account?.account_name,
            supplier_name: exp.supplier_name,
            supplier_nit: exp.supplier_nit,
            amount: exp.amount,
            iva_amount: exp.iva_amount,
            currency: exp.currency || "GTQ",
            tax_type: exp.tax_type,
            is_deductible: exp.is_deductible,
            deduction_category: exp.deduction_category,
            has_receipt: exp.has_receipt,
            status: exp.status,
          })),
          orgName
        )
      }
    />
  );
}
