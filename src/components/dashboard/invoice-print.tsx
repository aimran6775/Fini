"use client";

import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { formatCurrency, formatDate, formatNIT } from "@/lib/utils";
import { FEL_TYPE_LABELS } from "@/lib/tax-utils";

interface InvoicePrintProps {
  invoice: {
    id: string;
    fel_serie: string | null;
    fel_numero: string | null;
    fel_uuid: string | null;
    fel_type: string;
    invoice_date: string;
    due_date: string | null;
    client_name: string;
    client_nit: string;
    client_email: string | null;
    client_address: string | null;
    subtotal: number;
    iva_amount: number;
    retencion_isr: number | null;
    retencion_iva: number | null;
    total: number;
    notes: string | null;
    items: {
      description: string;
      quantity: number;
      unit_price: number;
      discount: number | null;
      iva_amount: number;
      line_total: number;
      bien_o_servicio: string;
    }[];
  };
  organization: {
    name: string;
    nit_number: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    municipality: string | null;
    department: string | null;
  };
}

export function InvoicePrintButton({ invoice, organization }: InvoicePrintProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes para imprimir");
      return;
    }

    const html = generateInvoiceHTML(invoice, organization);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes para descargar el PDF");
      return;
    }

    const html = generateInvoiceHTML(invoice, organization);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    // Add a small banner to tell the user to save as PDF
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Imprimir
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
        <Download className="h-4 w-4 mr-2" />
        PDF
      </Button>
    </div>
  );
}

function generateInvoiceHTML(invoice: InvoicePrintProps["invoice"], org: InvoicePrintProps["organization"]) {
  const invoiceNumber = invoice.fel_serie && invoice.fel_numero 
    ? `${invoice.fel_serie}-${invoice.fel_numero}` 
    : "BORRADOR";
  
  const itemRows = invoice.items.map((item, idx) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${idx + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.bien_o_servicio === "S" ? "Servicio" : "Bien"}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${Number(item.quantity).toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">Q${Number(item.unit_price).toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">Q${Number(item.line_total).toFixed(2)}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.5; color: #111; padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .company { }
    .company h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .company p { color: #666; font-size: 11px; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { font-size: 24px; font-weight: 700; color: #4f46e5; margin-bottom: 8px; }
    .invoice-info p { font-size: 11px; color: #666; }
    .invoice-info .invoice-number { font-size: 14px; font-weight: 600; color: #111; }
    .parties { display: flex; gap: 40px; margin-bottom: 30px; }
    .party { flex: 1; }
    .party h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin-bottom: 8px; }
    .party p { margin-bottom: 2px; }
    .party .name { font-weight: 600; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f9fafb; padding: 10px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; border-bottom: 2px solid #e5e7eb; }
    th:nth-child(4), th:nth-child(5), th:nth-child(6) { text-align: right; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
    .totals-table { width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
    .totals-row.total { border-top: 2px solid #111; border-bottom: none; padding-top: 10px; font-weight: 700; font-size: 16px; }
    .totals-label { color: #666; }
    .notes { background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    .notes h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin-bottom: 8px; }
    .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 10px; color: #999; }
    .fel-info { background: #eef2ff; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
    .fel-info p { font-size: 10px; color: #4f46e5; }
    @media print {
      body { padding: 0; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">
      <h1>${org.name}</h1>
      <p>NIT: ${formatNIT(org.nit_number)}</p>
      ${org.address ? `<p>${org.address}</p>` : ""}
      ${org.municipality && org.department ? `<p>${org.municipality}, ${org.department}</p>` : ""}
      ${org.phone ? `<p>Tel: ${org.phone}</p>` : ""}
      ${org.email ? `<p>${org.email}</p>` : ""}
    </div>
    <div class="invoice-info">
      <h2>${FEL_TYPE_LABELS[invoice.fel_type] || "Factura"}</h2>
      <p class="invoice-number">${invoiceNumber}</p>
      <p>Fecha: ${formatDate(invoice.invoice_date)}</p>
      ${invoice.due_date ? `<p>Vence: ${formatDate(invoice.due_date)}</p>` : ""}
    </div>
  </div>

  ${invoice.fel_uuid ? `
  <div class="fel-info">
    <p><strong>Documento Tributario Electrónico (DTE)</strong></p>
    <p>UUID: ${invoice.fel_uuid}</p>
  </div>
  ` : ""}

  <div class="parties">
    <div class="party">
      <h3>Facturar a</h3>
      <p class="name">${invoice.client_name}</p>
      <p>NIT: ${invoice.client_nit === "CF" ? "CF" : formatNIT(invoice.client_nit)}</p>
      ${invoice.client_address ? `<p>${invoice.client_address}</p>` : ""}
      ${invoice.client_email ? `<p>${invoice.client_email}</p>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Descripción</th>
        <th style="width: 80px; text-align: center;">Tipo</th>
        <th style="width: 80px;">Cantidad</th>
        <th style="width: 100px;">Precio Unit.</th>
        <th style="width: 100px;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-table">
      <div class="totals-row">
        <span class="totals-label">Subtotal</span>
        <span>Q${Number(invoice.subtotal).toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span class="totals-label">IVA (12%)</span>
        <span>Q${Number(invoice.iva_amount).toFixed(2)}</span>
      </div>
      ${Number(invoice.retencion_isr || 0) > 0 ? `
      <div class="totals-row" style="color: #dc2626;">
        <span>Retención ISR</span>
        <span>-Q${Number(invoice.retencion_isr).toFixed(2)}</span>
      </div>
      ` : ""}
      ${Number(invoice.retencion_iva || 0) > 0 ? `
      <div class="totals-row" style="color: #dc2626;">
        <span>Retención IVA</span>
        <span>-Q${Number(invoice.retencion_iva).toFixed(2)}</span>
      </div>
      ` : ""}
      <div class="totals-row total">
        <span>Total</span>
        <span>Q${Number(invoice.total).toFixed(2)}</span>
      </div>
    </div>
  </div>

  ${invoice.notes ? `
  <div class="notes">
    <h4>Notas</h4>
    <p>${invoice.notes}</p>
  </div>
  ` : ""}

  <div class="footer">
    <p>Generado por FiniTax Guatemala • finitax.gt</p>
    <p>Este documento fue emitido electrónicamente</p>
  </div>
</body>
</html>
  `;
}
