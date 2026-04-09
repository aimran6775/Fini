"use client";

import { DataExportMenu } from "@/components/dashboard/export-button";
import { exportPayrollToCSV } from "@/app/actions/export";
import { exportPayrollToExcel } from "@/lib/excel/export-excel";

interface PayrollExportProps {
  orgId: string;
  orgName: string;
  payrollRuns: any[];
  filters?: { year?: number; month?: number };
}

export function PayrollExportButton({ orgId, orgName, payrollRuns, filters }: PayrollExportProps) {
  return (
    <DataExportMenu
      label="Exportar"
      csvAction={() => exportPayrollToCSV(orgId, filters)}
      onExcelExport={() => {
        // Flatten payroll runs into individual payslip rows
        const rows = payrollRuns.flatMap((run: any) =>
          (run.details || run.payslips || []).map((slip: any) => ({
            period_start: run.period_start,
            period_end: run.period_end,
            employee_name: `${slip.employee?.first_name || ""} ${slip.employee?.last_name || ""}`.trim(),
            dpi: slip.employee?.dpi_number || "",
            base_salary: slip.base_salary,
            igss_employee: slip.igss_employee,
            isr_withholding: slip.isr_withholding,
            bonus_incentive: slip.bonus_incentive,
            other_deductions: slip.other_deductions,
            net_pay: slip.net_pay,
            period_status: run.status === "PAID" ? "Pagada" : run.status === "APPROVED" ? "Aprobada" : "Borrador",
          }))
        );
        return exportPayrollToExcel(rows, orgName);
      }}
    />
  );
}
