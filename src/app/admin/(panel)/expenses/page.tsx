import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "description", label: "Descripción", editable: true },
  { key: "amount", label: "Monto", type: "currency" as const, editable: true },
  { key: "iva_amount", label: "IVA", type: "currency" as const, editable: true },
  { key: "category", label: "Categoría", editable: true },
  { key: "status", label: "Estado", type: "select" as const, options: ["DRAFT", "APPROVED", "REJECTED"], editable: true },
  { key: "tax_type", label: "Tipo Fiscal", type: "select" as const, options: ["GRAVADA", "EXENTA", "NO_SUJETA"], editable: true },
  { key: "expense_date", label: "Fecha", type: "date" as const, editable: true },
  { key: "supplier_name", label: "Proveedor", editable: true },
  { key: "supplier_nit", label: "NIT Prov.", editable: true },
  { key: "is_deductible", label: "Deducible", type: "boolean" as const, editable: true },
  { key: "has_receipt", label: "Recibo", type: "boolean" as const, editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("expenses", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "description",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="expenses"
        title="Gastos"
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
