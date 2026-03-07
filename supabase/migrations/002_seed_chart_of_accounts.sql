-- ============================================================
-- FiniTax Guatemala — Seed Chart of Accounts
-- Localized for Guatemala NIIF/PCGA standards
-- ============================================================

-- This function seeds the chart of accounts for a new organization
CREATE OR REPLACE FUNCTION seed_chart_of_accounts(p_org_id UUID)
RETURNS void AS $$
BEGIN
  -- ─── 1. ACTIVOS ──────────────────────────────────────────────
  INSERT INTO chart_of_accounts (organization_id, account_code, account_name, account_type) VALUES
  (p_org_id, '1', 'ACTIVOS', 'ASSET'),
  (p_org_id, '1.1', 'Activo Corriente', 'ASSET'),
  (p_org_id, '1.1.01', 'Caja General', 'ASSET'),
  (p_org_id, '1.1.02', 'Caja Chica', 'ASSET'),
  (p_org_id, '1.1.03', 'Bancos', 'ASSET'),
  (p_org_id, '1.1.04', 'Inversiones a Corto Plazo', 'ASSET'),
  (p_org_id, '1.1.05', 'Cuentas por Cobrar', 'ASSET'),
  (p_org_id, '1.1.06', 'Documentos por Cobrar', 'ASSET'),
  (p_org_id, '1.1.07', 'IVA por Cobrar (Crédito Fiscal)', 'ASSET'),
  (p_org_id, '1.1.08', 'ISR Trimestral Pagado por Anticipado', 'ASSET'),
  (p_org_id, '1.1.09', 'ISO Pagado por Anticipado', 'ASSET'),
  (p_org_id, '1.1.10', 'Inventario de Mercaderías', 'ASSET'),
  (p_org_id, '1.1.11', 'Inventario de Materia Prima', 'ASSET'),
  (p_org_id, '1.1.12', 'Inventario de Producto Terminado', 'ASSET'),
  (p_org_id, '1.1.13', 'Anticipos a Proveedores', 'ASSET'),
  (p_org_id, '1.1.14', 'Estimación para Cuentas Incobrables', 'ASSET'),
  (p_org_id, '1.1.15', 'Otros Activos Corrientes', 'ASSET'),

  (p_org_id, '1.2', 'Activo No Corriente', 'ASSET'),
  (p_org_id, '1.2.01', 'Terrenos', 'ASSET'),
  (p_org_id, '1.2.02', 'Edificios e Instalaciones', 'ASSET'),
  (p_org_id, '1.2.03', 'Depreciación Acumulada Edificios', 'ASSET'),
  (p_org_id, '1.2.04', 'Maquinaria y Equipo', 'ASSET'),
  (p_org_id, '1.2.05', 'Depreciación Acumulada Maquinaria', 'ASSET'),
  (p_org_id, '1.2.06', 'Mobiliario y Equipo de Oficina', 'ASSET'),
  (p_org_id, '1.2.07', 'Depreciación Acumulada Mobiliario', 'ASSET'),
  (p_org_id, '1.2.08', 'Vehículos', 'ASSET'),
  (p_org_id, '1.2.09', 'Depreciación Acumulada Vehículos', 'ASSET'),
  (p_org_id, '1.2.10', 'Equipo de Computación', 'ASSET'),
  (p_org_id, '1.2.11', 'Depreciación Acumulada Equipo Computación', 'ASSET'),
  (p_org_id, '1.2.12', 'Herramientas', 'ASSET'),
  (p_org_id, '1.2.13', 'Depreciación Acumulada Herramientas', 'ASSET'),
  (p_org_id, '1.2.14', 'Gastos de Organización', 'ASSET'),
  (p_org_id, '1.2.15', 'Amortización Acumulada Gastos de Organización', 'ASSET'),
  (p_org_id, '1.2.16', 'Marcas y Patentes', 'ASSET'),
  (p_org_id, '1.2.17', 'Software y Licencias', 'ASSET'),

  -- ─── 2. PASIVOS ──────────────────────────────────────────────
  (p_org_id, '2', 'PASIVOS', 'LIABILITY'),
  (p_org_id, '2.1', 'Pasivo Corriente', 'LIABILITY'),
  (p_org_id, '2.1.01', 'Cuentas por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.02', 'Documentos por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.03', 'IVA por Pagar (Débito Fiscal)', 'LIABILITY'),
  (p_org_id, '2.1.04', 'ISR por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.05', 'ISO por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.06', 'Retenciones ISR por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.07', 'Cuota Patronal IGSS por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.08', 'Cuota Laboral IGSS por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.09', 'IRTRA por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.10', 'INTECAP por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.11', 'Sueldos y Salarios por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.12', 'Aguinaldo por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.13', 'Bono 14 por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.14', 'Vacaciones por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.15', 'Indemnización por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.16', 'Timbre Fiscal por Pagar', 'LIABILITY'),
  (p_org_id, '2.1.17', 'Anticipos de Clientes', 'LIABILITY'),
  (p_org_id, '2.1.18', 'Otras Cuentas por Pagar', 'LIABILITY'),

  (p_org_id, '2.2', 'Pasivo No Corriente', 'LIABILITY'),
  (p_org_id, '2.2.01', 'Préstamos Bancarios a Largo Plazo', 'LIABILITY'),
  (p_org_id, '2.2.02', 'Provisión para Indemnizaciones', 'LIABILITY'),
  (p_org_id, '2.2.03', 'Otros Pasivos No Corrientes', 'LIABILITY'),

  -- ─── 3. PATRIMONIO / CAPITAL ─────────────────────────────────
  (p_org_id, '3', 'PATRIMONIO', 'EQUITY'),
  (p_org_id, '3.1', 'Capital Social', 'EQUITY'),
  (p_org_id, '3.1.01', 'Capital Autorizado', 'EQUITY'),
  (p_org_id, '3.1.02', 'Capital Pagado', 'EQUITY'),
  (p_org_id, '3.2', 'Reservas', 'EQUITY'),
  (p_org_id, '3.2.01', 'Reserva Legal (5%)', 'EQUITY'),
  (p_org_id, '3.3', 'Resultados', 'EQUITY'),
  (p_org_id, '3.3.01', 'Utilidades Retenidas', 'EQUITY'),
  (p_org_id, '3.3.02', 'Pérdidas Acumuladas', 'EQUITY'),
  (p_org_id, '3.3.03', 'Utilidad del Ejercicio', 'EQUITY'),
  (p_org_id, '3.3.04', 'Pérdida del Ejercicio', 'EQUITY'),

  -- ─── 4. INGRESOS ─────────────────────────────────────────────
  (p_org_id, '4', 'INGRESOS', 'REVENUE'),
  (p_org_id, '4.1', 'Ingresos por Ventas', 'REVENUE'),
  (p_org_id, '4.1.01', 'Ventas de Bienes', 'REVENUE'),
  (p_org_id, '4.1.02', 'Ventas de Servicios', 'REVENUE'),
  (p_org_id, '4.1.03', 'Ventas de Exportación', 'REVENUE'),
  (p_org_id, '4.2', 'Otros Ingresos', 'REVENUE'),
  (p_org_id, '4.2.01', 'Ingresos por Intereses', 'REVENUE'),
  (p_org_id, '4.2.02', 'Ingresos por Arrendamiento', 'REVENUE'),
  (p_org_id, '4.2.03', 'Ingresos Extraordinarios', 'REVENUE'),
  (p_org_id, '4.2.04', 'Descuentos sobre Compras', 'REVENUE'),
  (p_org_id, '4.2.05', 'Ganancia en Venta de Activos', 'REVENUE'),
  (p_org_id, '4.2.06', 'Diferencial Cambiario Favorable', 'REVENUE'),

  -- ─── 5. COSTOS ───────────────────────────────────────────────
  (p_org_id, '5', 'COSTOS', 'COST'),
  (p_org_id, '5.1', 'Costo de Ventas', 'COST'),
  (p_org_id, '5.1.01', 'Costo de Mercaderías Vendidas', 'COST'),
  (p_org_id, '5.1.02', 'Costo de Servicios Prestados', 'COST'),
  (p_org_id, '5.1.03', 'Compras', 'COST'),
  (p_org_id, '5.1.04', 'Gastos sobre Compras', 'COST'),
  (p_org_id, '5.1.05', 'Devoluciones sobre Compras', 'COST'),
  (p_org_id, '5.1.06', 'Descuentos sobre Compras', 'COST'),

  -- ─── 6. GASTOS ───────────────────────────────────────────────
  (p_org_id, '6', 'GASTOS', 'EXPENSE'),
  (p_org_id, '6.1', 'Gastos de Operación', 'EXPENSE'),
  (p_org_id, '6.1.01', 'Sueldos y Salarios', 'EXPENSE'),
  (p_org_id, '6.1.02', 'Bonificación Incentivo (Decreto 37-2001)', 'EXPENSE'),
  (p_org_id, '6.1.03', 'Cuota Patronal IGSS', 'EXPENSE'),
  (p_org_id, '6.1.04', 'IRTRA', 'EXPENSE'),
  (p_org_id, '6.1.05', 'INTECAP', 'EXPENSE'),
  (p_org_id, '6.1.06', 'Aguinaldo', 'EXPENSE'),
  (p_org_id, '6.1.07', 'Bono 14', 'EXPENSE'),
  (p_org_id, '6.1.08', 'Vacaciones', 'EXPENSE'),
  (p_org_id, '6.1.09', 'Indemnización', 'EXPENSE'),
  (p_org_id, '6.1.10', 'Alquileres', 'EXPENSE'),
  (p_org_id, '6.1.11', 'Servicios Públicos (Agua, Luz, Teléfono)', 'EXPENSE'),
  (p_org_id, '6.1.12', 'Seguros y Fianzas', 'EXPENSE'),
  (p_org_id, '6.1.13', 'Mantenimiento y Reparaciones', 'EXPENSE'),
  (p_org_id, '6.1.14', 'Papelería y Útiles', 'EXPENSE'),
  (p_org_id, '6.1.15', 'Combustibles y Lubricantes', 'EXPENSE'),
  (p_org_id, '6.1.16', 'Publicidad y Propaganda', 'EXPENSE'),
  (p_org_id, '6.1.17', 'Honorarios Profesionales', 'EXPENSE'),
  (p_org_id, '6.1.18', 'Depreciaciones', 'EXPENSE'),
  (p_org_id, '6.1.19', 'Amortizaciones', 'EXPENSE'),
  (p_org_id, '6.1.20', 'Gastos de Viaje', 'EXPENSE'),
  (p_org_id, '6.1.21', 'Impuestos, Tasas y Contribuciones', 'EXPENSE'),
  (p_org_id, '6.1.22', 'Cuentas Incobrables', 'EXPENSE'),
  (p_org_id, '6.1.23', 'Gastos Varios', 'EXPENSE'),

  (p_org_id, '6.2', 'Gastos Financieros', 'EXPENSE'),
  (p_org_id, '6.2.01', 'Intereses Bancarios', 'EXPENSE'),
  (p_org_id, '6.2.02', 'Comisiones Bancarias', 'EXPENSE'),
  (p_org_id, '6.2.03', 'Diferencial Cambiario Desfavorable', 'EXPENSE'),

  (p_org_id, '6.3', 'Otros Gastos', 'EXPENSE'),
  (p_org_id, '6.3.01', 'Pérdida en Venta de Activos', 'EXPENSE'),
  (p_org_id, '6.3.02', 'Gastos Extraordinarios', 'EXPENSE'),
  (p_org_id, '6.3.03', 'Donaciones', 'EXPENSE');

  -- Set parent_account_id for sub-accounts
  UPDATE chart_of_accounts ca
  SET parent_account_id = parent.id
  FROM chart_of_accounts parent
  WHERE ca.organization_id = p_org_id
    AND parent.organization_id = p_org_id
    AND ca.account_code LIKE parent.account_code || '.%'
    AND LENGTH(ca.account_code) - LENGTH(REPLACE(ca.account_code, '.', '')) =
        LENGTH(parent.account_code) - LENGTH(REPLACE(parent.account_code, '.', '')) + 1;
END;
$$ LANGUAGE plpgsql;
