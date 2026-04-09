import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListFilters } from "@/components/dashboard/list-filters";
import { Pagination } from "@/components/dashboard/pagination";
import { sanitizeSearch } from "@/lib/validate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contactos — FiniTax GT",
  description: "Gestión de clientes, proveedores y acreedores",
};

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; contact_type?: string; is_active?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");

  const page = Number(params.page) || 1;
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build query with filters
  let query = supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .eq("organization_id", membership.organization_id)
    .order("name")
    .range(from, to);

  if (params.search) {
    const s = sanitizeSearch(params.search);
    if (s) query = query.or(`name.ilike.%${s}%,nit_number.ilike.%${s}%,email.ilike.%${s}%`);
  }
  if (params.contact_type) {
    query = query.eq("contact_type", params.contact_type);
  }
  if (params.is_active === "true") {
    query = query.eq("is_active", true);
  } else if (params.is_active === "false") {
    query = query.eq("is_active", false);
  }

  const { data: contacts, count: contactsCount } = await query;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1>Contactos</h1>
          <p>Clientes, proveedores y acreedores</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/imports/ai-workspace">
            <Button variant="outline"><Sparkles className="mr-2 h-4 w-4 text-amber-400" /> Importar con IA</Button>
          </Link>
          <Link href="/dashboard/contacts/new">
            <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Contacto</Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Suspense fallback={null}>
        <ListFilters
          searchPlaceholder="Buscar por nombre, NIT o email..."
          filters={[
            {
              key: "contact_type",
              label: "Tipo",
              options: [
                { value: "CLIENT", label: "Cliente" },
                { value: "VENDOR", label: "Proveedor" },
                { value: "BOTH", label: "Ambos" },
              ],
            },
            {
              key: "is_active",
              label: "Estado",
              options: [
                { value: "true", label: "Activo" },
                { value: "false", label: "Inactivo" },
              ],
            },
          ]}
        />
      </Suspense>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg kpi-blue">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Clientes</p>
              <p className="text-2xl font-bold tabular-nums">{(contacts || []).filter((c: any) => c.contact_type === "CLIENT" || c.contact_type === "BOTH").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg kpi-orange">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Proveedores</p>
              <p className="text-2xl font-bold tabular-nums">{(contacts || []).filter((c: any) => c.contact_type === "VENDOR" || c.contact_type === "BOTH").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg kpi-emerald">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold tabular-nums">{contacts?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Listado de Contactos ({contactsCount ?? contacts?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {!contacts || contacts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Building2 className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay contactos que coincidan con tu búsqueda</p>
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>NIT</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c: any) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/contacts/${c.id}`} className="text-primary hover:underline">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono">{c.nit_number || "CF"}</TableCell>
                    <TableCell>
                      <Badge variant={c.contact_type === "CLIENT" ? "default" : c.contact_type === "VENDOR" ? "secondary" : "outline"}>
                        {c.contact_type === "CLIENT" ? "Cliente" : c.contact_type === "VENDOR" ? "Proveedor" : "Ambos"}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.email || "—"}</TableCell>
                    <TableCell>{c.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.is_active ? "success" : "secondary"}>
                        {c.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination totalItems={contactsCount ?? 0} pageSize={pageSize} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
