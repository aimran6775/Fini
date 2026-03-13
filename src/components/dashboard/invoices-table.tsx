"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Receipt, FileCheck, Trash2, XCircle, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceActions } from "@/components/dashboard/invoice-actions";
import { BulkActionsBar, SelectRow } from "@/components/dashboard/bulk-actions";
import { ExportButton } from "@/components/dashboard/export-button";
import { bulkDeleteInvoices, bulkCertifyInvoices, bulkVoidInvoices } from "@/app/actions/invoices";
import { exportInvoicesToCSV } from "@/app/actions/export";

const statusColors: Record<string, string> = {
  DRAFT: "secondary",
  CERTIFIED: "success",
  VOIDED: "destructive",
  ERROR: "destructive",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  CERTIFIED: "Certificada",
  VOIDED: "Anulada",
  ERROR: "Error",
};

const paymentStatusColors: Record<string, string> = {
  UNPAID: "secondary",
  PARTIAL: "warning",
  PAID: "success",
};

const paymentStatusLabels: Record<string, string> = {
  UNPAID: "Sin Pagar",
  PARTIAL: "Parcial",
  PAID: "Pagada",
};

const felTypeLabels: Record<string, string> = {
  FACT: "Factura",
  FCAM: "Factura Cambiaria",
  FPEQ: "Factura Pequeño Contribuyente",
  FCAP: "Factura Cambiaria Pequeño",
  FESP: "Factura Especial",
  NABN: "Nota de Abono",
  NDEB: "Nota de Débito",
  RECI: "Recibo",
  RDON: "Recibo por Donación",
  APTS: "Otros",
};

interface Invoice {
  id: string;
  fel_serie: string | null;
  fel_numero: string | null;
  fel_type: string;
  client_name: string | null;
  contact: { name: string } | null;
  invoice_date: string;
  total: number;
  status: string;
  payment_status: string;
}

interface InvoicesTableProps {
  invoices: Invoice[];
  organizationId: string;
}

export function InvoicesTable({ invoices, organizationId }: InvoicesTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === invoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(invoices.map(inv => inv.id)));
    }
  };

  const handleAction = async (action: string): Promise<{ success?: boolean; error?: string }> => {
    const ids = Array.from(selectedIds);
    
    switch (action) {
      case "delete":
        const deleteResult = await bulkDeleteInvoices(ids, organizationId);
        if (deleteResult.success) {
          setSelectedIds(new Set());
        }
        return deleteResult;
      case "certify":
        const certifyResult = await bulkCertifyInvoices(ids, organizationId);
        if (certifyResult.success) {
          setSelectedIds(new Set());
        }
        return certifyResult;
      case "void":
        const voidResult = await bulkVoidInvoices(ids, organizationId);
        if (voidResult.success) {
          setSelectedIds(new Set());
        }
        return voidResult;
      default:
        return { error: "Acción no reconocida" };
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Receipt className="mx-auto h-12 w-12 mb-3 opacity-50" />
        <p>No hay facturas que coincidan con tu búsqueda</p>
        <Link href="/dashboard/invoices/new">
          <Button variant="outline" className="mt-4">Crear Primera Factura</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <BulkActionsBar
          selectedIds={selectedIds}
          totalCount={invoices.length}
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedIds(new Set())}
          onAction={handleAction}
          actions={[
            { id: "certify", label: "Certificar", icon: <FileCheck className="h-4 w-4" /> },
            { id: "void", label: "Anular", icon: <XCircle className="h-4 w-4" /> },
            { id: "delete", label: "Eliminar", icon: <Trash2 className="h-4 w-4" />, variant: "destructive" },
          ]}
        />
        <ExportButton 
          onExport={() => exportInvoicesToCSV(organizationId)} 
          label="Exportar CSV"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <input
                type="checkbox"
                checked={selectedIds.size === invoices.length && invoices.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300"
              />
            </TableHead>
            <TableHead>Serie/Número</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id} className={selectedIds.has(inv.id) ? "bg-muted/50" : ""}>
              <TableCell>
                <SelectRow
                  id={inv.id}
                  selected={selectedIds.has(inv.id)}
                  onToggle={toggleSelect}
                />
              </TableCell>
              <TableCell className="font-medium">
                <Link href={`/dashboard/invoices/${inv.id}`} className="hover:text-primary">
                  {inv.fel_serie || '—'}-{inv.fel_numero || '—'}
                </Link>
              </TableCell>
              <TableCell>{felTypeLabels[inv.fel_type] || inv.fel_type}</TableCell>
              <TableCell>{inv.contact?.name ?? inv.client_name ?? "CF"}</TableCell>
              <TableCell>{formatDate(inv.invoice_date)}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(inv.total)}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[inv.status] as any}>
                  {statusLabels[inv.status] || inv.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={paymentStatusColors[inv.payment_status] as any}>
                  {paymentStatusLabels[inv.payment_status] || inv.payment_status}
                </Badge>
              </TableCell>
              <TableCell>
                <InvoiceActions invoiceId={inv.id} status={inv.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
