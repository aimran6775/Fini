import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PayrollPage() {
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
  const orgId = membership.organization_id;

  const [{ data: employees }, { data: payrollRuns }] = await Promise.all([
    supabase.from("employees").select("*").eq("organization_id", orgId).order("last_name"),
    supabase.from("payroll_runs")
      .select(`*, details:payroll_details(*, employee:employees(id, first_name, last_name))`)
      .eq("organization_id", orgId)
      .order("period_start", { ascending: false })
      .limit(12),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planilla</h1>
          <p className="text-muted-foreground">Gestión de nómina, IGSS, IRTRA, INTECAP</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/payroll/employees/new">
            <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Empleado</Button>
          </Link>
          <Link href="/dashboard/payroll/new">
            <Button><Plus className="mr-2 h-4 w-4" /> Correr Planilla</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Empleados Activos</p>
            <p className="text-2xl font-bold">{employees?.filter((e: any) => e.status === "ACTIVE").length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">IGSS Patronal (10.67%)</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(
                (employees?.filter((e: any) => e.status === "ACTIVE")
                  .reduce((sum: number, e: any) => sum + Number(e.base_salary || 0), 0) ?? 0) * 0.1067
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">IRTRA + INTECAP (2%)</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(
                (employees?.filter((e: any) => e.status === "ACTIVE")
                  .reduce((sum: number, e: any) => sum + Number(e.base_salary || 0), 0) ?? 0) * 0.02
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Nómina Mensual Bruta</p>
            <p className="text-2xl font-bold">
              {formatCurrency(
                employees?.filter((e: any) => e.status === "ACTIVE")
                  .reduce((sum: number, e: any) => sum + Number(e.base_salary || 0), 0) ?? 0
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="runs">Planillas</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card>
            <CardContent className="pt-6">
              {!employees || employees.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No hay empleados registrados</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>DPI</TableHead>
                      <TableHead>Puesto</TableHead>
                      <TableHead>Jornada</TableHead>
                      <TableHead className="text-right">Salario Base</TableHead>
                      <TableHead className="text-right">IGSS Emp. (4.83%)</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp: any) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/payroll/employees/${emp.id}`} className="hover:text-primary hover:underline">
                            {emp.first_name} {emp.last_name}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{emp.dpi_number}</TableCell>
                        <TableCell>{emp.position}</TableCell>
                        <TableCell>{emp.work_shift}</TableCell>
                        <TableCell className="text-right">{formatCurrency(emp.base_salary)}</TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatCurrency(Number(emp.base_salary) * 0.0483)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={emp.status === "ACTIVE" ? "success" : "secondary"}>
                            {emp.status === "ACTIVE" ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs">
          <Card>
            <CardContent className="pt-6">
              {!payrollRuns || payrollRuns.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p>No hay planillas procesadas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Empleados</TableHead>
                      <TableHead className="text-right">Bruto</TableHead>
                      <TableHead className="text-right">Deducciones</TableHead>
                      <TableHead className="text-right">Neto</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRuns.map((run: any) => (
                      <TableRow key={run.id}>
                        <TableCell>{formatDate(run.period_start)} — {formatDate(run.period_end)}</TableCell>
                        <TableCell>{run.details?.length ?? 0}</TableCell>
                        <TableCell className="text-right">{formatCurrency(run.total_gross)}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(run.total_deductions)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(run.total_net)}</TableCell>
                        <TableCell>
                          <Badge variant={run.status === "APPROVED" ? "success" : run.status === "PAID" ? "default" : "secondary"}>
                            {run.status === "APPROVED" ? "Aprobada" : run.status === "PAID" ? "Pagada" : "Borrador"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
