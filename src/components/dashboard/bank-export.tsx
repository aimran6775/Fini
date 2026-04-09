"use client";

import { DataExportMenu } from "@/components/dashboard/export-button";
import { exportBankTransactionsToCSV } from "@/app/actions/export";
import { exportBankTransactionsToExcel } from "@/lib/excel/export-excel";

interface BankExportProps {
  accountId: string;
  bankName: string;
  accountName: string;
  transactions: any[];
  filters?: { dateFrom?: string; dateTo?: string };
}

export function BankExportButton({ accountId, bankName, accountName, transactions, filters }: BankExportProps) {
  return (
    <DataExportMenu
      label="Exportar"
      csvAction={() => exportBankTransactionsToCSV(accountId, filters)}
      onExcelExport={() =>
        exportBankTransactionsToExcel(
          transactions.map((txn: any) => ({
            transaction_date: txn.transaction_date,
            description: txn.description || "",
            category: txn.category,
            reference: txn.reference,
            amount: txn.amount,
            is_reconciled: txn.is_reconciled,
          })),
          bankName,
          accountName
        )
      }
    />
  );
}
