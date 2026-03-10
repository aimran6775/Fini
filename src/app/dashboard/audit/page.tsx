import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export default async function AuditPage() {
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

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, user:user_profiles(first_name, last_name)")
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false })
    .limit(100);

  const actionColors: Record<string, string> = {
    CREATE: "success",
    UPDATE: "default",
    DELETE: "destructive",
    APPROVE: "success",
    CERTIFY: "success",
    VOID: "warning",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bitácora de Auditoría</h1>
        <p className="text-muted-foreground">Registro de todas las acciones del sistema</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Eventos Recientes</CardTitle></CardHeader>
        <CardContent>
          {!logs || logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Shield className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay eventos registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">
                      {new Date(log.created_at).toLocaleString("es-GT")}
                    </TableCell>
                    <TableCell>{(log.user as any)?.first_name ? `${(log.user as any).first_name} ${(log.user as any).last_name || ""}`.trim() : "Sistema"}</TableCell>
                    <TableCell>
                      <Badge variant={actionColors[log.action] as any || "secondary"}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.entity_type}</TableCell>
                    <TableCell className="text-sm">{log.details ? (typeof log.details === 'object' ? (log.details as any).description || JSON.stringify(log.details) : String(log.details)) : "—"}</TableCell>
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
