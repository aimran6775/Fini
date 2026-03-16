import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "form_type", label: "Formulario", type: "select" as const, options: ["IVA_MENSUAL", "ISR_TRIMESTRAL", "ISR_MENSUAL", "ISR_ANUAL", "ISO_TRIMESTRAL", "RETENCIONES_ISR"], editable: true },
  { key: "period_year", label: "Año", type: "number" as const, editable: true },
  { key: "period_month", label: "Mes", type: "number" as const, editable: true },
  { key: "period_quarter", label: "Trimestre", type: "number" as const, editable: true },
  { key: "status", label: "Estado", type: "select" as const, options: ["DRAFT", "CALCULATED", "FILED", "ACCEPTED", "REJECTED"], editable: true },
  { key: "iva_debito", label: "IVA Débito", type: "currency" as const, editable: true },
  { key: "iva_credito", label: "IVA Crédito", type: "currency" as const, editable: true },
  { key: "iva_a_pagar", label: "IVA a Pagar", type: "currency" as const, editable: true },
  { key: "taxable_income", label: "Renta Gravable", type: "currency" as const, editable: true },
  { key: "isr_amount", label: "ISR", type: "currency" as const, editable: true },
  { key: "iso_amount", label: "ISO", type: "currency" as const, editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminTaxFilingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("tax_filings", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "form_type",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="tax_filings"
        title="Declaraciones Fiscales"
        data={data}
        columns={columns}
        totalCount={count}
        page={page}
        pageSize={pageSize}
        searchQuery={search}
      />
    </div>
  );
}
