-- ============================================================================
-- FiniTax Guatemala — Personal Tax Tracking
-- Migration: 004_personal_tax.sql
-- Purpose: Add tables for individual/personal tax management
-- ============================================================================

-- ─── Personal Income Sources ───────────────────────────────────────────────
-- Track different income sources for individuals (Rentas de Trabajo, Rentas de Capital, etc.)

CREATE TABLE IF NOT EXISTS personal_income (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Income classification (Guatemala ISR categories)
  income_type TEXT NOT NULL CHECK (income_type IN (
    'TRABAJO_DEPENDIENTE',     -- Salarios, sueldos (bajo relación de dependencia)
    'TRABAJO_INDEPENDIENTE',   -- Honorarios, servicios profesionales
    'CAPITAL_MOBILIARIO',      -- Dividendos, intereses, regalías
    'CAPITAL_INMOBILIARIO',    -- Alquileres de inmuebles
    'GANANCIAS_CAPITAL',       -- Venta de activos, plusvalías
    'OTROS'                    -- Otros ingresos gravados
  )),
  
  description TEXT NOT NULL,
  source_name TEXT,                    -- Employer name or income source
  source_nit TEXT,                     -- NIT of payer
  
  -- Amounts
  gross_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  isr_withheld DECIMAL(15,2) NOT NULL DEFAULT 0,  -- Retenciones ISR aplicadas
  igss_withheld DECIMAL(15,2) NOT NULL DEFAULT 0, -- IGSS descontado (si aplica)
  net_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Period
  income_date DATE NOT NULL,
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,
  
  -- Documentation
  constancia_numero TEXT,              -- Número de constancia de retención
  has_constancia BOOLEAN DEFAULT false,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_personal_income_org ON personal_income(organization_id);
CREATE INDEX idx_personal_income_user ON personal_income(user_id);
CREATE INDEX idx_personal_income_period ON personal_income(period_year, period_month);
CREATE INDEX idx_personal_income_type ON personal_income(income_type);

-- ─── Personal Deductions ───────────────────────────────────────────────────
-- Track personal deductions allowed under Guatemala ISR law

CREATE TABLE IF NOT EXISTS personal_deductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Deduction type (per Guatemala ISR regulations)
  deduction_type TEXT NOT NULL CHECK (deduction_type IN (
    'STANDARD',                -- Deducción fija Q48,000/año
    'IVA_PERSONAL',            -- IVA pagado en compras personales (max 12% de renta)
    'DONACIONES',              -- Donaciones a entidades autorizadas (max 5% de renta)
    'SEGURO_MEDICO',           -- Primas de seguro médico
    'PLAN_PREVISION',          -- Planes de previsión
    'CUOTAS_IGSS',             -- Cuotas IGSS empleado
    'MONTEPÍO',                -- Montepío y clases pasivas
    'VIVIENDA',                -- Intereses de préstamo de vivienda
    'EDUCACION',               -- Gastos de educación propia
    'OTROS'                    -- Otras deducciones autorizadas
  )),
  
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Documentation
  deduction_date DATE NOT NULL,
  period_year INTEGER NOT NULL,
  document_ref TEXT,                   -- Factura o documento de soporte
  vendor_nit TEXT,                     -- NIT del proveedor
  
  is_verified BOOLEAN DEFAULT false,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_personal_deductions_org ON personal_deductions(organization_id);
CREATE INDEX idx_personal_deductions_user ON personal_deductions(user_id);
CREATE INDEX idx_personal_deductions_year ON personal_deductions(period_year);

-- ─── ISR Withholdings Registry (Retenciones) ────────────────────────────────
-- Track all ISR withholdings received/made for annual reconciliation

CREATE TABLE IF NOT EXISTS isr_retenciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Direction: received (nos retuvieron) or made (nosotros retuvimos)
  direction TEXT NOT NULL CHECK (direction IN ('RECEIVED', 'MADE')),
  
  -- Retention details
  retention_type TEXT NOT NULL CHECK (retention_type IN (
    'TRABAJO',                 -- Retención sobre salarios
    'SERVICIOS',               -- Retención servicios profesionales (5%)
    'ARRENDAMIENTO',           -- Retención sobre alquileres
    'DIVIDENDOS',              -- Retención sobre dividendos (5%)
    'INTERESES',               -- Retención sobre intereses
    'OTROS'                    -- Otras retenciones
  )),
  
  -- Parties
  retenedor_name TEXT NOT NULL,        -- Who withheld
  retenedor_nit TEXT NOT NULL,
  beneficiario_name TEXT,              -- Who received payment (if we withheld)
  beneficiario_nit TEXT,
  
  -- Amounts
  gross_amount DECIMAL(15,2) NOT NULL DEFAULT 0,  -- Monto bruto del servicio/pago
  retention_rate DECIMAL(5,4) NOT NULL DEFAULT 0, -- Tasa aplicada (0.05, 0.065, etc.)
  retention_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Document
  constancia_numero TEXT,
  constancia_date DATE,
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,
  
  -- Linking
  expense_id UUID REFERENCES expenses(id),        -- If linked to an expense
  invoice_id UUID REFERENCES fel_invoices(id),    -- If linked to an invoice
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_isr_retenciones_org ON isr_retenciones(organization_id);
CREATE INDEX idx_isr_retenciones_direction ON isr_retenciones(direction);
CREATE INDEX idx_isr_retenciones_period ON isr_retenciones(period_year, period_month);

-- ─── Personal Tax Returns (Declaración Anual) ───────────────────────────────
-- Store annual tax return calculations for individuals

CREATE TABLE IF NOT EXISTS personal_tax_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  period_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CALCULATED', 'FILED', 'ACCEPTED')),
  
  -- Income summary
  total_trabajo_dependiente DECIMAL(15,2) DEFAULT 0,
  total_trabajo_independiente DECIMAL(15,2) DEFAULT 0,
  total_capital_mobiliario DECIMAL(15,2) DEFAULT 0,
  total_capital_inmobiliario DECIMAL(15,2) DEFAULT 0,
  total_ganancias_capital DECIMAL(15,2) DEFAULT 0,
  total_otros DECIMAL(15,2) DEFAULT 0,
  gross_income_total DECIMAL(15,2) DEFAULT 0,
  
  -- Deductions summary
  deduccion_fija DECIMAL(15,2) DEFAULT 48000,     -- Q48,000 standard deduction
  iva_personal DECIMAL(15,2) DEFAULT 0,
  donaciones DECIMAL(15,2) DEFAULT 0,
  cuotas_igss DECIMAL(15,2) DEFAULT 0,
  otras_deducciones DECIMAL(15,2) DEFAULT 0,
  total_deducciones DECIMAL(15,2) DEFAULT 0,
  
  -- Calculation
  renta_imponible DECIMAL(15,2) DEFAULT 0,
  isr_causado DECIMAL(15,2) DEFAULT 0,
  isr_retenido_total DECIMAL(15,2) DEFAULT 0,
  isr_a_pagar DECIMAL(15,2) DEFAULT 0,
  isr_a_favor DECIMAL(15,2) DEFAULT 0,
  
  -- Filing info
  filed_at TIMESTAMPTZ,
  sat_confirmation TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id, period_year)
);

-- Index
CREATE INDEX idx_personal_tax_returns_org ON personal_tax_returns(organization_id);
CREATE INDEX idx_personal_tax_returns_user ON personal_tax_returns(user_id);
CREATE INDEX idx_personal_tax_returns_year ON personal_tax_returns(period_year);

-- ─── Add organization type for personal vs business ────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'org_type'
  ) THEN
    ALTER TABLE organizations ADD COLUMN org_type TEXT DEFAULT 'BUSINESS' 
      CHECK (org_type IN ('BUSINESS', 'INDIVIDUAL'));
  END IF;
END $$;

-- ─── Row Level Security ────────────────────────────────────────────────────

ALTER TABLE personal_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE isr_retenciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_tax_returns ENABLE ROW LEVEL SECURITY;

-- Personal Income policies
CREATE POLICY "Users can view personal income in their org"
  ON personal_income FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert personal income in their org"
  ON personal_income FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update personal income in their org"
  ON personal_income FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete personal income in their org"
  ON personal_income FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Personal Deductions policies
CREATE POLICY "Users can view personal deductions in their org"
  ON personal_deductions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert personal deductions in their org"
  ON personal_deductions FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update personal deductions in their org"
  ON personal_deductions FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete personal deductions in their org"
  ON personal_deductions FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- ISR Retenciones policies
CREATE POLICY "Users can view isr retenciones in their org"
  ON isr_retenciones FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert isr retenciones in their org"
  ON isr_retenciones FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update isr retenciones in their org"
  ON isr_retenciones FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete isr retenciones in their org"
  ON isr_retenciones FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Personal Tax Returns policies
CREATE POLICY "Users can view personal tax returns in their org"
  ON personal_tax_returns FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert personal tax returns in their org"
  ON personal_tax_returns FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update personal tax returns in their org"
  ON personal_tax_returns FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete personal tax returns in their org"
  ON personal_tax_returns FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- ─── Updated at trigger ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_personal_tax_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER personal_income_updated_at
  BEFORE UPDATE ON personal_income
  FOR EACH ROW EXECUTE FUNCTION update_personal_tax_updated_at();

CREATE TRIGGER personal_deductions_updated_at
  BEFORE UPDATE ON personal_deductions
  FOR EACH ROW EXECUTE FUNCTION update_personal_tax_updated_at();

CREATE TRIGGER isr_retenciones_updated_at
  BEFORE UPDATE ON isr_retenciones
  FOR EACH ROW EXECUTE FUNCTION update_personal_tax_updated_at();

CREATE TRIGGER personal_tax_returns_updated_at
  BEFORE UPDATE ON personal_tax_returns
  FOR EACH ROW EXECUTE FUNCTION update_personal_tax_updated_at();
