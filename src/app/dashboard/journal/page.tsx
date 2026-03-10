import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function JournalPage() {
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

  const { data: entries } = await supabase
    .from("journal_entries")
    .select(`*, lines:journal_entry_lines(*, account:chart_of_accounts(account_code, account_name))`)
    .eq("organization_id", membership.organization_id)
    .order("entry_date", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Diario Contable</h1>
          <p className="text-muted-foreground">Partidas de diario y libro mayor</p>
        </div>
        <Link href="/dashboard/journal/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Nueva Partida</Button>
        </Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Partidas de Diario</CardTitle></CardHeader>
        <CardContent>
          {!entries || entries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay partidas registradas</p>
              <Link href="/dashboard/journal/new">
                <Button variant="outline" className="mt-4">Crear Primera Partida</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry: any) => (
                <div key={entry.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{entry.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(entry.entry_date)} {entry.reference && `• Ref: ${entry.reference}`}
                      </p>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cuenta</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Debe</TableHead>
                        <TableHead className="text-right">Haber</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entry.lines?.map((line: any) => (
                        <TableRow key={line.id}>
                          <TableCell className="font-mono text-sm">
                            {(line.account as any)?.account_code} — {(line.account as any)?.account_name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{line.description || "—"}</TableCell>
                          <TableCell className="text-right">{line.debit > 0 ? formatCurrency(line.debit) : ""}</TableCell>
                          <TableCell className="text-right">{line.credit > 0 ? formatCurrency(line.credit) : ""}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold">
                        <TableCell colSpan={2}>Totales</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(entry.lines?.reduce((s: number, l: any) => s + Number(l.debit || 0), 0) ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(entry.lines?.reduce((s: number, l: any) => s + Number(l.credit || 0), 0) ?? 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
