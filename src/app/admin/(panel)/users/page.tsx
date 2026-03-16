import { adminListTable, listAuthUsers } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "first_name", label: "Nombre", editable: true },
  { key: "last_name", label: "Apellido", editable: true },
  { key: "dpi_number", label: "DPI", editable: true },
  { key: "phone", label: "Teléfono", editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const [{ data, count }, { users }] = await Promise.all([
    adminListTable("user_profiles", {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      search,
      searchColumn: "first_name",
    }),
    listAuthUsers(),
  ]);

  // Create email map from auth users
  const emailMap = new Map(users.map((u: any) => [u.id, u.email]));
  const enrichedData = data.map((row: any) => ({
    ...row,
    email: emailMap.get(row.id) || "—",
  }));

  const enrichedColumns = [
    ...columns.slice(0, 1),
    { key: "email", label: "Email (Auth)", editable: false },
    ...columns.slice(1),
  ];

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="user_profiles"
        title="Perfiles de Usuario"
        data={enrichedData}
        columns={enrichedColumns}
        totalCount={count}
        page={page}
        pageSize={pageSize}
        searchQuery={search}
      />

      {/* Auth users summary */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">
          Usuarios de Autenticación ({users.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-2 text-left text-white/40">ID</th>
                <th className="px-3 py-2 text-left text-white/40">Email</th>
                <th className="px-3 py-2 text-left text-white/40">Creado</th>
                <th className="px-3 py-2 text-left text-white/40">Último Login</th>
                <th className="px-3 py-2 text-left text-white/40">Confirmado</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 50).map((u: any) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-3 py-2 font-mono text-white/30 text-[10px]">{u.id?.slice(0, 8)}…</td>
                  <td className="px-3 py-2 text-white/70">{u.email}</td>
                  <td className="px-3 py-2 text-white/40">{u.created_at ? new Date(u.created_at).toLocaleDateString("es-GT") : "—"}</td>
                  <td className="px-3 py-2 text-white/40">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("es-GT") : "Nunca"}</td>
                  <td className="px-3 py-2">
                    <span className={u.email_confirmed_at ? "text-green-400" : "text-yellow-400"}>
                      {u.email_confirmed_at ? "Sí" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
