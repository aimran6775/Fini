-- Ensure the create_organization_with_admin function exists with proper SECURITY DEFINER
-- This allows new users to create organizations even with RLS enabled

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
  -- Insert the organization (bypasses RLS via SECURITY DEFINER)
  INSERT INTO organizations (name, nit_number, contribuyente_type, isr_regime, industry_code, address, municipality, department, phone, email)
  VALUES (p_name, p_nit, p_contribuyente_type, p_isr_regime, p_industry_code, p_address, p_municipality, p_department, p_phone, p_email)
  RETURNING id INTO v_org_id;

  -- Add the calling user as admin (bypasses RLS via SECURITY DEFINER)
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (v_org_id, auth.uid(), 'ADMIN');

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_organization_with_admin TO authenticated;
