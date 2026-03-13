// FiniTax Guatemala — Database Types
// Mirrors the Supabase PostgreSQL schema for Guatemala tax/accounting system

// ─── Enums ──────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "EMPLOYEE" | "ACCOUNTANT";

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "COST" | "EXPENSE";

// FEL Document Types (Guatemala electronic invoicing)
export type FELType =
  | "FACT"   // Factura
  | "FCAM"   // Factura Cambiaria
  | "FPEQ"   // Factura Pequeño Contribuyente
  | "FCAP"   // Factura Cambiaria Pequeño Contribuyente
  | "FESP"   // Factura Especial
  | "NABN"   // Nota de Abono (Credit Note)
  | "NDEB"   // Nota de Débito
  | "RECI"   // Recibo
  | "RDON"   // Recibo por Donación
  | "APTS";  // Aportaciones para Seguro Social

export type FELStatus = "DRAFT" | "CERTIFIED" | "AUTHORIZED" | "REJECTED" | "VOIDED";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export type TaxType = "GRAVADA" | "EXENTA" | "NO_SUJETA";

export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "TERMINATED";

export type WorkShift = "DIURNA" | "MIXTA" | "NOCTURNA";

export type ExpenseStatus = "DRAFT" | "APPROVED" | "REJECTED";

export type PayrollStatus = "DRAFT" | "APPROVED" | "PAID";

export type AdjustmentType = "IN" | "OUT" | "ADJUSTMENT";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";

// Guatemala ISR Regimes
export type ISRRegime = "UTILIDADES" | "SIMPLIFICADO";

// Tax form types for Guatemala
export type TaxFormType =
  | "IVA_MENSUAL"       // SAT-2237 Monthly IVA
  | "ISR_TRIMESTRAL"    // ISR Quarterly (Régimen Utilidades)
  | "ISR_MENSUAL"       // ISR Monthly (Régimen Simplificado)
  | "ISR_ANUAL"         // Annual Income Tax Return
  | "ISO_TRIMESTRAL"    // Solidarity Tax Quarterly
  | "RETENCIONES_ISR";  // ISR Withholdings

export type TaxFilingStatus = "DRAFT" | "CALCULATED" | "FILED" | "ACCEPTED" | "REJECTED";

export type NotificationType =
  | "INVOICE_AUTHORIZED"
  | "INVOICE_REJECTED"
  | "EXPENSE_APPROVED"
  | "EXPENSE_REJECTED"
  | "PAYROLL_GENERATED"
  | "PAYROLL_APPROVED"
  | "PAYROLL_PAID"
  | "TAX_CALCULATED"
  | "TAX_FILED"
  | "TAX_DEADLINE"
  | "MEMBER_INVITED"
  | "MEMBER_JOINED"
  | "LOW_STOCK"
  | "ISO_DUE"
  | "BONO14_DUE"
  | "AGUINALDO_DUE"
  | "SYSTEM";

export type ContactType = "CLIENT" | "VENDOR" | "BOTH";

export type RecurringSourceType = "INVOICE" | "EXPENSE";

export type RecurringFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL";

export type BankAccountType = "CHECKING" | "SAVINGS" | "CREDIT_CARD" | "OTHER";

export type BankTxnCategory = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "FEE" | "INTEREST" | "OTHER";

export type ReconciliationStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type BudgetPeriodType = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export type DepreciationMethod = "STRAIGHT_LINE";

export type AssetStatus = "ACTIVE" | "FULLY_DEPRECIATED" | "DISPOSED";

export type ContribuyenteType = "GENERAL" | "PEQUENO";

export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "CHEQUE" | "TARJETA_CREDITO" | "TARJETA_DEBITO" | "DEPOSITO" | "OTRO";

// ─── Core Entities ──────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  nit_number: string;            // Guatemala NIT: XXXXXXXX-X
  contribuyente_type: ContribuyenteType;
  isr_regime: ISRRegime;
  industry_code: string | null;
  address: string | null;
  municipality: string | null;
  department: string | null;     // Guatemala has 22 departments
  phone: string | null;
  email: string | null;
  fel_certificador: string | null; // INFILE, DIGIFACT, GUATEFACTURAS, etc.
  fel_nit_certificador: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  dpi_number: string | null;    // Guatemala DPI (CUI): 13 digits
  phone: string | null;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: UserRole;
  invited_by: string;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
}

// ─── Chart of Accounts ─────────────────────────────────────────

export interface ChartOfAccount {
  id: string;
  organization_id: string;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  parent_account_id: string | null;
  is_active: boolean;
  created_at: string;
}

// ─── Journal Entries (Double-Entry Bookkeeping) ─────────────────

export interface JournalEntry {
  id: string;
  organization_id: string;
  entry_date: string;
  reference: string | null;
  description: string | null;
  created_by: string;
  created_at: string;
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  debit: number;
  credit: number;
  description: string | null;
}

// ─── FEL Invoicing (Guatemala Electronic Invoicing) ─────────────

export interface FELInvoice {
  id: string;
  organization_id: string;
  fel_type: FELType;
  status: FELStatus;
  payment_status: PaymentStatus;

  // FEL Certification fields
  fel_uuid: string | null;          // UUID assigned by Certificador
  fel_serie: string | null;         // Serie assigned by SAT
  fel_numero: string | null;        // DTE number from SAT
  fel_fecha_certificacion: string | null;
  fel_certificador_nit: string | null;
  fel_xml_url: string | null;

  // Client info
  client_name: string;
  client_nit: string;               // "CF" for Consumidor Final
  client_address: string | null;
  client_email: string | null;

  // Money
  currency: string;                 // GTQ or USD
  exchange_rate: number;            // 1.0 for GTQ
  subtotal: number;
  iva_amount: number;               // 12% IVA
  total: number;
  tax_type: TaxType;

  // Special fields
  is_pequeno_contribuyente: boolean; // FPEQ uses 5% flat, no IVA
  retencion_isr: number;            // ISR retention for FESP
  retencion_iva: number;            // IVA retention for FESP

  contact_id: string | null;
  notes: string | null;
  invoice_date: string;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FELInvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_type: TaxType;
  iva_amount: number;
  line_total: number;
  bien_o_servicio: "B" | "S";      // Bien (good) or Servicio (service)
}

// ─── Invoice Payments ──────────────────────────────────────────

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  organization_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number: string | null;
  bank_account_id: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
}

// Extended invoice with payment info
export interface FELInvoiceWithPayments extends FELInvoice {
  amount_paid: number;
  payments?: InvoicePayment[];
}

// ─── Expenses ──────────────────────────────────────────────────

export interface Expense {
  id: string;
  organization_id: string;
  account_id: string | null;
  description: string;
  amount: number;
  iva_amount: number;
  currency: string;
  exchange_rate: number;
  expense_date: string;
  category: string | null;
  status: ExpenseStatus;
  tax_type: TaxType;
  has_receipt: boolean;
  receipt_url: string | null;

  // FEL receipt linking
  fel_uuid: string | null;
  fel_serie: string | null;
  fel_numero: string | null;
  supplier_nit: string | null;
  supplier_name: string | null;
  contact_id: string | null;

  is_deductible: boolean;          // For ISR deduction tracking
  deduction_category: string | null;

  created_by: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

// Enriched expense with account info
export interface ExpenseWithAccount extends Expense {
  account_code?: string;
  account_name?: string;
}

// ─── Employees & Payroll ────────────────────────────────────────

export interface Employee {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  dpi_number: string;              // CUI/DPI: 13 digits
  nit_number: string | null;
  igss_affiliation: string | null; // IGSS affiliation number
  position: string | null;
  department: string | null;
  base_salary: number;             // Monthly salary in GTQ
  work_shift: WorkShift;
  hire_date: string;
  termination_date: string | null;
  status: EmployeeStatus;
  bank_account: string | null;
  bank_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollRun {
  id: string;
  organization_id: string;
  period_start: string;
  period_end: string;
  period_label: string;            // e.g., "Enero 2026"
  total_gross: number;
  total_igss_employee: number;     // 4.83%
  total_igss_employer: number;     // 10.67%
  total_irtra: number;             // 1% employer
  total_intecap: number;           // 1% employer
  total_isr: number;               // Employee ISR withholding
  total_deductions: number;
  total_net: number;
  total_employer_cost: number;
  status: PayrollStatus;
  created_by: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollDetail {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  base_salary: number;
  overtime_hours: number;
  overtime_amount: number;
  bonuses: number;
  commissions: number;
  gross_salary: number;

  // Deductions
  igss_employee: number;           // 4.83%
  isr_withholding: number;         // Progressive 5%/7%
  other_deductions: number;
  total_deductions: number;
  net_salary: number;

  // Employer costs
  igss_employer: number;           // 10.67%
  irtra: number;                   // 1%
  intecap: number;                 // 1%
  total_employer_cost: number;

  // Prestaciones accruals (monthly portion)
  aguinaldo_accrual: number;       // 1/12 of monthly salary
  bono14_accrual: number;          // 1/12 of monthly salary
  vacation_accrual: number;        // 15 days + 30% surcharge
  indemnizacion_accrual: number;   // 1/12 of monthly salary
}

// ─── Tax Filings ────────────────────────────────────────────────

export interface TaxFiling {
  id: string;
  organization_id: string;
  form_type: TaxFormType;
  period_year: number;
  period_month: number | null;     // null for annual/quarterly
  period_quarter: number | null;   // 1-4 for quarterly filings
  status: TaxFilingStatus;

  // IVA fields (SAT-2237)
  iva_debito: number;              // IVA collected (sales)
  iva_credito: number;             // IVA paid (purchases)
  iva_retenido: number;            // IVA withheld
  iva_a_pagar: number;             // Net IVA payable

  // ISR fields
  gross_income: number;
  deductible_expenses: number;
  taxable_income: number;
  isr_rate_applied: number;
  isr_amount: number;
  isr_prepaid: number;             // Quarterly prepayments
  isr_balance: number;             // Final balance

  // ISO fields
  net_assets: number;
  iso_base: number;                // Higher of net_assets or gross_income
  iso_amount: number;              // 1% of iso_base
  iso_credited_to_isr: number;     // Amount credited against ISR

  // Withholding fields
  retenciones_total: number;

  filed_at: string | null;
  filed_by: string | null;
  sat_confirmation: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Inventory ─────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  organization_id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  unit_price: number;
  cost_price: number;
  current_stock: number;
  min_stock: number;
  unit_of_measure: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryAdjustment {
  id: string;
  item_id: string;
  organization_id: string;
  adjustment_type: AdjustmentType;
  quantity: number;
  reason: string | null;
  reference_id: string | null;
  created_by: string;
  created_at: string;
}

// ─── Contacts ──────────────────────────────────────────────────

export interface Contact {
  id: string;
  organization_id: string;
  contact_type: ContactType;
  name: string;
  nit_number: string;              // NIT or "CF"
  dpi_number: string | null;
  address: string | null;
  municipality: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Banking & Reconciliation ──────────────────────────────────

export interface BankAccount {
  id: string;
  organization_id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  account_type: BankAccountType;
  currency: string;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankTransaction {
  id: string;
  bank_account_id: string;
  organization_id: string;
  transaction_date: string;
  description: string;
  amount: number;
  category: BankTxnCategory;
  reference: string | null;
  is_reconciled: boolean;
  matched_entry_id: string | null;
  created_at: string;
}

export interface BankReconciliation {
  id: string;
  bank_account_id: string;
  organization_id: string;
  period_start: string;
  period_end: string;
  statement_balance: number;
  book_balance: number;
  difference: number;
  status: ReconciliationStatus;
  reconciled_by: string | null;
  completed_at: string | null;
  created_at: string;
}

// ─── Notifications ─────────────────────────────────────────────

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

// ─── Audit Log ─────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ─── Consent Logs ──────────────────────────────────────────────

export interface ConsentLog {
  id: string;
  user_id: string;
  consent_type: string;
  granted: boolean;
  ip_address: string | null;
  created_at: string;
}

// ─── Recurring Transactions ────────────────────────────────────

export interface RecurringTransaction {
  id: string;
  organization_id: string;
  source_type: RecurringSourceType;
  source_id: string;
  frequency: RecurringFrequency;
  next_date: string;
  end_date: string | null;
  is_active: boolean;
  last_generated_at: string | null;
  created_by: string;
  created_at: string;
}

// ─── Multi-Currency ────────────────────────────────────────────

export interface CurrencyRate {
  id: string;
  organization_id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  effective_date: string;
  source: string | null;
  created_at: string;
}

// ─── Budgets ───────────────────────────────────────────────────

export interface Budget {
  id: string;
  organization_id: string;
  account_id: string;
  period_type: BudgetPeriodType;
  period_year: number;
  period_month: number | null;
  period_quarter: number | null;
  budgeted_amount: number;
  actual_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Fixed Assets & Depreciation (Guatemala-specific) ──────────

export interface FixedAsset {
  id: string;
  organization_id: string;
  asset_name: string;
  asset_category: string;          // Buildings, Machinery, Vehicles, etc.
  description: string | null;
  acquisition_date: string;
  acquisition_cost: number;
  residual_value: number;
  useful_life_years: number;
  depreciation_rate: number;       // Annual rate (5%, 20%, 25%, 33.33%)
  depreciation_method: DepreciationMethod;
  accumulated_depreciation: number;
  net_book_value: number;
  status: AssetStatus;
  account_id: string | null;       // Linked chart of accounts entry
  disposal_date: string | null;
  disposal_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepreciationEntry {
  id: string;
  asset_id: string;
  organization_id: string;
  period_year: number;
  period_month: number;
  depreciation_amount: number;
  accumulated_total: number;
  net_book_value: number;
  journal_entry_id: string | null;
  created_at: string;
}

// ─── Stamp Tax (Timbre Fiscal) ─────────────────────────────────

export interface StampTaxRecord {
  id: string;
  organization_id: string;
  document_type: string;
  document_reference: string | null;
  document_date: string;
  document_value: number;
  tax_rate: number;                // Usually 3%
  tax_amount: number;
  notes: string | null;
  created_by: string;
  created_at: string;
}

// ─── Supabase Database Helper Type ─────────────────────────────

export interface Database {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: Omit<Organization, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Organization, "id" | "created_at">> };
      user_profiles: { Row: UserProfile; Insert: Omit<UserProfile, "created_at">; Update: Partial<Omit<UserProfile, "id" | "created_at">> };
      organization_members: { Row: OrganizationMember; Insert: Omit<OrganizationMember, "id" | "created_at">; Update: Partial<Omit<OrganizationMember, "id" | "created_at">> };
      invitations: { Row: Invitation; Insert: Omit<Invitation, "id" | "created_at">; Update: Partial<Omit<Invitation, "id" | "created_at">> };
      chart_of_accounts: { Row: ChartOfAccount; Insert: Omit<ChartOfAccount, "id" | "created_at">; Update: Partial<Omit<ChartOfAccount, "id" | "created_at">> };
      journal_entries: { Row: JournalEntry; Insert: Omit<JournalEntry, "id" | "created_at">; Update: Partial<Omit<JournalEntry, "id" | "created_at">> };
      journal_entry_lines: { Row: JournalEntryLine; Insert: Omit<JournalEntryLine, "id">; Update: Partial<Omit<JournalEntryLine, "id">> };
      fel_invoices: { Row: FELInvoice; Insert: Omit<FELInvoice, "id" | "created_at" | "updated_at">; Update: Partial<Omit<FELInvoice, "id" | "created_at">> };
      fel_invoice_items: { Row: FELInvoiceItem; Insert: Omit<FELInvoiceItem, "id">; Update: Partial<Omit<FELInvoiceItem, "id">> };
      invoice_payments: { Row: InvoicePayment; Insert: Omit<InvoicePayment, "id" | "created_at">; Update: Partial<Omit<InvoicePayment, "id" | "created_at">> };
      expenses: { Row: Expense; Insert: Omit<Expense, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Expense, "id" | "created_at">> };
      employees: { Row: Employee; Insert: Omit<Employee, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Employee, "id" | "created_at">> };
      payroll_runs: { Row: PayrollRun; Insert: Omit<PayrollRun, "id" | "created_at" | "updated_at">; Update: Partial<Omit<PayrollRun, "id" | "created_at">> };
      payroll_details: { Row: PayrollDetail; Insert: Omit<PayrollDetail, "id">; Update: Partial<Omit<PayrollDetail, "id">> };
      tax_filings: { Row: TaxFiling; Insert: Omit<TaxFiling, "id" | "created_at" | "updated_at">; Update: Partial<Omit<TaxFiling, "id" | "created_at">> };
      inventory_items: { Row: InventoryItem; Insert: Omit<InventoryItem, "id" | "created_at" | "updated_at">; Update: Partial<Omit<InventoryItem, "id" | "created_at">> };
      inventory_adjustments: { Row: InventoryAdjustment; Insert: Omit<InventoryAdjustment, "id" | "created_at">; Update: Partial<Omit<InventoryAdjustment, "id" | "created_at">> };
      contacts: { Row: Contact; Insert: Omit<Contact, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Contact, "id" | "created_at">> };
      bank_accounts: { Row: BankAccount; Insert: Omit<BankAccount, "id" | "created_at" | "updated_at">; Update: Partial<Omit<BankAccount, "id" | "created_at">> };
      bank_transactions: { Row: BankTransaction; Insert: Omit<BankTransaction, "id" | "created_at">; Update: Partial<Omit<BankTransaction, "id" | "created_at">> };
      bank_reconciliations: { Row: BankReconciliation; Insert: Omit<BankReconciliation, "id" | "created_at">; Update: Partial<Omit<BankReconciliation, "id" | "created_at">> };
      notifications: { Row: Notification; Insert: Omit<Notification, "id" | "created_at">; Update: Partial<Omit<Notification, "id" | "created_at">> };
      audit_logs: { Row: AuditLog; Insert: Omit<AuditLog, "id" | "created_at">; Update: never };
      consent_logs: { Row: ConsentLog; Insert: Omit<ConsentLog, "id" | "created_at">; Update: never };
      recurring_transactions: { Row: RecurringTransaction; Insert: Omit<RecurringTransaction, "id" | "created_at">; Update: Partial<Omit<RecurringTransaction, "id" | "created_at">> };
      currency_rates: { Row: CurrencyRate; Insert: Omit<CurrencyRate, "id" | "created_at">; Update: Partial<Omit<CurrencyRate, "id" | "created_at">> };
      budgets: { Row: Budget; Insert: Omit<Budget, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Budget, "id" | "created_at">> };
      fixed_assets: { Row: FixedAsset; Insert: Omit<FixedAsset, "id" | "created_at" | "updated_at">; Update: Partial<Omit<FixedAsset, "id" | "created_at">> };
      depreciation_entries: { Row: DepreciationEntry; Insert: Omit<DepreciationEntry, "id" | "created_at">; Update: Partial<Omit<DepreciationEntry, "id" | "created_at">> };
      stamp_tax_records: { Row: StampTaxRecord; Insert: Omit<StampTaxRecord, "id" | "created_at">; Update: Partial<Omit<StampTaxRecord, "id" | "created_at">> };
    };
  };
}
