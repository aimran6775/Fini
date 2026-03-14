-- 005: Atomic bank balance adjustment (prevents race conditions)
-- Called by banking.ts instead of read-then-write pattern

CREATE OR REPLACE FUNCTION adjust_bank_balance(p_account_id UUID, p_amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bank_accounts
  SET current_balance = current_balance + p_amount,
      updated_at = NOW()
  WHERE id = p_account_id;
END;
$$;
