// FiniTax Guatemala — Tax Constants & Types
// These are shared constants used by both server actions and client components

// Guatemala Tax Rate Constants
export const TAX_RATES = {
  IVA: 0.12, // 12%
  ISR_UTILIDADES: 0.25, // 25% on net income
  ISR_SIMPLIFICADO_LOW: 0.05, // 5% on first Q30,000/month
  ISR_SIMPLIFICADO_HIGH: 0.07, // 7% on excess over Q30,000/month
  ISR_SIMPLIFICADO_THRESHOLD: 30000, // Q30,000 monthly threshold
  ISO: 0.01, // 1% quarterly
  STAMP_TAX: 0.03, // 3%
  PEQUENO_CONTRIBUYENTE: 0.05, // 5% flat

  // Withholding rates
  RETENTION_SERVICES: 0.05, // 5% on professional services
  RETENTION_GOODS: 0.065, // 6.5% on goods from non-domiciled
  RETENTION_NON_DOMICILED: 0.15, // 15% on payments to non-domiciled

  // Payroll
  IGSS_EMPLOYEE: 0.0483,
  IGSS_EMPLOYER: 0.1067,
  IRTRA: 0.01,
  INTECAP: 0.01,

  // Employee ISR brackets
  ISR_EMPLOYEE_THRESHOLD: 300000, // Q300,000/year
  ISR_EMPLOYEE_LOW: 0.05,
  ISR_EMPLOYEE_HIGH: 0.07,
  ISR_EMPLOYEE_DEDUCTION: 48000, // Standard deduction Q48,000/year
} as const;

export interface TaxCalculation {
  type: string;
  period: string;
  taxableBase: number;
  rate: number;
  taxAmount: number;
  credits: number;
  netTax: number;
}

// Tax form labels
export const TAX_FORM_LABELS: Record<string, { name: string; description: string }> = {
  IVA_MENSUAL: { name: "IVA Mensual (SAT-2237)", description: "Declaración mensual del Impuesto al Valor Agregado" },
  ISR_TRIMESTRAL: { name: "ISR Trimestral", description: "Impuesto Sobre la Renta — Régimen sobre Utilidades" },
  ISR_MENSUAL: { name: "ISR Mensual", description: "Impuesto Sobre la Renta — Régimen Simplificado" },
  ISR_ANUAL: { name: "ISR Anual", description: "Declaración Jurada Anual del ISR" },
  ISO_TRIMESTRAL: { name: "ISO Trimestral", description: "Impuesto de Solidaridad" },
  RETENCIONES_ISR: { name: "Retenciones ISR", description: "Retenciones del Impuesto Sobre la Renta" },
};

// Tax filing status labels
export const TAX_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Borrador", color: "bg-gray-100 text-gray-700" },
  CALCULATED: { label: "Calculado", color: "bg-blue-100 text-blue-700" },
  FILED: { label: "Presentado", color: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "Aceptado", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rechazado", color: "bg-red-100 text-red-700" },
};

// FEL document type labels
export const FEL_TYPE_LABELS: Record<string, string> = {
  FACT: "Factura",
  FCAM: "Factura Cambiaria",
  FPEQ: "Factura Pequeño Contribuyente",
  FCAP: "Factura Cambiaria Peq. Contribuyente",
  FESP: "Factura Especial",
  NABN: "Nota de Abono",
  NDEB: "Nota de Débito",
  RECI: "Recibo",
  RDON: "Recibo por Donación",
  APTS: "Aportaciones Seguro Social",
};

// FEL status labels
export const FEL_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Borrador", color: "bg-gray-100 text-gray-700" },
  CERTIFIED: { label: "Certificada", color: "bg-blue-100 text-blue-700" },
  AUTHORIZED: { label: "Autorizada", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rechazada", color: "bg-red-100 text-red-700" },
  VOIDED: { label: "Anulada", color: "bg-orange-100 text-orange-700" },
};

// Payment method labels
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia Bancaria",
  CHEQUE: "Cheque",
  TARJETA_CREDITO: "Tarjeta de Crédito",
  TARJETA_DEBITO: "Tarjeta de Débito",
  DEPOSITO: "Depósito",
  OTRO: "Otro",
};

// Payment status labels
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Sin Pagar",
  PARTIAL: "Pago Parcial",
  PAID: "Pagada",
};

// Guatemala departments
export const GUATEMALA_DEPARTMENTS = [
  "Guatemala", "El Progreso", "Sacatepéquez", "Chimaltenango", "Escuintla",
  "Santa Rosa", "Sololá", "Totonicapán", "Quetzaltenango", "Suchitepéquez",
  "Retalhuleu", "San Marcos", "Huehuetenango", "Quiché", "Baja Verapaz",
  "Alta Verapaz", "Petén", "Izabal", "Zacapa", "Chiquimula", "Jalapa", "Jutiapa",
];

// Month names in Spanish
export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Depreciation rates (Guatemala straight-line)
export const DEPRECIATION_RATES: Record<string, { rate: number; label: string }> = {
  BUILDINGS: { rate: 0.05, label: "Edificios y mejoras (5%)" },
  MACHINERY: { rate: 0.20, label: "Maquinaria y equipo (20%)" },
  FURNITURE: { rate: 0.20, label: "Mobiliario y equipo (20%)" },
  VEHICLES: { rate: 0.20, label: "Vehículos (20%)" },
  TOOLS: { rate: 0.25, label: "Herramientas (25%)" },
  COMPUTERS: { rate: 0.3333, label: "Equipo de cómputo (33.33%)" },
  OTHER: { rate: 0.10, label: "Otros activos depreciables (10%)" },
};

// Currency formatting for Guatemala
export function formatGTQ(amount: number): string {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// NIT formatting
export function formatNIT(nit: string): string {
  const digits = nit.replace(/\D/g, "");
  if (digits.length >= 9) {
    return `${digits.slice(0, -1)}-${digits.slice(-1)}`;
  }
  return nit;
}

// DPI formatting
export function formatDPI(dpi: string): string {
  const digits = dpi.replace(/\D/g, "");
  if (digits.length === 13) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 9)} ${digits.slice(9)}`;
  }
  return dpi;
}
