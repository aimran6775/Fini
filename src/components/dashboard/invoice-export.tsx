"use client";

import { DataExportMenu } from "@/components/dashboard/export-button";
import { exportInvoicesToCSV } from "@/app/actions/export";
import { exportInvoicesToExcel } from "@/lib/excel/export-excel";

interface InvoiceExportProps {
  orgId: string;
  orgName: string;
  invoices: any[];
  filters?: { dateFrom?: string; dateTo?: string; status?: string };
}

export function InvoiceExportButton({ orgId, orgName, invoices, filters }: InvoiceExportProps) {
  return (
    <DataExportMenu
      label="Exportar"
      csvAction={() => exportInvoicesToCSV(orgId, filters)}
      onExcelExport={() =>
        exportInvoicesToExcel(
          invoices.map((inv: any) => ({
            fel_serie: inv.fel_serie,
            fel_numero: inv.fel_numero,
            fel_type: inv.fel_type,
            fel_uuid: inv.fel_uuid,
            client_name: inv.contact?.name || inv.client_name || "CF",
            client_nit: inv.contact?.nit_number || inv.client_nit || "CF",
            invoice_date: inv.invoice_date,
            subtotal: inv.subtotal,
            iva_amount: inv.iva_amount,
            total: inv.total,
            status: inv.status,
            payment_status: inv.payment_status,
          })),
          orgName
        )
      }
    />
  );
}
