import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Landmark, Plus, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function BankingPage() {
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

  const { data: accounts } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("bank_name");

  const totalBalance = accounts?.reduce((sum: number, a: any) => sum + Number(a.current_balance || 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bancos</h1>
          <p className="text-muted-foreground">Cuentas bancarias y conciliación</p>
        </div>
        <Link href="/dashboard/banking/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Nueva Cuenta</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
            <Landmark className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Saldo Total</p>
            <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Cuentas Bancarias</CardTitle></CardHeader>
        <CardContent>
          {!accounts || accounts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Landmark className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay cuentas bancarias registradas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead>No. Cuenta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((acc: any) => (
                  <TableRow key={acc.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/banking/${acc.id}`} className="hover:underline">
                        {acc.bank_name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono">{acc.account_number}</TableCell>
                    <TableCell>{acc.account_type}</TableCell>
                    <TableCell>{acc.currency}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(acc.current_balance, acc.currency)}</TableCell>
                    <TableCell>
                      <Badge variant={acc.is_active ? "success" : "secondary"}>
                        {acc.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/banking/${acc.id}`}>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
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
