import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: true, width: "80px" },
  { key: "user_id", label: "User ID", editable: true, width: "80px" },
  { key: "role", label: "Rol", type: "select" as const, options: ["ADMIN", "ACCOUNTANT", "EMPLOYEE"], editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("organization_members", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "role",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="organization_members"
        title="Miembros de Organización"
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
