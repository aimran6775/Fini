import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "entry_date", label: "Fecha", type: "date" as const, editable: true },
  { key: "reference", label: "Referencia", editable: true },
  { key: "description", label: "Descripción", editable: true },
  { key: "created_by", label: "Creado por", editable: false },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("journal_entries", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "description",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="journal_entries"
        title="Asientos de Diario"
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
