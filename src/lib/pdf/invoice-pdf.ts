"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatNIT } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export interface InvoicePDFData {
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
  payment_status?: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    discount: number | null;
    iva_amount: number;
    line_total: number;
    bien_o_servicio: string;
  }[];
}

export interface OrganizationPDFData {
  name: string;
  nit_number: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  municipality: string | null;
  department: string | null;
}

// ─── Color Palette ─────────────────────────────────────────────

const COLORS = {
  primary: [37, 99, 235] as [number, number, number],       // #2563eb
  primaryLight: [239, 246, 255] as [number, number, number], // #eff6ff
  dark: [15, 23, 42] as [number, number, number],            // #0f172a
  gray: [100, 116, 139] as [number, number, number],         // #64748b
  lightGray: [241, 245, 249] as [number, number, number],    // #f1f5f9
  border: [226, 232, 240] as [number, number, number],       // #e2e8f0
  white: [255, 255, 255] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],            // #dc2626
  green: [22, 163, 74] as [number, number, number],          // #16a34a
};

// ─── FEL Type Labels ───────────────────────────────────────────

const FEL_LABELS: Record<string, string> = {
  FACT: "Factura",
  FCAM: "Factura Cambiaria",
  FPEQ: "Factura Pequeño Contribuyente",
  FCAP: "Factura Cambiaria de Pequeño Contribuyente",
  FESP: "Factura Especial",
  NDEB: "Nota de Débito",
  NCRE: "Nota de Crédito",
  RECI: "Recibo",
  RDON: "Recibo por Donación",
  NABN: "Nota de Abono",
};

const PAYMENT_LABELS: Record<string, string> = {
  UNPAID: "Sin Pagar",
  PARTIAL: "Parcial",
  PAID: "Pagada",
};

// ─── Format Helpers ────────────────────────────────────────────

function fmtCurrency(amount: number): string {
  return `Q ${amount.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-GT", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── Main Generator ────────────────────────────────────────────

export function generateInvoicePDF(invoice: InvoicePDFData, org: OrganizationPDFData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Accent line at top ──
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 3, "F");

  y = 14;

  // ── Company header ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.text(org.name, margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  y += 6;
  doc.text(`NIT: ${formatNIT(org.nit_number)}`, margin, y);
  if (org.address) { y += 4; doc.text(org.address, margin, y); }
  if (org.municipality && org.department) { y += 4; doc.text(`${org.municipality}, ${org.department}`, margin, y); }
  if (org.phone) { y += 4; doc.text(`Tel: ${org.phone}`, margin, y); }
  if (org.email) { y += 4; doc.text(org.email, margin, y); }

  // ── Invoice title (right side) ──
  const invoiceNumber = invoice.fel_serie && invoice.fel_numero
    ? `${invoice.fel_serie}-${invoice.fel_numero}`
    : "BORRADOR";
  const docType = FEL_LABELS[invoice.fel_type] || "Factura";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.primary);
  doc.text(docType.toUpperCase(), pageWidth - margin, 14, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text(invoiceNumber, pageWidth - margin, 22, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Fecha: ${fmtDate(invoice.invoice_date)}`, pageWidth - margin, 28, { align: "right" });
  if (invoice.due_date) {
    doc.text(`Vence: ${fmtDate(invoice.due_date)}`, pageWidth - margin, 33, { align: "right" });
  }
  if (invoice.payment_status) {
    const payLabel = PAYMENT_LABELS[invoice.payment_status] || invoice.payment_status;
    doc.text(`Pago: ${payLabel}`, pageWidth - margin, invoice.due_date ? 38 : 33, { align: "right" });
  }

  // ── FEL UUID box ──
  y = Math.max(y, 38) + 8;
  if (invoice.fel_uuid) {
    doc.setFillColor(...COLORS.primaryLight);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("DOCUMENTO TRIBUTARIO ELECTRÓNICO (DTE)", margin + 4, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`UUID: ${invoice.fel_uuid}`, margin + 4, y + 9);
    y += 16;
  }

  // ── Separator line ──
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ── Client info box ──
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.gray);
  doc.text("FACTURAR A", margin, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text(invoice.client_name, margin, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text(`NIT: ${invoice.client_nit === "CF" ? "CF" : formatNIT(invoice.client_nit)}`, margin, y);
  if (invoice.client_address) { y += 4; doc.text(invoice.client_address, margin, y); }
  if (invoice.client_email) { y += 4; doc.text(invoice.client_email, margin, y); }

  y += 10;

  // ── Items table ──
  const tableBody = invoice.items.map((item, idx) => [
    String(idx + 1),
    item.description,
    item.bien_o_servicio === "S" ? "Servicio" : "Bien",
    Number(item.quantity).toFixed(2),
    fmtCurrency(Number(item.unit_price)),
    fmtCurrency(Number(item.line_total)),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["#", "Descripción", "Tipo", "Cant.", "Precio Unit.", "Total"]],
    body: tableBody,
    theme: "plain",
    headStyles: {
      fillColor: COLORS.lightGray,
      textColor: COLORS.gray,
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      halign: "left",
    },
    bodyStyles: {
      textColor: COLORS.dark,
      fontSize: 8.5,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      lineColor: COLORS.border,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: "auto" },
      2: { halign: "center", cellWidth: 22 },
      3: { halign: "right", cellWidth: 18 },
      4: { halign: "right", cellWidth: 30 },
      5: { halign: "right", cellWidth: 30 },
    },
    alternateRowStyles: {
      fillColor: [250, 251, 252],
    },
  });

  // Get y position after table
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Totals section (right-aligned) ──
  const totalsX = pageWidth - margin - 70;
  const totalsWidth = 70;

  const drawTotalRow = (label: string, value: string, isBold = false, color?: [number, number, number]) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(isBold ? 10 : 9);
    doc.setTextColor(...(color || (isBold ? COLORS.dark : COLORS.gray)));
    doc.text(label, totalsX, y);
    doc.setTextColor(...(color || COLORS.dark));
    doc.text(value, totalsX + totalsWidth, y, { align: "right" });
    y += isBold ? 7 : 5;
  };

  drawTotalRow("Subtotal", fmtCurrency(Number(invoice.subtotal)));
  drawTotalRow("IVA (12%)", fmtCurrency(Number(invoice.iva_amount)));

  if (Number(invoice.retencion_isr || 0) > 0) {
    drawTotalRow("Retención ISR", `-${fmtCurrency(Number(invoice.retencion_isr))}`, false, COLORS.red);
  }
  if (Number(invoice.retencion_iva || 0) > 0) {
    drawTotalRow("Retención IVA", `-${fmtCurrency(Number(invoice.retencion_iva))}`, false, COLORS.red);
  }

  // Total line
  doc.setDrawColor(...COLORS.dark);
  doc.setLineWidth(0.5);
  doc.line(totalsX, y - 2, totalsX + totalsWidth, y - 2);
  y += 2;
  drawTotalRow("TOTAL", fmtCurrency(Number(invoice.total)), true);

  // ── Notes ──
  if (invoice.notes) {
    y += 4;
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.gray);
    doc.text("NOTAS", margin + 4, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.dark);
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth - 8);
    doc.text(noteLines, margin + 4, y + 10);
    y += 20;
  }

  // ── Footer ──
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gray);
  doc.text("Generado por FiniTax Guatemala • finitax.gt", pageWidth / 2, footerY, { align: "center" });
  doc.text("Este documento fue emitido electrónicamente", pageWidth / 2, footerY + 3.5, { align: "center" });

  return doc;
}

// ─── Download Helper ───────────────────────────────────────────

export function downloadInvoicePDF(invoice: InvoicePDFData, org: OrganizationPDFData) {
  const doc = generateInvoicePDF(invoice, org);
  const invoiceNumber = invoice.fel_serie && invoice.fel_numero
    ? `${invoice.fel_serie}-${invoice.fel_numero}`
    : `borrador-${invoice.id.slice(0, 8)}`;
  doc.save(`factura_${invoiceNumber}.pdf`);
}
