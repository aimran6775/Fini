import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Wallet } from "lucide-react";

export default async function BudgetsPage() {
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

  const { data: budgets } = await supabase
    .from("budgets")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("start_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Presupuestos</h1>
        <p className="text-muted-foreground">Planificación y control presupuestario</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Presupuestos Activos</CardTitle></CardHeader>
        <CardContent>
          {!budgets || budgets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Wallet className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay presupuestos configurados</p>
              <p className="text-sm mt-1">Crea un presupuesto para controlar tus gastos e ingresos por categoría</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Monto Presupuestado</TableHead>
                  <TableHead className="text-right">Ejecutado</TableHead>
                  <TableHead className="text-right">% Ejecución</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((b: any) => {
                  const pct = b.budgeted_amount > 0 ? (Number(b.actual_amount || 0) / Number(b.budgeted_amount) * 100) : 0;
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(b.start_date).toLocaleDateString("es-GT")} — {new Date(b.end_date).toLocaleDateString("es-GT")}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(b.budgeted_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(b.actual_amount || 0)}</TableCell>
                      <TableCell className="text-right">
                        <span className={pct > 100 ? "text-red-600 font-bold" : pct > 80 ? "text-yellow-600" : "text-green-600"}>
                          {pct.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
