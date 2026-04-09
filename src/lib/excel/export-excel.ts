"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// ─── Shared Styles ─────────────────────────────────────────────

const HEADER_FILL: ExcelJS.FillPattern = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E3A5F" },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 10,
  name: "Calibri",
};

const SUBHEADER_FILL: ExcelJS.FillPattern = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFEFF6FF" },
};

const SUBHEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FF1E3A5F" },
  size: 10,
  name: "Calibri",
};

const BODY_FONT: Partial<ExcelJS.Font> = {
  size: 10,
  name: "Calibri",
};

const CURRENCY_FORMAT = '#,##0.00;[Red]-#,##0.00';
const DATE_FORMAT = "DD/MM/YYYY";

const BORDER_STYLE: Partial<ExcelJS.Borders> = {
  bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
};

function applyHeaderRow(sheet: ExcelJS.Worksheet, rowNum: number) {
  const row = sheet.getRow(rowNum);
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FF1E3A5F" } },
    };
  });
  row.height = 28;
}

function applyBodyRows(sheet: ExcelJS.Worksheet, startRow: number, endRow: number, currencyCols: number[] = []) {
  for (let r = startRow; r <= endRow; r++) {
    const row = sheet.getRow(r);
    const isEven = r % 2 === 0;
    row.eachCell((cell, colNumber) => {
      cell.font = BODY_FONT;
      cell.border = BORDER_STYLE;
      cell.alignment = { vertical: "middle" };
      if (isEven) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
      if (currencyCols.includes(colNumber)) {
        cell.numFmt = CURRENCY_FORMAT;
        cell.alignment = { vertical: "middle", horizontal: "right" };
      }
    });
    row.height = 22;
  }
}

function addTitleRow(sheet: ExcelJS.Worksheet, title: string, subtitle: string, colCount: number) {
  // Title
  sheet.mergeCells(1, 1, 1, colCount);
  const titleCell = sheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { bold: true, size: 14, name: "Calibri", color: { argb: "FF0F172A" } };
  titleCell.alignment = { vertical: "middle" };
  sheet.getRow(1).height = 30;

  // Subtitle
  sheet.mergeCells(2, 1, 2, colCount);
  const subCell = sheet.getCell("A2");
  subCell.value = subtitle;
  subCell.font = { size: 9, name: "Calibri", color: { argb: "FF64748B" } };
  subCell.alignment = { vertical: "middle" };
  sheet.getRow(2).height = 18;

  // Empty row
  sheet.getRow(3).height = 8;
}

async function downloadWorkbook(wb: ExcelJS.Workbook, filename: string) {
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, filename);
}

// ─── Export Invoices to Excel ──────────────────────────────────

interface InvoiceRow {
  fel_serie: string | null;
  fel_numero: string | null;
  fel_type: string;
  fel_uuid: string | null;
  client_name: string;
  client_nit: string;
  invoice_date: string;
  subtotal: number;
  iva_amount: number;
  total: number;
  status: string;
  payment_status: string;
}

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  CERTIFIED: "Certificada",
  VOIDED: "Anulada",
};

const paymentLabels: Record<string, string> = {
  UNPAID: "Sin Pagar",
  PARTIAL: "Parcial",
  PAID: "Pagada",
};

export async function exportInvoicesToExcel(invoices: InvoiceRow[], orgName: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "FiniTax Guatemala";
  wb.created = new Date();

  const ws = wb.addWorksheet("Facturas", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  const cols = ["Serie", "Número", "Tipo DTE", "UUID FEL", "Cliente", "NIT", "Fecha", "Subtotal", "IVA", "Total", "Estado", "Pago"];
  addTitleRow(ws, `${orgName} — Facturas`, `Exportado: ${new Date().toLocaleDateString("es-GT")}`, cols.length);

  // Header row at row 4
  ws.getRow(4).values = cols;
  applyHeaderRow(ws, 4);

  // Data
  invoices.forEach((inv, i) => {
    ws.getRow(5 + i).values = [
      inv.fel_serie || "",
      inv.fel_numero || "",
      inv.fel_type,
      inv.fel_uuid || "",
      inv.client_name || "CF",
      inv.client_nit || "CF",
      inv.invoice_date,
      Number(inv.subtotal),
      Number(inv.iva_amount),
      Number(inv.total),
      statusLabels[inv.status] || inv.status,
      paymentLabels[inv.payment_status] || inv.payment_status,
    ];
  });

  applyBodyRows(ws, 5, 4 + invoices.length, [8, 9, 10]);

  // Column widths
  ws.columns = [
    { width: 10 }, { width: 12 }, { width: 12 }, { width: 38 },
    { width: 28 }, { width: 14 }, { width: 14 },
    { width: 14 }, { width: 14 }, { width: 14 },
    { width: 14 }, { width: 12 },
  ];

  // Summary row
  const sumRow = 5 + invoices.length + 1;
  ws.getRow(sumRow).values = ["", "", "", "", "", "", "TOTAL",
    invoices.reduce((s, i) => s + Number(i.subtotal), 0),
    invoices.reduce((s, i) => s + Number(i.iva_amount), 0),
    invoices.reduce((s, i) => s + Number(i.total), 0),
    "", ""];
  const sr = ws.getRow(sumRow);
  sr.eachCell((cell, col) => {
    cell.font = { bold: true, size: 10, name: "Calibri" };
    if ([8, 9, 10].includes(col)) cell.numFmt = CURRENCY_FORMAT;
  });
  sr.getCell(7).fill = SUBHEADER_FILL;
  sr.getCell(7).font = SUBHEADER_FONT;

  await downloadWorkbook(wb, `facturas_${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ─── Export Expenses to Excel ──────────────────────────────────

interface ExpenseRow {
  expense_date: string;
  description: string;
  category: string | null;
  account_code?: string;
  account_name?: string;
  supplier_name: string | null;
  supplier_nit: string | null;
  amount: number;
  iva_amount: number;
  currency: string;
  tax_type: string | null;
  is_deductible: boolean;
  deduction_category: string | null;
  has_receipt: boolean;
  status: string;
}

const expenseStatusLabels: Record<string, string> = {
  DRAFT: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

export async function exportExpensesToExcel(expenses: ExpenseRow[], orgName: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "FiniTax Guatemala";

  const ws = wb.addWorksheet("Gastos", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  const cols = ["Fecha", "Descripción", "Categoría", "Cuenta", "Proveedor", "NIT", "Monto", "IVA", "Moneda", "Tipo Fiscal", "Deducible", "Factura", "Estado"];
  addTitleRow(ws, `${orgName} — Gastos`, `Exportado: ${new Date().toLocaleDateString("es-GT")}`, cols.length);

  ws.getRow(4).values = cols;
  applyHeaderRow(ws, 4);

  expenses.forEach((exp, i) => {
    ws.getRow(5 + i).values = [
      exp.expense_date,
      exp.description,
      exp.category || "",
      exp.account_code ? `${exp.account_code} - ${exp.account_name}` : "",
      exp.supplier_name || "",
      exp.supplier_nit || "",
      Number(exp.amount),
      Number(exp.iva_amount),
      exp.currency || "GTQ",
      exp.tax_type || "",
      exp.is_deductible ? "Sí" : "No",
      exp.has_receipt ? "Sí" : "No",
      expenseStatusLabels[exp.status] || exp.status,
    ];
  });

  applyBodyRows(ws, 5, 4 + expenses.length, [7, 8]);

  ws.columns = [
    { width: 14 }, { width: 30 }, { width: 16 }, { width: 26 },
    { width: 22 }, { width: 14 }, { width: 14 }, { width: 14 },
    { width: 10 }, { width: 14 }, { width: 10 }, { width: 10 }, { width: 12 },
  ];

  // Summary
  const sumRow = 5 + expenses.length + 1;
  ws.getRow(sumRow).values = ["", "", "", "", "", "TOTAL",
    expenses.reduce((s, e) => s + Number(e.amount), 0),
    expenses.reduce((s, e) => s + Number(e.iva_amount), 0),
    "", "", "", "", ""];
  const sr = ws.getRow(sumRow);
  sr.eachCell((cell, col) => {
    cell.font = { bold: true, size: 10, name: "Calibri" };
    if ([7, 8].includes(col)) cell.numFmt = CURRENCY_FORMAT;
  });

  await downloadWorkbook(wb, `gastos_${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ─── Export Journal Entries to Excel ───────────────────────────

interface JournalRow {
  entry_date: string;
  reference_number: string | null;
  description: string | null;
  account_code: string;
  account_name: string;
  line_description: string | null;
  debit: number;
  credit: number;
  status: string;
}

export async function exportJournalToExcel(entries: JournalRow[], orgName: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "FiniTax Guatemala";

  const ws = wb.addWorksheet("Partidas Contables", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  const cols = ["Fecha", "Referencia", "Descripción", "Código Cuenta", "Cuenta", "Detalle Línea", "Debe", "Haber", "Estado"];
  addTitleRow(ws, `${orgName} — Libro Diario`, `Exportado: ${new Date().toLocaleDateString("es-GT")}`, cols.length);

  ws.getRow(4).values = cols;
  applyHeaderRow(ws, 4);

  entries.forEach((e, i) => {
    ws.getRow(5 + i).values = [
      e.entry_date,
      e.reference_number || "",
      e.description || "",
      e.account_code,
      e.account_name,
      e.line_description || "",
      Number(e.debit),
      Number(e.credit),
      e.status === "POSTED" ? "Contabilizada" : "Borrador",
    ];
  });

  applyBodyRows(ws, 5, 4 + entries.length, [7, 8]);

  ws.columns = [
    { width: 14 }, { width: 14 }, { width: 30 }, { width: 14 },
    { width: 28 }, { width: 28 }, { width: 16 }, { width: 16 }, { width: 14 },
  ];

  // Totals
  const sumRow = 5 + entries.length + 1;
  ws.getRow(sumRow).values = ["", "", "", "", "", "TOTAL",
    entries.reduce((s, e) => s + Number(e.debit), 0),
    entries.reduce((s, e) => s + Number(e.credit), 0),
    ""];
  const sr = ws.getRow(sumRow);
  sr.eachCell((cell, col) => {
    cell.font = { bold: true, size: 10, name: "Calibri" };
    if ([7, 8].includes(col)) cell.numFmt = CURRENCY_FORMAT;
  });

  await downloadWorkbook(wb, `partidas_${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ─── Export Payroll to Excel ───────────────────────────────────

interface PayrollRow {
  period_start: string;
  period_end: string;
  employee_name: string;
  dpi: string;
  base_salary: number;
  igss_employee: number;
  isr_withholding: number;
  bonus_incentive: number;
  other_deductions: number;
  net_pay: number;
  period_status: string;
}

export async function exportPayrollToExcel(rows: PayrollRow[], orgName: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "FiniTax Guatemala";

  const ws = wb.addWorksheet("Planilla", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  const cols = ["Período Inicio", "Período Fin", "Empleado", "DPI", "Salario Base", "IGSS", "ISR", "Bonificación", "Otras Ded.", "Salario Neto", "Estado"];
  addTitleRow(ws, `${orgName} — Planilla`, `Exportado: ${new Date().toLocaleDateString("es-GT")}`, cols.length);

  ws.getRow(4).values = cols;
  applyHeaderRow(ws, 4);

  rows.forEach((r, i) => {
    ws.getRow(5 + i).values = [
      r.period_start,
      r.period_end,
      r.employee_name,
      r.dpi,
      Number(r.base_salary),
      Number(r.igss_employee),
      Number(r.isr_withholding),
      Number(r.bonus_incentive),
      Number(r.other_deductions),
      Number(r.net_pay),
      r.period_status,
    ];
  });

  applyBodyRows(ws, 5, 4 + rows.length, [5, 6, 7, 8, 9, 10]);

  ws.columns = [
    { width: 14 }, { width: 14 }, { width: 28 }, { width: 18 },
    { width: 14 }, { width: 12 }, { width: 12 }, { width: 14 },
    { width: 12 }, { width: 14 }, { width: 14 },
  ];

  // Totals
  const sumRow = 5 + rows.length + 1;
  ws.getRow(sumRow).values = ["", "", "", "TOTAL",
    rows.reduce((s, r) => s + Number(r.base_salary), 0),
    rows.reduce((s, r) => s + Number(r.igss_employee), 0),
    rows.reduce((s, r) => s + Number(r.isr_withholding), 0),
    rows.reduce((s, r) => s + Number(r.bonus_incentive), 0),
    rows.reduce((s, r) => s + Number(r.other_deductions), 0),
    rows.reduce((s, r) => s + Number(r.net_pay), 0),
    ""];
  const sr = ws.getRow(sumRow);
  sr.eachCell((cell, col) => {
    cell.font = { bold: true, size: 10, name: "Calibri" };
    if ([5, 6, 7, 8, 9, 10].includes(col)) cell.numFmt = CURRENCY_FORMAT;
  });

  await downloadWorkbook(wb, `planilla_${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ─── Export Bank Transactions to Excel ─────────────────────────

interface BankTxnRow {
  transaction_date: string;
  description: string;
  category: string;
  reference: string | null;
  amount: number;
  is_reconciled: boolean;
}

const categoryLabels: Record<string, string> = {
  DEPOSIT: "Depósito",
  WITHDRAWAL: "Retiro",
  TRANSFER: "Transferencia",
  FEE: "Comisión",
  INTEREST: "Interés",
  OTHER: "Otro",
};

export async function exportBankTransactionsToExcel(
  transactions: BankTxnRow[],
  bankName: string,
  accountName: string
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "FiniTax Guatemala";

  const ws = wb.addWorksheet("Transacciones", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  const cols = ["Fecha", "Descripción", "Categoría", "Referencia", "Monto", "Reconciliado"];
  addTitleRow(ws, `${bankName} — ${accountName}`, `Exportado: ${new Date().toLocaleDateString("es-GT")}`, cols.length);

  ws.getRow(4).values = cols;
  applyHeaderRow(ws, 4);

  transactions.forEach((txn, i) => {
    ws.getRow(5 + i).values = [
      txn.transaction_date,
      txn.description || "",
      categoryLabels[txn.category] || txn.category,
      txn.reference || "",
      Number(txn.amount),
      txn.is_reconciled ? "Sí" : "No",
    ];
  });

  applyBodyRows(ws, 5, 4 + transactions.length, [5]);

  ws.columns = [
    { width: 14 }, { width: 36 }, { width: 16 },
    { width: 18 }, { width: 16 }, { width: 14 },
  ];

  const slug = bankName.toLowerCase().replace(/\s+/g, "_");
  await downloadWorkbook(wb, `transacciones_${slug}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ─── Export Personal Tax to Excel ──────────────────────────────

interface PersonalTaxData {
  income: { income_date: string; income_type: string; description: string; gross_amount: number; isr_withheld: number }[];
  deductions: { date: string; deduction_type: string; description: string; amount: number }[];
  retenciones: { date: string; agent_name: string; agent_nit: string; amount: number }[];
}

export async function exportPersonalTaxToExcel(data: PersonalTaxData, year: number, orgName: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "FiniTax Guatemala";

  // ── Income sheet ──
  const wsInc = wb.addWorksheet("Ingresos", {
    views: [{ state: "frozen", ySplit: 4 }],
  });
  const incCols = ["Fecha", "Tipo", "Descripción", "Monto Bruto", "ISR Retenido"];
  addTitleRow(wsInc, `Ingresos — ISR ${year}`, orgName, incCols.length);
  wsInc.getRow(4).values = incCols;
  applyHeaderRow(wsInc, 4);
  data.income.forEach((inc, i) => {
    wsInc.getRow(5 + i).values = [inc.income_date, inc.income_type, inc.description, Number(inc.gross_amount), Number(inc.isr_withheld)];
  });
  applyBodyRows(wsInc, 5, 4 + data.income.length, [4, 5]);
  wsInc.columns = [{ width: 14 }, { width: 18 }, { width: 32 }, { width: 16 }, { width: 16 }];

  // ── Deductions sheet ──
  const wsDed = wb.addWorksheet("Deducciones", {
    views: [{ state: "frozen", ySplit: 4 }],
  });
  const dedCols = ["Fecha", "Tipo", "Descripción", "Monto"];
  addTitleRow(wsDed, `Deducciones — ISR ${year}`, orgName, dedCols.length);
  wsDed.getRow(4).values = dedCols;
  applyHeaderRow(wsDed, 4);
  data.deductions.forEach((d, i) => {
    wsDed.getRow(5 + i).values = [d.date, d.deduction_type, d.description, Number(d.amount)];
  });
  applyBodyRows(wsDed, 5, 4 + data.deductions.length, [4]);
  wsDed.columns = [{ width: 14 }, { width: 18 }, { width: 32 }, { width: 16 }];

  // ── Retenciones sheet ──
  const wsRet = wb.addWorksheet("Retenciones", {
    views: [{ state: "frozen", ySplit: 4 }],
  });
  const retCols = ["Fecha", "Agente Retenedor", "NIT", "Monto"];
  addTitleRow(wsRet, `Retenciones ISR — ${year}`, orgName, retCols.length);
  wsRet.getRow(4).values = retCols;
  applyHeaderRow(wsRet, 4);
  data.retenciones.forEach((r, i) => {
    wsRet.getRow(5 + i).values = [r.date, r.agent_name, r.agent_nit, Number(r.amount)];
  });
  applyBodyRows(wsRet, 5, 4 + data.retenciones.length, [4]);
  wsRet.columns = [{ width: 14 }, { width: 28 }, { width: 16 }, { width: 16 }];

  // ── Summary sheet ──
  const wsSummary = wb.addWorksheet("Resumen");
  addTitleRow(wsSummary, `Resumen ISR — ${year}`, orgName, 3);
  const totalIncome = data.income.reduce((s, i) => s + Number(i.gross_amount), 0);
  const totalDeductions = data.deductions.reduce((s, d) => s + Number(d.amount), 0);
  const totalRetenciones = data.retenciones.reduce((s, r) => s + Number(r.amount), 0);

  wsSummary.getRow(4).values = ["Concepto", "", "Monto"];
  applyHeaderRow(wsSummary, 4);
  wsSummary.getRow(5).values = ["Total Ingresos", "", totalIncome];
  wsSummary.getRow(6).values = ["Total Deducciones", "", totalDeductions];
  wsSummary.getRow(7).values = ["Base Imponible", "", totalIncome - totalDeductions];
  wsSummary.getRow(8).values = ["Total Retenciones", "", totalRetenciones];
  applyBodyRows(wsSummary, 5, 8, [3]);
  wsSummary.columns = [{ width: 24 }, { width: 4 }, { width: 18 }];

  await downloadWorkbook(wb, `isr_personal_${year}.xlsx`);
}
