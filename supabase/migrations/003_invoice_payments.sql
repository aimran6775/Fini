-- ============================================================
-- FiniTax Guatemala — Invoice Payments Table
-- Migration 003: Track partial and full payments on invoices
-- ============================================================

-- ─── INVOICE PAYMENTS ──────────────────────────────────────────

CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES fel_invoices(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'EFECTIVO' CHECK (payment_method IN ('EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'DEPOSITO', 'OTRO')),
  
  -- Reference info
  reference_number TEXT,
  bank_account_id UUID REFERENCES bank_accounts(id),
  notes TEXT,
  
  -- Audit
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_invoice_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX idx_invoice_payments_org ON invoice_payments(organization_id);
CREATE INDEX idx_invoice_payments_date ON invoice_payments(payment_date);

-- Function to update invoice payment status
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  invoice_total DECIMAL(15,2);
  total_paid DECIMAL(15,2);
BEGIN
  -- Get invoice total
  SELECT total INTO invoice_total
  FROM fel_invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Get sum of all payments
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM invoice_payments
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Update payment status
  UPDATE fel_invoices
  SET 
    payment_status = CASE
      WHEN total_paid >= invoice_total THEN 'PAID'
      WHEN total_paid > 0 THEN 'PARTIAL'
      ELSE 'UNPAID'
    END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update payment status
CREATE TRIGGER trg_invoice_payment_insert
AFTER INSERT ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_payment_status();

CREATE TRIGGER trg_invoice_payment_update
AFTER UPDATE ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_payment_status();

CREATE TRIGGER trg_invoice_payment_delete
AFTER DELETE ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_payment_status();

-- Add amount_paid column to fel_invoices for quick lookups
ALTER TABLE fel_invoices ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(15,2) NOT NULL DEFAULT 0;

-- Function to keep amount_paid in sync
CREATE OR REPLACE FUNCTION sync_invoice_amount_paid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE fel_invoices
  SET amount_paid = (
    SELECT COALESCE(SUM(amount), 0)
    FROM invoice_payments
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
  )
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for amount_paid sync
CREATE TRIGGER trg_sync_amount_paid_insert
AFTER INSERT ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION sync_invoice_amount_paid();

CREATE TRIGGER trg_sync_amount_paid_update
AFTER UPDATE ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION sync_invoice_amount_paid();

CREATE TRIGGER trg_sync_amount_paid_delete
AFTER DELETE ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION sync_invoice_amount_paid();

-- RLS Policies
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their organization"
  ON invoice_payments FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments for their organization"
  ON invoice_payments FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update payments"
  ON invoice_payments FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('ADMIN', 'ACCOUNTANT')
    )
  );

CREATE POLICY "Admins can delete payments"
  ON invoice_payments FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );
