import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "user_id", label: "User ID", editable: true, width: "80px" },
  { key: "type", label: "Tipo", editable: true },
  { key: "title", label: "Título", editable: true },
  { key: "message", label: "Mensaje", editable: true },
  { key: "is_read", label: "Leído", type: "boolean" as const, editable: true },
  { key: "link", label: "Enlace", editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("notifications", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "title",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="notifications"
        title="Notificaciones"
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
