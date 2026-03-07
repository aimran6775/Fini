// FiniTax Guatemala — Form validation schemas
import { z } from "zod";

// ─── Guatemala NIT validation ──────────────────────────────────
// Format: XXXXXXXX-X (8 digits + check digit)
export const nitSchema = z.string().regex(
  /^\d{7,8}-?\d$/,
  "NIT inválido. Formato: XXXXXXXX-X"
);

// ─── Guatemala DPI/CUI validation ──────────────────────────────
// 13 digits: XXXX XXXXX XXXX
export const dpiSchema = z.string().regex(
  /^\d{13}$/,
  "DPI/CUI inválido. Debe tener 13 dígitos"
);

// ─── Profile Form ──────────────────────────────────────────────
export const profileSchema = z.object({
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  dpi_number: dpiSchema.optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

// ─── Organization Form ─────────────────────────────────────────
export const organizationSchema = z.object({
  name: z.string().min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
  nit_number: nitSchema,
  contribuyente_type: z.enum(["GENERAL", "PEQUENO"]),
  isr_regime: z.enum(["UTILIDADES", "SIMPLIFICADO"]),
  industry_code: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  municipality: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
});

// ─── FEL Invoice Form ──────────────────────────────────────────
export const felInvoiceItemSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  quantity: z.number().positive("La cantidad debe ser mayor a 0"),
  unit_price: z.number().min(0, "El precio no puede ser negativo"),
  discount: z.number().min(0).default(0),
  tax_type: z.enum(["GRAVADA", "EXENTA", "NO_SUJETA"]).default("GRAVADA"),
  bien_o_servicio: z.enum(["B", "S"]).default("B"),
});

export const felInvoiceSchema = z.object({
  fel_type: z.enum(["FACT", "FCAM", "FPEQ", "FCAP", "FESP", "NABN", "NDEB", "RECI", "RDON", "APTS"]),
  client_name: z.string().min(1, "El nombre del cliente es requerido"),
  client_nit: z.string().min(1, "El NIT del cliente es requerido"),
  client_address: z.string().optional().or(z.literal("")),
  client_email: z.string().email().optional().or(z.literal("")),
  currency: z.string().default("GTQ"),
  exchange_rate: z.number().positive().default(1),
  tax_type: z.enum(["GRAVADA", "EXENTA", "NO_SUJETA"]).default("GRAVADA"),
  contact_id: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  invoice_date: z.string().min(1, "La fecha es requerida"),
  due_date: z.string().optional().or(z.literal("")),
  items: z.array(felInvoiceItemSchema).min(1, "Debe agregar al menos un item"),
});

// ─── Expense Form ──────────────────────────────────────────────
export const expenseSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  currency: z.string().default("GTQ"),
  exchange_rate: z.number().positive().default(1),
  expense_date: z.string().min(1, "La fecha es requerida"),
  category: z.string().optional().or(z.literal("")),
  account_id: z.string().uuid().optional().or(z.literal("")),
  tax_type: z.enum(["GRAVADA", "EXENTA", "NO_SUJETA"]).default("GRAVADA"),
  supplier_nit: z.string().optional().or(z.literal("")),
  supplier_name: z.string().optional().or(z.literal("")),
  contact_id: z.string().uuid().optional().or(z.literal("")),
  fel_uuid: z.string().optional().or(z.literal("")),
  fel_serie: z.string().optional().or(z.literal("")),
  fel_numero: z.string().optional().or(z.literal("")),
  is_deductible: z.boolean().default(true),
  deduction_category: z.string().optional().or(z.literal("")),
});

// ─── Employee Form ─────────────────────────────────────────────
export const employeeSchema = z.object({
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  dpi_number: dpiSchema,
  nit_number: nitSchema.optional().or(z.literal("")),
  igss_affiliation: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  base_salary: z.number().positive("El salario debe ser mayor a 0"),
  work_shift: z.enum(["DIURNA", "MIXTA", "NOCTURNA"]).default("DIURNA"),
  hire_date: z.string().min(1, "La fecha de contratación es requerida"),
  bank_account: z.string().optional().or(z.literal("")),
  bank_name: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

// ─── Contact Form ──────────────────────────────────────────────
export const contactSchema = z.object({
  contact_type: z.enum(["CLIENT", "VENDOR", "BOTH"]),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  nit_number: z.string().min(1, "El NIT es requerido"),
  dpi_number: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  municipality: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

// ─── Chart of Accounts Form ────────────────────────────────────
export const accountSchema = z.object({
  account_code: z.string().min(1, "El código de cuenta es requerido"),
  account_name: z.string().min(2, "El nombre de cuenta es requerido"),
  account_type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "COST", "EXPENSE"]),
  parent_account_id: z.string().uuid().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

// ─── Journal Entry Form ────────────────────────────────────────
export const journalEntryLineSchema = z.object({
  account_id: z.string().uuid("Seleccione una cuenta"),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0),
  description: z.string().optional().or(z.literal("")),
});

export const journalEntrySchema = z.object({
  entry_date: z.string().min(1, "La fecha es requerida"),
  reference: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  lines: z.array(journalEntryLineSchema).min(2, "Debe tener al menos 2 líneas"),
});

// ─── Fixed Asset Form ──────────────────────────────────────────
export const fixedAssetSchema = z.object({
  asset_name: z.string().min(1, "El nombre del activo es requerido"),
  asset_category: z.string().min(1, "La categoría es requerida"),
  description: z.string().optional().or(z.literal("")),
  acquisition_date: z.string().min(1, "La fecha de adquisición es requerida"),
  acquisition_cost: z.number().positive("El costo debe ser mayor a 0"),
  residual_value: z.number().min(0).default(0),
  depreciation_rate: z.number().positive("La tasa debe ser mayor a 0"),
  account_id: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

// ─── Bank Account Form ─────────────────────────────────────────
export const bankAccountSchema = z.object({
  account_name: z.string().min(1, "El nombre es requerido"),
  bank_name: z.string().min(1, "El banco es requerido"),
  account_number: z.string().min(1, "El número de cuenta es requerido"),
  account_type: z.enum(["CHECKING", "SAVINGS", "CREDIT_CARD", "OTHER"]),
  currency: z.string().default("GTQ"),
  current_balance: z.number().default(0),
});

// ─── Budget Form ───────────────────────────────────────────────
export const budgetSchema = z.object({
  account_id: z.string().uuid("Seleccione una cuenta"),
  period_type: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]),
  period_year: z.number().int().min(2020).max(2050),
  period_month: z.number().int().min(1).max(12).optional(),
  period_quarter: z.number().int().min(1).max(4).optional(),
  budgeted_amount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
  notes: z.string().optional().or(z.literal("")),
});

// ─── Stamp Tax Form ────────────────────────────────────────────
export const stampTaxSchema = z.object({
  document_type: z.string().min(1, "El tipo de documento es requerido"),
  document_reference: z.string().optional().or(z.literal("")),
  document_date: z.string().min(1, "La fecha es requerida"),
  document_value: z.number().positive("El valor debe ser mayor a 0"),
  tax_rate: z.number().default(0.03),
  notes: z.string().optional().or(z.literal("")),
});

// ─── Type exports ──────────────────────────────────────────────
export type ProfileFormData = z.infer<typeof profileSchema>;
export type OrganizationFormData = z.infer<typeof organizationSchema>;
export type FELInvoiceFormData = z.infer<typeof felInvoiceSchema>;
export type FELInvoiceItemFormData = z.infer<typeof felInvoiceItemSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type AccountFormData = z.infer<typeof accountSchema>;
export type JournalEntryFormData = z.infer<typeof journalEntrySchema>;
export type FixedAssetFormData = z.infer<typeof fixedAssetSchema>;
export type BankAccountFormData = z.infer<typeof bankAccountSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type StampTaxFormData = z.infer<typeof stampTaxSchema>;
