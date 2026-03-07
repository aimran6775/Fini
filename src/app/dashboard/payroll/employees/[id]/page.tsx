import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, DollarSign, Building2, CreditCard } from "lucide-react";
import { formatCurrency, formatDate, formatDPI } from "@/lib/utils";
import { TAX_RATES } from "@/lib/tax-utils";
import { EmployeeActionsClient } from "@/components/dashboard/employee-actions";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: employee, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !employee) notFound();

  const baseSalary = Number(employee.base_salary);
  const igssEmployee = baseSalary * TAX_RATES.IGSS_EMPLOYEE;
  const igssEmployer = baseSalary * TAX_RATES.IGSS_EMPLOYER;
  const irtra = baseSalary * TAX_RATES.IRTRA;
  const intecap = baseSalary * TAX_RATES.INTECAP;

  // ISR calculation
  const annualGross = baseSalary * 12;
  const taxableIncome = Math.max(0, annualGross - TAX_RATES.ISR_EMPLOYEE_DEDUCTION);
  let annualISR = 0;
  if (taxableIncome <= TAX_RATES.ISR_EMPLOYEE_THRESHOLD) {
    annualISR = taxableIncome * TAX_RATES.ISR_EMPLOYEE_LOW;
  } else {
    annualISR = TAX_RATES.ISR_EMPLOYEE_THRESHOLD * TAX_RATES.ISR_EMPLOYEE_LOW + (taxableIncome - TAX_RATES.ISR_EMPLOYEE_THRESHOLD) * TAX_RATES.ISR_EMPLOYEE_HIGH;
  }
  const monthlyISR = annualISR / 12;
  const netSalary = baseSalary - igssEmployee - monthlyISR;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/payroll">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{employee.first_name} {employee.last_name}</h1>
              <Badge variant={employee.status === "ACTIVE" ? "success" : employee.status === "TERMINATED" ? "destructive" : "secondary"}>
                {employee.status === "ACTIVE" ? "Activo" : employee.status === "TERMINATED" ? "Terminado" : "Inactivo"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{employee.position || "Sin puesto"} • {employee.department || "Sin departamento"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/payroll/employees/${id}/edit`}>
            <Button variant="outline">Editar</Button>
          </Link>
          {employee.status === "ACTIVE" && (
            <EmployeeActionsClient employeeId={employee.id} />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Datos Personales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre Completo</p>
                  <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">DPI</p>
                  <p className="font-mono">{formatDPI(employee.dpi_number)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIT</p>
                  <p className="font-mono">{employee.nit_number || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Correo</p>
                  <p>{employee.email || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p>{employee.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p>{employee.address || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><DollarSign className="h-4 w-4" /> Desglose Salarial Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Salario Base</span>
                  <span className="font-medium">{formatCurrency(baseSalary)}</span>
                </div>
                <Separator />
                <p className="text-sm font-semibold text-muted-foreground">Deducciones del Empleado</p>
                <div className="flex justify-between text-sm">
                  <span>IGSS (4.83%)</span>
                  <span className="text-red-600">-{formatCurrency(igssEmployee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ISR Retención</span>
                  <span className="text-red-600">-{formatCurrency(monthlyISR)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Salario Neto</span>
                  <span className="text-green-600">{formatCurrency(netSalary)}</span>
                </div>

                <Separator className="my-4" />
                <p className="text-sm font-semibold text-muted-foreground">Costos Patronales</p>
                <div className="flex justify-between text-sm">
                  <span>IGSS Patronal (10.67%)</span>
                  <span>{formatCurrency(igssEmployer)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IRTRA (1%)</span>
                  <span>{formatCurrency(irtra)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>INTECAP (1%)</span>
                  <span>{formatCurrency(intecap)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Costo Total Empleador</span>
                  <span>{formatCurrency(baseSalary + igssEmployer + irtra + intecap)}</span>
                </div>

                <Separator className="my-4" />
                <p className="text-sm font-semibold text-muted-foreground">Prestaciones (Provisión Mensual)</p>
                <div className="flex justify-between text-sm">
                  <span>Aguinaldo (1/12)</span>
                  <span>{formatCurrency(baseSalary / 12)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bono 14 (1/12)</span>
                  <span>{formatCurrency(baseSalary / 12)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Vacaciones (15d/365)</span>
                  <span>{formatCurrency(baseSalary * 15 / 365)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Indemnización (1/12)</span>
                  <span>{formatCurrency(baseSalary / 12)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4" /> Datos Laborales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Puesto</p>
                <p className="font-medium">{employee.position || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p>{employee.department || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jornada</p>
                <p>{employee.work_shift === "DIURNA" ? "Diurna" : employee.work_shift === "MIXTA" ? "Mixta" : "Nocturna"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Ingreso</p>
                <p>{formatDate(employee.hire_date)}</p>
              </div>
              {employee.termination_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Baja</p>
                  <p className="text-red-600">{formatDate(employee.termination_date)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">IGSS Afiliación</p>
                <p className="font-mono">{employee.igss_affiliation || "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4" /> Datos Bancarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Banco</p>
                <p>{employee.bank_name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cuenta</p>
                <p className="font-mono">{employee.bank_account || "—"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
