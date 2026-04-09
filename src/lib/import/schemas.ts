// ─── Import Category Schemas ───────────────────────────────────
// Defines categories, column configs, extraction prompts, and
// mappings for the AI Import workspace.

export type ImportCategory =
  | "invoice"
  | "expense"
  | "contact"
  | "product"
  | "bank_transaction";

export interface ColumnDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "currency" | "select";
  required: boolean;
  width: number;
  options?: { value: string; label: string }[];
}

export interface CategoryConfig {
  id: ImportCategory;
  label: string;
  description: string;
  icon: string;
  destination: string;
  destinationPath: string;
  columns: ColumnDef[];
}

// ─── Category Definitions ──────────────────────────────────────

export const IMPORT_CATEGORIES: CategoryConfig[] = [
  {
    id: "invoice",
    label: "Factura de Venta",
    description: "Extraer facturas de venta hacia Facturación FEL",
    icon: "receipt",
    destination: "Facturación (FEL)",
    destinationPath: "/dashboard/invoices",
    columns: [
      { key: "invoice_number", label: "No. Factura", type: "text", required: true, width: 120 },
      { key: "issue_date", label: "Fecha Emisión", type: "date", required: true, width: 120 },
      { key: "customer_name", label: "Cliente", type: "text", required: true, width: 180 },
      { key: "customer_tax_id", label: "NIT Cliente", type: "text", required: true, width: 120 },
      { key: "description", label: "Descripción", type: "text", required: false, width: 200 },
      { key: "subtotal", label: "Subtotal", type: "currency", required: true, width: 110 },
      { key: "tax_amount", label: "IVA (12%)", type: "currency", required: true, width: 100 },
      { key: "total", label: "Total", type: "currency", required: true, width: 110 },
      {
        key: "currency",
        label: "Moneda",
        type: "select",
        required: false,
        width: 80,
        options: [
          { value: "GTQ", label: "GTQ" },
          { value: "USD", label: "USD" },
        ],
      },
      { key: "notes", label: "Notas", type: "text", required: false, width: 200 },
    ],
  },
  {
    id: "expense",
    label: "Gasto",
    description: "Extraer recibos y facturas de compra hacia Gastos",
    icon: "wallet",
    destination: "Gastos",
    destinationPath: "/dashboard/expenses",
    columns: [
      { key: "date", label: "Fecha", type: "date", required: true, width: 120 },
      { key: "vendor_name", label: "Proveedor", type: "text", required: true, width: 180 },
      { key: "vendor_tax_id", label: "NIT Proveedor", type: "text", required: false, width: 120 },
      { key: "description", label: "Descripción", type: "text", required: true, width: 220 },
      { key: "subtotal", label: "Subtotal", type: "currency", required: true, width: 110 },
      { key: "tax_amount", label: "IVA", type: "currency", required: true, width: 100 },
      { key: "total", label: "Total", type: "currency", required: true, width: 110 },
      {
        key: "currency",
        label: "Moneda",
        type: "select",
        required: false,
        width: 80,
        options: [
          { value: "GTQ", label: "GTQ" },
          { value: "USD", label: "USD" },
        ],
      },
      {
        key: "category",
        label: "Categoría",
        type: "select",
        required: false,
        width: 140,
        options: [
          { value: "OFFICE", label: "Oficina" },
          { value: "RENT", label: "Alquiler" },
          { value: "UTILITIES", label: "Servicios" },
          { value: "SUPPLIES", label: "Suministros" },
          { value: "TRANSPORT", label: "Transporte" },
          { value: "FOOD", label: "Alimentación" },
          { value: "PROFESSIONAL", label: "Servicios Prof." },
          { value: "OTHER", label: "Otro" },
        ],
      },
      { key: "notes", label: "Notas", type: "text", required: false, width: 180 },
    ],
  },
  {
    id: "contact",
    label: "Contacto",
    description: "Importar clientes y proveedores hacia Contactos",
    icon: "users",
    destination: "Contactos",
    destinationPath: "/dashboard/contacts",
    columns: [
      { key: "contact_name", label: "Nombre Contacto", type: "text", required: true, width: 180 },
      { key: "company_name", label: "Empresa", type: "text", required: false, width: 180 },
      { key: "tax_id", label: "NIT", type: "text", required: false, width: 120 },
      { key: "email", label: "Email", type: "text", required: false, width: 180 },
      { key: "phone", label: "Teléfono", type: "text", required: false, width: 130 },
      { key: "address", label: "Dirección", type: "text", required: false, width: 240 },
      {
        key: "contact_type",
        label: "Tipo",
        type: "select",
        required: false,
        width: 110,
        options: [
          { value: "CLIENT", label: "Cliente" },
          { value: "SUPPLIER", label: "Proveedor" },
          { value: "BOTH", label: "Ambos" },
        ],
      },
    ],
  },
  {
    id: "product",
    label: "Producto",
    description: "Importar catálogo de productos hacia Inventario",
    icon: "package",
    destination: "Inventario",
    destinationPath: "/dashboard/inventory",
    columns: [
      { key: "product_code", label: "Código", type: "text", required: true, width: 100 },
      { key: "product_name", label: "Nombre", type: "text", required: true, width: 220 },
      { key: "category", label: "Categoría", type: "text", required: false, width: 140 },
      { key: "price", label: "Precio", type: "currency", required: true, width: 110 },
      {
        key: "tax_type",
        label: "Tipo IVA",
        type: "select",
        required: false,
        width: 100,
        options: [
          { value: "IVA", label: "IVA 12%" },
          { value: "EXEMPT", label: "Exento" },
        ],
      },
      { key: "stock_quantity", label: "Stock", type: "number", required: false, width: 80 },
      { key: "description", label: "Descripción", type: "text", required: false, width: 220 },
    ],
  },
  {
    id: "bank_transaction",
    label: "Transacción Bancaria",
    description: "Importar estados de cuenta hacia Bancos",
    icon: "landmark",
    destination: "Bancos",
    destinationPath: "/dashboard/banking",
    columns: [
      { key: "transaction_date", label: "Fecha", type: "date", required: true, width: 120 },
      { key: "description", label: "Descripción", type: "text", required: true, width: 260 },
      { key: "reference", label: "Referencia", type: "text", required: false, width: 140 },
      { key: "debit", label: "Débito", type: "currency", required: false, width: 110 },
      { key: "credit", label: "Crédito", type: "currency", required: false, width: 110 },
      { key: "balance", label: "Saldo", type: "currency", required: false, width: 110 },
      {
        key: "category",
        label: "Categoría",
        type: "select",
        required: false,
        width: 120,
        options: [
          { value: "DEPOSIT", label: "Depósito" },
          { value: "WITHDRAWAL", label: "Retiro" },
          { value: "TRANSFER", label: "Transferencia" },
          { value: "FEE", label: "Comisión" },
          { value: "INTEREST", label: "Interés" },
          { value: "OTHER", label: "Otro" },
        ],
      },
      {
        key: "currency",
        label: "Moneda",
        type: "select",
        required: false,
        width: 80,
        options: [
          { value: "GTQ", label: "GTQ" },
          { value: "USD", label: "USD" },
        ],
      },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────

export function getCategoryConfig(id: ImportCategory): CategoryConfig {
  const config = IMPORT_CATEGORIES.find((c) => c.id === id);
  if (!config) throw new Error(`Unknown import category: ${id}`);
  return config;
}

export function getEmptyRow(category: ImportCategory): Record<string, string> {
  const config = getCategoryConfig(category);
  const row: Record<string, string> = {};
  for (const col of config.columns) {
    if (col.type === "currency" || col.type === "number") {
      row[col.key] = "";
    } else if (col.type === "select" && col.options?.length) {
      row[col.key] = col.options[0].value;
    } else {
      row[col.key] = "";
    }
  }
  return row;
}

// ─── AI Extraction Prompt Builder ──────────────────────────────

export function buildExtractionPrompt(category: ImportCategory): string {
  const config = getCategoryConfig(category);
  const fields = config.columns
    .map((c) => {
      let desc = `  - "${c.key}": ${c.label}`;
      if (c.type === "date") desc += " (formato YYYY-MM-DD)";
      if (c.type === "currency" || c.type === "number") desc += " (número, sin símbolos)";
      if (c.type === "select" && c.options)
        desc += ` (valores: ${c.options.map((o) => o.value).join(", ")})`;
      if (c.required) desc += " [REQUERIDO]";
      return desc;
    })
    .join("\n");

  return `Eres un sistema experto de extracción de datos para contabilidad guatemalteca (FiniTax).

TAREA: Extrae registros de tipo "${config.label}" del contenido proporcionado.

CAMPOS POR REGISTRO:
${fields}

REGLAS IMPORTANTES:
- Extrae TODOS los registros que encuentres en el contenido
- Las fechas deben estar en formato YYYY-MM-DD
- Los montos deben ser números sin símbolos de moneda (ej: 1500.00, no Q1,500.00)
- Si el IVA no está separado, calcula: subtotal = total / 1.12, iva = total - subtotal
- Si no hay NIT disponible, déjalo vacío
- Si hay campos que no puedes determinar, déjalos vacíos
- La moneda por defecto es GTQ
- Nunca inventes datos que no estén en el contenido

FORMATO DE RESPUESTA — devuelve SOLO JSON válido, sin markdown, sin explicaciones:
{
  "rows": [
    { ${config.columns.map((c) => `"${c.key}": "..."`).join(", ")} }
  ],
  "warnings": ["advertencia si hay datos ambiguos o incompletos"],
  "confidence": 0.95
}

Si no encuentras datos para extraer, devuelve:
{ "rows": [], "warnings": ["No se encontraron registros en el contenido"], "confidence": 0 }`;
}

// ─── CSV/Excel Column Auto-Mapping ─────────────────────────────

const COLUMN_ALIASES: Record<string, string[]> = {
  invoice_number: ["factura", "no. factura", "numero factura", "invoice", "no", "num"],
  issue_date: ["fecha", "fecha emisión", "date", "issue date", "fecha emision"],
  customer_name: ["cliente", "customer", "nombre cliente", "client", "razón social"],
  customer_tax_id: ["nit", "nit cliente", "tax id", "rtn"],
  vendor_name: ["proveedor", "vendor", "supplier", "nombre proveedor"],
  vendor_tax_id: ["nit proveedor", "nit vendor", "vendor nit"],
  description: ["descripción", "descripcion", "concepto", "detalle", "description", "desc"],
  subtotal: ["subtotal", "sub total", "monto antes iva", "base"],
  tax_amount: ["iva", "impuesto", "tax", "tax amount", "monto iva"],
  total: ["total", "monto total", "amount", "monto"],
  currency: ["moneda", "currency", "divisa"],
  category: ["categoría", "categoria", "category", "tipo"],
  notes: ["notas", "observaciones", "notes", "comentarios"],
  date: ["fecha", "date", "fecha gasto"],
  contact_name: ["nombre", "contacto", "name", "contact"],
  company_name: ["empresa", "company", "razón social", "razon social"],
  tax_id: ["nit", "tax id", "rtn", "identificación fiscal"],
  email: ["email", "correo", "e-mail"],
  phone: ["teléfono", "telefono", "phone", "tel"],
  address: ["dirección", "direccion", "address"],
  contact_type: ["tipo", "type", "tipo contacto"],
  product_code: ["código", "codigo", "code", "sku"],
  product_name: ["nombre", "producto", "product", "name", "item"],
  price: ["precio", "price", "valor", "costo"],
  tax_type: ["tipo iva", "tax type", "impuesto"],
  stock_quantity: ["stock", "cantidad", "qty", "quantity", "existencia"],
  transaction_date: ["fecha", "date", "fecha transacción"],
  reference: ["referencia", "reference", "ref", "doc"],
  debit: ["débito", "debito", "debit", "cargo"],
  credit: ["crédito", "credito", "credit", "abono"],
  balance: ["saldo", "balance"],
};

export function autoMapColumns(
  fileHeaders: string[],
  category: ImportCategory
): Record<string, string> {
  const config = getCategoryConfig(category);
  const mapping: Record<string, string> = {};
  const usedHeaders = new Set<string>();

  for (const col of config.columns) {
    const aliases = COLUMN_ALIASES[col.key] || [];
    const allNames = [col.key, col.label.toLowerCase(), ...aliases];

    for (const header of fileHeaders) {
      if (usedHeaders.has(header)) continue;
      const h = header.toLowerCase().trim();
      if (allNames.some((alias) => h === alias || h.includes(alias) || alias.includes(h))) {
        mapping[col.key] = header;
        usedHeaders.add(header);
        break;
      }
    }
  }

  return mapping;
}

export function applyColumnMapping(
  rawRows: Record<string, string>[],
  mapping: Record<string, string>
): Record<string, string>[] {
  return rawRows.map((raw) => {
    const mapped: Record<string, string> = {};
    for (const [schemaKey, fileHeader] of Object.entries(mapping)) {
      mapped[schemaKey] = raw[fileHeader] ?? "";
    }
    return mapped;
  });
}
