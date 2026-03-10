import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contactos</h1>
          <p className="text-muted-foreground">Clientes, proveedores y acreedores</p>
        </div>
        <Link href="/dashboard/contacts/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Contacto</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Clientes</p>
            <p className="text-2xl font-bold">{contacts?.filter((c: any) => c.contact_type === "CLIENT" || c.contact_type === "BOTH").length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Proveedores</p>
            <p className="text-2xl font-bold">{contacts?.filter((c: any) => c.contact_type === "VENDOR" || c.contact_type === "BOTH").length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{contacts?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Listado de Contactos</CardTitle></CardHeader>
        <CardContent>
          {!contacts || contacts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Building2 className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay contactos registrados</p>
            </div>
          ) : (
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
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="font-mono">{c.nit || "CF"}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
