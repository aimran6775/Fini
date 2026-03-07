import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export default async function AccountsPage() {
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

  const { data: accounts } = await supabase
    .from("chart_of_accounts")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("account_code");

  const typeLabels: Record<string, string> = {
    ASSET: "Activo",
    LIABILITY: "Pasivo",
    EQUITY: "Patrimonio",
    REVENUE: "Ingreso",
    COST: "Costo",
    EXPENSE: "Gasto",
  };

  const typeColors: Record<string, string> = {
    ASSET: "default",
    LIABILITY: "secondary",
    EQUITY: "outline",
    REVENUE: "success",
    COST: "warning",
    EXPENSE: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plan de Cuentas</h1>
          <p className="text-muted-foreground">Nomenclatura contable guatemalteca</p>
        </div>
        <CreateAccountDialog
          orgId={membership.organization_id}
          accounts={(accounts ?? []).map((a: any) => ({ id: a.id, account_code: a.account_code, account_name: a.account_name }))}
        />
      </div>

      <Card>
        <CardHeader><CardTitle>Cuentas Contables</CardTitle></CardHeader>
        <CardContent>
          {!accounts || accounts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay cuentas configuradas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Código Padre</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((acc: any) => (
                  <TableRow key={acc.id}>
                    <TableCell className="font-mono font-medium">{acc.account_code}</TableCell>
                    <TableCell className={acc.parent_account_id ? "pl-8" : "font-semibold"}>{acc.account_name}</TableCell>
                    <TableCell>
                      <Badge variant={typeColors[acc.account_type] as any}>
                        {typeLabels[acc.account_type] || acc.account_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{acc.parent_account_id ? "Sí" : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={acc.is_active ? "success" : "secondary"}>
                        {acc.is_active ? "Activa" : "Inactiva"}
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
