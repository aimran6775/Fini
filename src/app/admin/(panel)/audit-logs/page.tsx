import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "user_id", label: "User ID", editable: false, width: "80px" },
  { key: "action", label: "Acción", editable: false },
  { key: "entity_type", label: "Tipo Entidad", editable: false },
  { key: "entity_id", label: "Entidad ID", editable: false },
  { key: "ip_address", label: "IP", editable: false },
  { key: "created_at", label: "Fecha", type: "date" as const, editable: false },
];

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 50;
  const search = params.search || "";

  const { data, count } = await adminListTable("audit_logs", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "action",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="audit_logs"
        title="Registros de Auditoría"
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
