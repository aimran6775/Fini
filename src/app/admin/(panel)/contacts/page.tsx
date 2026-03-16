import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "contact_type", label: "Tipo", type: "select" as const, options: ["CLIENT", "VENDOR", "BOTH"], editable: true },
  { key: "name", label: "Nombre", editable: true },
  { key: "nit_number", label: "NIT", editable: true },
  { key: "dpi_number", label: "DPI", editable: true },
  { key: "email", label: "Email", editable: true },
  { key: "phone", label: "Teléfono", editable: true },
  { key: "department", label: "Departamento", editable: true },
  { key: "municipality", label: "Municipio", editable: true },
  { key: "address", label: "Dirección", editable: true },
  { key: "is_active", label: "Activo", type: "boolean" as const, editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("contacts", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "name",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="contacts"
        title="Contactos"
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
