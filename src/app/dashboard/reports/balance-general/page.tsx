import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getBalanceGeneral } from "@/app/actions/reports";

export default async function BalanceGeneralPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(name, nit_number)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");
  const orgId = membership.organization_id;
  const org = membership.organizations as any;
  const today = new Date().toISOString().split("T")[0];

  const data = await getBalanceGeneral(orgId, today);
  const ecuacionContable = data.totalActivos;
  const pasivoMasPatrimonio = data.totalPasivos + data.totalPatrimonio;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Balance General</h1>
            <p className="text-muted-foreground">
              {org?.name} • NIT {org?.nit_number} • Al {formatDate(today)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ACTIVOS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            {data.activos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No hay movimientos en cuentas de activo</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.activos.map((a) => (
                    <TableRow key={a.account_id}>
                      <TableCell className="font-mono text-xs">{a.account_code}</TableCell>
                      <TableCell>{a.account_name}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(a.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Separator className="my-3" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Activos</span>
              <span className="text-blue-700">{formatCurrency(data.totalActivos)}</span>
            </div>
          </CardContent>
        </Card>

        {/* PASIVOS + PATRIMONIO */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">Pasivos</CardTitle>
            </CardHeader>
            <CardContent>
              {data.pasivos.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No hay movimientos en cuentas de pasivo</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.pasivos.map((a) => (
                      <TableRow key={a.account_id}>
                        <TableCell className="font-mono text-xs">{a.account_code}</TableCell>
                        <TableCell>{a.account_name}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(a.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <Separator className="my-3" />
              <div className="flex justify-between font-bold">
                <span>Total Pasivos</span>
                <span className="text-red-700">{formatCurrency(data.totalPasivos)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Patrimonio</CardTitle>
            </CardHeader>
            <CardContent>
              {data.patrimonio.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No hay movimientos en cuentas de patrimonio</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.patrimonio.map((a) => (
                      <TableRow key={a.account_id}>
                        <TableCell className="font-mono text-xs">{a.account_code}</TableCell>
                        <TableCell>{a.account_name}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(a.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <Separator className="my-3" />
              <div className="flex justify-between font-bold">
                <span>Total Patrimonio</span>
                <span className="text-green-700">{formatCurrency(data.totalPatrimonio)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ecuación Contable */}
      <Card className={ecuacionContable === pasivoMasPatrimonio ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4 text-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Activos</p>
              <p className="font-bold text-blue-700">{formatCurrency(ecuacionContable)}</p>
            </div>
            <span className="text-2xl font-bold">=</span>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Pasivos</p>
              <p className="font-bold text-red-700">{formatCurrency(data.totalPasivos)}</p>
            </div>
            <span className="text-2xl font-bold">+</span>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Patrimonio</p>
              <p className="font-bold text-green-700">{formatCurrency(data.totalPatrimonio)}</p>
            </div>
          </div>
          <p className="text-center mt-3 text-sm text-muted-foreground">
            {ecuacionContable === pasivoMasPatrimonio
              ? "✅ La ecuación contable cuadra correctamente"
              : `⚠️ Diferencia de ${formatCurrency(Math.abs(ecuacionContable - pasivoMasPatrimonio))}`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
