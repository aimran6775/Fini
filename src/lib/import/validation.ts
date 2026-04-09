// ─── Import Validation Engine ──────────────────────────────────

import type { ImportCategory, ColumnDef } from "./schemas";
import { getCategoryConfig } from "./schemas";

export interface ValidationIssue {
  row: number;
  field: string;
  severity: "error" | "warning";
  message: string;
  suggestion?: string;
}

// ─── Main Validator ────────────────────────────────────────────

export function validateRows(
  rows: Record<string, string>[],
  category: ImportCategory
): ValidationIssue[] {
  const config = getCategoryConfig(category);
  const issues: ValidationIssue[] = [];

  rows.forEach((row, i) => {
    // 1. Required fields
    for (const col of config.columns) {
      if (col.required && !row[col.key]?.toString().trim()) {
        issues.push({
          row: i,
          field: col.key,
          severity: "error",
          message: `${col.label} es requerido`,
        });
      }
    }

    // 2. Type validation
    for (const col of config.columns) {
      const val = row[col.key]?.toString().trim();
      if (!val) continue;

      if (col.type === "date" && !isValidDate(val)) {
        issues.push({
          row: i,
          field: col.key,
          severity: "error",
          message: "Formato de fecha inválido (esperado: YYYY-MM-DD)",
          suggestion: tryFixDate(val) || undefined,
        });
      }

      if ((col.type === "currency" || col.type === "number") && !isValidNumber(val)) {
        issues.push({
          row: i,
          field: col.key,
          severity: "error",
          message: "Debe ser un valor numérico",
          suggestion: tryFixNumber(val) || undefined,
        });
      }

      if (col.type === "select" && col.options) {
        const validValues = col.options.map((o) => o.value);
        if (!validValues.includes(val)) {
          issues.push({
            row: i,
            field: col.key,
            severity: "warning",
            message: `Valor no reconocido: "${val}"`,
            suggestion: validValues[0],
          });
        }
      }
    }

    // 3. Cross-field rules per category
    validateCrossFields(row, i, category, issues);
  });

  return issues;
}

// ─── Cross-Field Validators ────────────────────────────────────

function validateCrossFields(
  row: Record<string, string>,
  index: number,
  category: ImportCategory,
  issues: ValidationIssue[]
) {
  // Subtotal + Tax = Total check (invoices + expenses)
  if (category === "invoice" || category === "expense") {
    const subtotal = parseNum(row.subtotal);
    const tax = parseNum(row.tax_amount);
    const total = parseNum(row.total);

    if (subtotal > 0 && tax > 0 && total > 0) {
      const expected = subtotal + tax;
      if (Math.abs(expected - total) > 0.02) {
        issues.push({
          row: index,
          field: "total",
          severity: "warning",
          message: `Subtotal (${subtotal.toFixed(2)}) + IVA (${tax.toFixed(2)}) = ${expected.toFixed(2)} ≠ Total (${total.toFixed(2)})`,
          suggestion: expected.toFixed(2),
        });
      }
    }

    // Auto-detect IVA if subtotal+total present but no tax
    if (subtotal > 0 && total > 0 && !tax) {
      const impliedTax = total - subtotal;
      if (impliedTax > 0) {
        issues.push({
          row: index,
          field: "tax_amount",
          severity: "warning",
          message: `IVA faltante — posible valor: ${impliedTax.toFixed(2)}`,
          suggestion: impliedTax.toFixed(2),
        });
      }
    }
  }

  // Bank: debit OR credit should have a value, not both
  if (category === "bank_transaction") {
    const debit = parseNum(row.debit);
    const credit = parseNum(row.credit);
    if (debit > 0 && credit > 0) {
      issues.push({
        row: index,
        field: "debit",
        severity: "warning",
        message: "Un movimiento no debería tener débito y crédito al mismo tiempo",
      });
    }
    if (!debit && !credit) {
      issues.push({
        row: index,
        field: "debit",
        severity: "error",
        message: "Debe tener al menos un débito o crédito",
      });
    }
  }

  // Contact: should have at least a name
  if (category === "contact") {
    if (!row.contact_name?.trim() && !row.company_name?.trim()) {
      issues.push({
        row: index,
        field: "contact_name",
        severity: "error",
        message: "Debe tener nombre de contacto o empresa",
      });
    }
  }

  // Product: negative prices
  if (category === "product") {
    const price = parseNum(row.price);
    if (price < 0) {
      issues.push({
        row: index,
        field: "price",
        severity: "warning",
        message: "Precio negativo detectado",
      });
    }
  }
}

// ─── Helpers ───────────────────────────────────────────────────

function parseNum(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.\-]/g, "");
  return parseFloat(cleaned) || 0;
}

function isValidDate(val: string): boolean {
  // Accept YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const d = new Date(val + "T12:00:00");
    return !isNaN(d.getTime());
  }
  // Accept DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const [dd, mm, yyyy] = val.split("/");
    const d = new Date(`${yyyy}-${mm}-${dd}T12:00:00`);
    return !isNaN(d.getTime());
  }
  return false;
}

function isValidNumber(val: string): boolean {
  const cleaned = val.replace(/[,\s]/g, "");
  return !isNaN(parseFloat(cleaned)) && isFinite(Number(cleaned));
}

function tryFixDate(val: string): string | null {
  // Try DD/MM/YYYY → YYYY-MM-DD
  const ddmmyyyy = val.match(/^(\d{2})[\/\-.](\d{2})[\/\-.](\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;

  // Try MM/DD/YYYY → YYYY-MM-DD
  const mmddyyyy = val.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (mmddyyyy) {
    const mm = mmddyyyy[1].padStart(2, "0");
    const dd = mmddyyyy[2].padStart(2, "0");
    return `${mmddyyyy[3]}-${mm}-${dd}`;
  }

  return null;
}

function tryFixNumber(val: string): string | null {
  // Remove common formatting: Q, $, commas, spaces
  const cleaned = val.replace(/[Q$,\s]/g, "").trim();
  const num = parseFloat(cleaned);
  if (!isNaN(num)) return num.toFixed(2);
  return null;
}

// ─── Summary Helpers ───────────────────────────────────────────

export function getRowStatus(
  rowIndex: number,
  issues: ValidationIssue[]
): "valid" | "warning" | "error" {
  const rowIssues = issues.filter((i) => i.row === rowIndex);
  if (rowIssues.some((i) => i.severity === "error")) return "error";
  if (rowIssues.some((i) => i.severity === "warning")) return "warning";
  return "valid";
}

export function getIssueSummary(issues: ValidationIssue[]) {
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  return { errors, warnings, total: errors + warnings };
}
