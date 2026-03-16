import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "source_type", label: "Tipo", type: "select" as const, options: ["INVOICE", "EXPENSE"], editable: true },
  { key: "source_id", label: "Fuente ID", editable: true },
  { key: "frequency", label: "Frecuencia", type: "select" as const, options: ["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL"], editable: true },
  { key: "next_date", label: "Próxima Fecha", type: "date" as const, editable: true },
  { key: "end_date", label: "Fecha Fin", type: "date" as const, editable: true },
  { key: "is_active", label: "Activo", type: "boolean" as const, editable: true },
  { key: "last_generated_at", label: "Última Gen.", type: "date" as const, editable: false },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminRecurringPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("recurring_transactions", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "source_type",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="recurring_transactions"
        title="Transacciones Recurrentes"
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
