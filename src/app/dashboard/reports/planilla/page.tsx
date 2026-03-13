import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, Printer } from "lucide-react";
import { getPayrollReport } from "@/app/actions/reports";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function PlanillaReportPage() {
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

  const org = membership.organizations as any;
  const rows = await getPayrollReport(membership.organization_id);

  // Totals
  const totals = rows.reduce(
    (acc, r) => ({
      base_salary: acc.base_salary + r.base_salary,
      bonificacion: acc.bonificacion + r.bonificacion,
      total_ingresos: acc.total_ingresos + r.total_ingresos,
      igss_employee: acc.igss_employee + r.igss_employee,
      isr: acc.isr + r.isr,
      total_deducciones: acc.total_deducciones + r.total_deducciones,
      liquido: acc.liquido + r.liquido,
      igss_patronal: acc.igss_patronal + r.igss_patronal,
      irtra: acc.irtra + r.irtra,
      intecap: acc.intecap + r.intecap,
      total_costo_patronal: acc.total_costo_patronal + r.total_costo_patronal,
    }),
    {
      base_salary: 0, bonificacion: 0, total_ingresos: 0,
      igss_employee: 0, isr: 0, total_deducciones: 0, liquido: 0,
      igss_patronal: 0, irtra: 0, intecap: 0, total_costo_patronal: 0,
    }
  );

  const now = new Date();
  const monthName = now.toLocaleDateString("es-GT", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/reports" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Volver a reportes
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" /> Planilla de Sueldos y Salarios
          </h1>
          <p className="text-muted-foreground">
            {org?.name} — NIT: {org?.nit_number} — {monthName}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Empleados activos</p>
            <p className="text-2xl font-bold">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Total sueldos brutos</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.total_ingresos)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Total líquido a pagar</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.liquido)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Costo patronal total</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(totals.total_costo_patronal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Earnings & Deductions */}
      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p className="text-muted-foreground">No hay empleados activos registrados</p>
            <Link href="/dashboard/payroll/employees/new" className="mt-3 inline-block text-sm text-primary hover:underline">
              Registrar primer empleado →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalle de ingresos y deducciones</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">Empleado</TableHead>
                    <TableHead className="text-right">Sueldo base</TableHead>
                    <TableHead className="text-right">Bonificación</TableHead>
                    <TableHead className="text-right">Total ingresos</TableHead>
                    <TableHead className="text-right">IGSS (4.83%)</TableHead>
                    <TableHead className="text-right">ISR</TableHead>
                    <TableHead className="text-right">Total deducción</TableHead>
                    <TableHead className="text-right font-semibold">Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="sticky left-0 bg-background font-medium">
                        {r.employee_name}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrency(r.base_salary)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrency(r.bonificacion)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrency(r.total_ingresos)}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-red-600">{formatCurrency(r.igss_employee)}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-red-600">{formatCurrency(r.isr)}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-red-600">{formatCurrency(r.total_deducciones)}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-green-600">
                        {formatCurrency(r.liquido)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-bold">
                    <TableCell className="sticky left-0 bg-background">TOTALES</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totals.base_salary)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totals.bonificacion)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totals.total_ingresos)}</TableCell>
                    <TableCell className="text-right font-mono text-red-600">{formatCurrency(totals.igss_employee)}</TableCell>
                    <TableCell className="text-right font-mono text-red-600">{formatCurrency(totals.isr)}</TableCell>
                    <TableCell className="text-right font-mono text-red-600">{formatCurrency(totals.total_deducciones)}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">{formatCurrency(totals.liquido)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Employer Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Costos patronales</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">Empleado</TableHead>
                    <TableHead className="text-right">Sueldo base</TableHead>
                    <TableHead className="text-right">IGSS patronal (10.67%)</TableHead>
                    <TableHead className="text-right">IRTRA (1%)</TableHead>
                    <TableHead className="text-right">INTECAP (1%)</TableHead>
                    <TableHead className="text-right font-semibold">Costo total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="sticky left-0 bg-background font-medium">
                        {r.employee_name}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrency(r.base_salary)}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-orange-600">{formatCurrency(r.igss_patronal)}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-orange-600">{formatCurrency(r.irtra)}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-orange-600">{formatCurrency(r.intecap)}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold">
                        {formatCurrency(r.total_costo_patronal)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-bold">
                    <TableCell className="sticky left-0 bg-background">TOTALES</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totals.base_salary)}</TableCell>
                    <TableCell className="text-right font-mono text-orange-600">{formatCurrency(totals.igss_patronal)}</TableCell>
                    <TableCell className="text-right font-mono text-orange-600">{formatCurrency(totals.irtra)}</TableCell>
                    <TableCell className="text-right font-mono text-orange-600">{formatCurrency(totals.intecap)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totals.total_costo_patronal)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Legal Note */}
          <Card>
            <CardContent className="py-4">
              <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <p className="font-medium">📋 Nota sobre la Planilla</p>
                <ul className="mt-2 list-disc pl-4 space-y-1">
                  <li>La bonificación incentivo (Q250) no es base para IGSS, ISR ni prestaciones según Decreto 78-89.</li>
                  <li>Las cuotas de IGSS, IRTRA e INTECAP se calculan sobre el sueldo ordinario.</li>
                  <li>El ISR se calcula con el régimen simplificado (5% hasta Q150,000 / 7% excedente).</li>
                  <li>Presentar planilla del IGSS antes del día 20 del mes siguiente.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
