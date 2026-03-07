-- ============================================================
-- FiniTax Guatemala — Complete Database Schema
-- Migration 001: Core tables, FEL invoicing, payroll, taxes,
-- inventory, banking, audit, depreciation, stamp tax
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ORGANIZATIONS ─────────────────────────────────────────────

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  nit_number TEXT NOT NULL UNIQUE,
  contribuyente_type TEXT NOT NULL DEFAULT 'GENERAL' CHECK (contribuyente_type IN ('GENERAL', 'PEQUENO')),
  isr_regime TEXT NOT NULL DEFAULT 'UTILIDADES' CHECK (isr_regime IN ('UTILIDADES', 'SIMPLIFICADO')),
  industry_code TEXT,
  address TEXT,
  municipality TEXT,
  department TEXT,
  phone TEXT,
  email TEXT,
  fel_certificador TEXT,
  fel_nit_certificador TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── USER PROFILES ─────────────────────────────────────────────

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  dpi_number TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORGANIZATION MEMBERS ──────────────────────────────────────

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('ADMIN', 'EMPLOYEE', 'ACCOUNTANT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- ─── INVITATIONS ───────────────────────────────────────────────

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('ADMIN', 'EMPLOYEE', 'ACCOUNTANT')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CHART OF ACCOUNTS ────────────────────────────────────────

CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'COST', 'EXPENSE')),
  parent_account_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, account_code)
);

-- ─── JOURNAL ENTRIES ───────────────────────────────────────────

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  reference TEXT,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  debit DECIMAL(15,2) NOT NULL DEFAULT 0,
  credit DECIMAL(15,2) NOT NULL DEFAULT 0,
  description TEXT
);

-- ─── CONTACTS ──────────────────────────────────────────────────

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('CLIENT', 'VENDOR', 'BOTH')),
  name TEXT NOT NULL,
  nit_number TEXT NOT NULL,
  dpi_number TEXT,
  address TEXT,
  municipality TEXT,
  department TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── FEL INVOICES (Guatemala Electronic Invoicing) ─────────────

CREATE TABLE fel_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  fel_type TEXT NOT NULL CHECK (fel_type IN ('FACT', 'FCAM', 'FPEQ', 'FCAP', 'FESP', 'NABN', 'NDEB', 'RECI', 'RDON', 'APTS')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CERTIFIED', 'AUTHORIZED', 'REJECTED', 'VOIDED')),
  payment_status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PARTIAL', 'PAID')),

  -- FEL Certification
  fel_uuid TEXT,
  fel_serie TEXT,
  fel_numero TEXT,
  fel_fecha_certificacion TIMESTAMPTZ,
  fel_certificador_nit TEXT,
  fel_xml_url TEXT,

  -- Client
  client_name TEXT NOT NULL,
  client_nit TEXT NOT NULL DEFAULT 'CF',
  client_address TEXT,
  client_email TEXT,

  -- Money
  currency TEXT NOT NULL DEFAULT 'GTQ',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_type TEXT NOT NULL DEFAULT 'GRAVADA' CHECK (tax_type IN ('GRAVADA', 'EXENTA', 'NO_SUJETA')),

  -- Special
  is_pequeno_contribuyente BOOLEAN NOT NULL DEFAULT FALSE,
  retencion_isr DECIMAL(15,2) NOT NULL DEFAULT 0,
  retencion_iva DECIMAL(15,2) NOT NULL DEFAULT 0,

  contact_id UUID REFERENCES contacts(id),
  notes TEXT,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fel_invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES fel_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(12,4) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_type TEXT NOT NULL DEFAULT 'GRAVADA' CHECK (tax_type IN ('GRAVADA', 'EXENTA', 'NO_SUJETA')),
  iva_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  line_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  bien_o_servicio TEXT NOT NULL DEFAULT 'B' CHECK (bien_o_servicio IN ('B', 'S'))
);

-- ─── EXPENSES ──────────────────────────────────────────────────

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES chart_of_accounts(id),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  iva_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GTQ',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  expense_date DATE NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'REJECTED')),
  tax_type TEXT NOT NULL DEFAULT 'GRAVADA' CHECK (tax_type IN ('GRAVADA', 'EXENTA', 'NO_SUJETA')),
  has_receipt BOOLEAN NOT NULL DEFAULT FALSE,
  receipt_url TEXT,

  -- FEL receipt linking
  fel_uuid TEXT,
  fel_serie TEXT,
  fel_numero TEXT,
  supplier_nit TEXT,
  supplier_name TEXT,
  contact_id UUID REFERENCES contacts(id),

  is_deductible BOOLEAN NOT NULL DEFAULT TRUE,
  deduction_category TEXT,

  created_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── EMPLOYEES ─────────────────────────────────────────────────

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dpi_number TEXT NOT NULL,
  nit_number TEXT,
  igss_affiliation TEXT,
  position TEXT,
  department TEXT,
  base_salary DECIMAL(15,2) NOT NULL,
  work_shift TEXT NOT NULL DEFAULT 'DIURNA' CHECK (work_shift IN ('DIURNA', 'MIXTA', 'NOCTURNA')),
  hire_date DATE NOT NULL,
  termination_date DATE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'TERMINATED')),
  bank_account TEXT,
  bank_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, dpi_number)
);

-- ─── PAYROLL ───────────────────────────────────────────────────

CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_label TEXT NOT NULL,
  total_gross DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_igss_employee DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_igss_employer DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_irtra DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_intecap DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_isr DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_deductions DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_net DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_employer_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'PAID')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payroll_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  base_salary DECIMAL(15,2) NOT NULL,
  overtime_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  overtime_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  bonuses DECIMAL(15,2) NOT NULL DEFAULT 0,
  commissions DECIMAL(15,2) NOT NULL DEFAULT 0,
  gross_salary DECIMAL(15,2) NOT NULL,

  -- Deductions
  igss_employee DECIMAL(15,2) NOT NULL DEFAULT 0,
  isr_withholding DECIMAL(15,2) NOT NULL DEFAULT 0,
  other_deductions DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_deductions DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_salary DECIMAL(15,2) NOT NULL,

  -- Employer costs
  igss_employer DECIMAL(15,2) NOT NULL DEFAULT 0,
  irtra DECIMAL(15,2) NOT NULL DEFAULT 0,
  intecap DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_employer_cost DECIMAL(15,2) NOT NULL DEFAULT 0,

  -- Prestaciones accruals
  aguinaldo_accrual DECIMAL(15,2) NOT NULL DEFAULT 0,
  bono14_accrual DECIMAL(15,2) NOT NULL DEFAULT 0,
  vacation_accrual DECIMAL(15,2) NOT NULL DEFAULT 0,
  indemnizacion_accrual DECIMAL(15,2) NOT NULL DEFAULT 0
);

-- ─── TAX FILINGS ───────────────────────────────────────────────

CREATE TABLE tax_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL CHECK (form_type IN ('IVA_MENSUAL', 'ISR_TRIMESTRAL', 'ISR_MENSUAL', 'ISR_ANUAL', 'ISO_TRIMESTRAL', 'RETENCIONES_ISR')),
  period_year INTEGER NOT NULL,
  period_month INTEGER,
  period_quarter INTEGER,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CALCULATED', 'FILED', 'ACCEPTED', 'REJECTED')),

  -- IVA fields
  iva_debito DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_credito DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_retenido DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_a_pagar DECIMAL(15,2) NOT NULL DEFAULT 0,

  -- ISR fields
  gross_income DECIMAL(15,2) NOT NULL DEFAULT 0,
  deductible_expenses DECIMAL(15,2) NOT NULL DEFAULT 0,
  taxable_income DECIMAL(15,2) NOT NULL DEFAULT 0,
  isr_rate_applied DECIMAL(5,2) NOT NULL DEFAULT 0,
  isr_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  isr_prepaid DECIMAL(15,2) NOT NULL DEFAULT 0,
  isr_balance DECIMAL(15,2) NOT NULL DEFAULT 0,

  -- ISO fields
  net_assets DECIMAL(15,2) NOT NULL DEFAULT 0,
  iso_base DECIMAL(15,2) NOT NULL DEFAULT 0,
  iso_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  iso_credited_to_isr DECIMAL(15,2) NOT NULL DEFAULT 0,

  -- Withholding fields
  retenciones_total DECIMAL(15,2) NOT NULL DEFAULT 0,

  filed_at TIMESTAMPTZ,
  filed_by UUID REFERENCES auth.users(id),
  sat_confirmation TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INVENTORY ─────────────────────────────────────────────────

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_stock DECIMAL(12,4) NOT NULL DEFAULT 0,
  min_stock DECIMAL(12,4) NOT NULL DEFAULT 0,
  unit_of_measure TEXT NOT NULL DEFAULT 'UND',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, sku)
);

CREATE TABLE inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity DECIMAL(12,4) NOT NULL,
  reason TEXT,
  reference_id TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── BANKING ───────────────────────────────────────────────────

CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'CHECKING' CHECK (account_type IN ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'OTHER')),
  currency TEXT NOT NULL DEFAULT 'GTQ',
  current_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'OTHER' CHECK (category IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'FEE', 'INTEREST', 'OTHER')),
  reference TEXT,
  is_reconciled BOOLEAN NOT NULL DEFAULT FALSE,
  matched_entry_id UUID REFERENCES journal_entries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  statement_balance DECIMAL(15,2) NOT NULL,
  book_balance DECIMAL(15,2) NOT NULL,
  difference DECIMAL(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  reconciled_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── NOTIFICATIONS ─────────────────────────────────────────────

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AUDIT LOGS ────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CONSENT LOGS ──────────────────────────────────────────────

CREATE TABLE consent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RECURRING TRANSACTIONS ────────────────────────────────────

CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('INVOICE', 'EXPENSE')),
  source_id UUID NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL')),
  next_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_generated_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── MULTI-CURRENCY ────────────────────────────────────────────

CREATE TABLE currency_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(12,6) NOT NULL,
  effective_date DATE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── BUDGETS ───────────────────────────────────────────────────

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  period_type TEXT NOT NULL CHECK (period_type IN ('MONTHLY', 'QUARTERLY', 'ANNUAL')),
  period_year INTEGER NOT NULL,
  period_month INTEGER,
  period_quarter INTEGER,
  budgeted_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── FIXED ASSETS & DEPRECIATION (Guatemala-specific) ──────────

CREATE TABLE fixed_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  asset_category TEXT NOT NULL,
  description TEXT,
  acquisition_date DATE NOT NULL,
  acquisition_cost DECIMAL(15,2) NOT NULL,
  residual_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  useful_life_years DECIMAL(5,2) NOT NULL,
  depreciation_rate DECIMAL(5,2) NOT NULL,
  depreciation_method TEXT NOT NULL DEFAULT 'STRAIGHT_LINE',
  accumulated_depreciation DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_book_value DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FULLY_DEPRECIATED', 'DISPOSED')),
  account_id UUID REFERENCES chart_of_accounts(id),
  disposal_date DATE,
  disposal_amount DECIMAL(15,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE depreciation_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES fixed_assets(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,
  depreciation_amount DECIMAL(15,2) NOT NULL,
  accumulated_total DECIMAL(15,2) NOT NULL,
  net_book_value DECIMAL(15,2) NOT NULL,
  journal_entry_id UUID REFERENCES journal_entries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── STAMP TAX RECORDS (Timbre Fiscal 3%) ──────────────────────

CREATE TABLE stamp_tax_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_reference TEXT,
  document_date DATE NOT NULL,
  document_value DECIMAL(15,2) NOT NULL,
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.03,
  tax_amount DECIMAL(15,2) NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── FUNCTIONS ─────────────────────────────────────────────────

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get user's organizations (for RLS)
CREATE OR REPLACE FUNCTION get_user_orgs()
RETURNS SETOF UUID AS $$
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Create organization with admin member
CREATE OR REPLACE FUNCTION create_organization_with_admin(
  p_name TEXT,
  p_nit TEXT,
  p_contribuyente_type TEXT DEFAULT 'GENERAL',
  p_isr_regime TEXT DEFAULT 'UTILIDADES',
  p_industry_code TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_municipality TEXT DEFAULT NULL,
  p_department TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  INSERT INTO organizations (name, nit_number, contribuyente_type, isr_regime, industry_code, address, municipality, department, phone, email)
  VALUES (p_name, p_nit, p_contribuyente_type, p_isr_regime, p_industry_code, p_address, p_municipality, p_department, p_phone, p_email)
  RETURNING id INTO v_org_id;

  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (v_org_id, auth.uid(), 'ADMIN');

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── TRIGGERS ──────────────────────────────────────────────────

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_fel_invoices_updated_at
  BEFORE UPDATE ON fel_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payroll_runs_updated_at
  BEFORE UPDATE ON payroll_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tax_filings_updated_at
  BEFORE UPDATE ON tax_filings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_fixed_assets_updated_at
  BEFORE UPDATE ON fixed_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── INDEXES ───────────────────────────────────────────────────

CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_fel_invoices_org ON fel_invoices(organization_id);
CREATE INDEX idx_fel_invoices_status ON fel_invoices(status);
CREATE INDEX idx_fel_invoices_date ON fel_invoices(invoice_date);
CREATE INDEX idx_fel_invoices_client_nit ON fel_invoices(client_nit);
CREATE INDEX idx_fel_invoice_items_invoice ON fel_invoice_items(invoice_id);
CREATE INDEX idx_expenses_org ON expenses(organization_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_employees_org ON employees(organization_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_payroll_runs_org ON payroll_runs(organization_id);
CREATE INDEX idx_payroll_details_run ON payroll_details(payroll_run_id);
CREATE INDEX idx_tax_filings_org ON tax_filings(organization_id);
CREATE INDEX idx_tax_filings_type ON tax_filings(form_type);
CREATE INDEX idx_inventory_items_org ON inventory_items(organization_id);
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_nit ON contacts(nit_number);
CREATE INDEX idx_bank_transactions_account ON bank_transactions(bank_account_id);
CREATE INDEX idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_journal_entries_org ON journal_entries(organization_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_chart_of_accounts_org ON chart_of_accounts(organization_id);
CREATE INDEX idx_fixed_assets_org ON fixed_assets(organization_id);
CREATE INDEX idx_depreciation_entries_asset ON depreciation_entries(asset_id);
CREATE INDEX idx_stamp_tax_org ON stamp_tax_records(organization_id);
CREATE INDEX idx_recurring_org ON recurring_transactions(organization_id);
CREATE INDEX idx_currency_rates_org ON currency_rates(organization_id);
CREATE INDEX idx_budgets_org ON budgets(organization_id);
CREATE INDEX idx_invitations_org ON invitations(organization_id);
CREATE INDEX idx_invitations_email ON invitations(email);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fel_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fel_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciation_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamp_tax_records ENABLE ROW LEVEL SECURITY;

-- User profiles: users can read/update own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (id = auth.uid());

-- Organizations: members can view their orgs
CREATE POLICY "Members can view organizations" ON organizations FOR SELECT USING (id IN (SELECT get_user_orgs()));
CREATE POLICY "Members can update organizations" ON organizations FOR UPDATE USING (id IN (SELECT get_user_orgs()));
CREATE POLICY "Authenticated users can create organizations" ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Organization members
CREATE POLICY "Members can view org members" ON organization_members FOR SELECT USING (organization_id IN (SELECT get_user_orgs()));
CREATE POLICY "Members can insert org members" ON organization_members FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_orgs()));
CREATE POLICY "Members can delete org members" ON organization_members FOR DELETE USING (organization_id IN (SELECT get_user_orgs()));

-- Macro for org-scoped tables (SELECT/INSERT/UPDATE/DELETE)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'chart_of_accounts', 'journal_entries', 'contacts', 'fel_invoices',
      'expenses', 'employees', 'payroll_runs', 'tax_filings',
      'inventory_items', 'inventory_adjustments', 'bank_accounts',
      'bank_transactions', 'bank_reconciliations', 'audit_logs',
      'recurring_transactions', 'currency_rates', 'budgets',
      'fixed_assets', 'depreciation_entries', 'stamp_tax_records'
    ])
  LOOP
    EXECUTE format('CREATE POLICY "Org members can select %1$s" ON %1$s FOR SELECT USING (organization_id IN (SELECT get_user_orgs()))', tbl);
    EXECUTE format('CREATE POLICY "Org members can insert %1$s" ON %1$s FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_orgs()))', tbl);
    EXECUTE format('CREATE POLICY "Org members can update %1$s" ON %1$s FOR UPDATE USING (organization_id IN (SELECT get_user_orgs()))', tbl);
    EXECUTE format('CREATE POLICY "Org members can delete %1$s" ON %1$s FOR DELETE USING (organization_id IN (SELECT get_user_orgs()))', tbl);
  END LOOP;
END $$;

-- Journal entry lines: via parent journal entry
CREATE POLICY "Org members can select journal_entry_lines" ON journal_entry_lines FOR SELECT
  USING (journal_entry_id IN (SELECT id FROM journal_entries WHERE organization_id IN (SELECT get_user_orgs())));
CREATE POLICY "Org members can insert journal_entry_lines" ON journal_entry_lines FOR INSERT
  WITH CHECK (journal_entry_id IN (SELECT id FROM journal_entries WHERE organization_id IN (SELECT get_user_orgs())));
CREATE POLICY "Org members can update journal_entry_lines" ON journal_entry_lines FOR UPDATE
  USING (journal_entry_id IN (SELECT id FROM journal_entries WHERE organization_id IN (SELECT get_user_orgs())));
CREATE POLICY "Org members can delete journal_entry_lines" ON journal_entry_lines FOR DELETE
  USING (journal_entry_id IN (SELECT id FROM journal_entries WHERE organization_id IN (SELECT get_user_orgs())));

-- FEL invoice items: via parent invoice
CREATE POLICY "Org members can select fel_invoice_items" ON fel_invoice_items FOR SELECT
  USING (invoice_id IN (SELECT id FROM fel_invoices WHERE organization_id IN (SELECT get_user_orgs())));
CREATE POLICY "Org members can insert fel_invoice_items" ON fel_invoice_items FOR INSERT
  WITH CHECK (invoice_id IN (SELECT id FROM fel_invoices WHERE organization_id IN (SELECT get_user_orgs())));
CREATE POLICY "Org members can update fel_invoice_items" ON fel_invoice_items FOR UPDATE
  USING (invoice_id IN (SELECT id FROM fel_invoices WHERE organization_id IN (SELECT get_user_orgs())));
CREATE POLICY "Org members can delete fel_invoice_items" ON fel_invoice_items FOR DELETE
  USING (invoice_id IN (SELECT id FROM fel_invoices WHERE organization_id IN (SELECT get_user_orgs())));

-- Payroll details: via parent payroll run
CREATE POLICY "Org members can select payroll_details" ON payroll_details FOR SELECT
  USING (payroll_run_id IN (SELECT id FROM payroll_runs WHERE organization_id IN (SELECT get_user_orgs())));
CREATE POLICY "Org members can insert payroll_details" ON payroll_details FOR INSERT
  WITH CHECK (payroll_run_id IN (SELECT id FROM payroll_runs WHERE organization_id IN (SELECT get_user_orgs())));
CREATE POLICY "Org members can update payroll_details" ON payroll_details FOR UPDATE
  USING (payroll_run_id IN (SELECT id FROM payroll_runs WHERE organization_id IN (SELECT get_user_orgs())));
CREATE POLICY "Org members can delete payroll_details" ON payroll_details FOR DELETE
  USING (payroll_run_id IN (SELECT id FROM payroll_runs WHERE organization_id IN (SELECT get_user_orgs())));

-- Notifications: users see own
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Org members can insert notifications" ON notifications FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_orgs()));

-- Consent logs: users see own
CREATE POLICY "Users can view own consent" ON consent_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert consent" ON consent_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- Invitations
CREATE POLICY "Org members can view invitations" ON invitations FOR SELECT USING (organization_id IN (SELECT get_user_orgs()) OR email = auth.email());
CREATE POLICY "Org members can create invitations" ON invitations FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_orgs()));
CREATE POLICY "Org members can update invitations" ON invitations FOR UPDATE USING (organization_id IN (SELECT get_user_orgs()) OR email = auth.email());
