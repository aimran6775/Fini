import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "first_name", label: "Nombre", editable: true },
  { key: "last_name", label: "Apellido", editable: true },
  { key: "dpi_number", label: "DPI", editable: true },
  { key: "nit_number", label: "NIT", editable: true },
  { key: "position", label: "Puesto", editable: true },
  { key: "department", label: "Departamento", editable: true },
  { key: "base_salary", label: "Salario Base", type: "currency" as const, editable: true },
  { key: "work_shift", label: "Jornada", type: "select" as const, options: ["DIURNA", "MIXTA", "NOCTURNA"], editable: true },
  { key: "status", label: "Estado", type: "select" as const, options: ["ACTIVE", "INACTIVE", "TERMINATED"], editable: true },
  { key: "hire_date", label: "Ingreso", type: "date" as const, editable: true },
  { key: "email", label: "Email", editable: true },
  { key: "phone", label: "Teléfono", editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("employees", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "first_name",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="employees"
        title="Empleados"
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
