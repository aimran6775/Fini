import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Calculator, DollarSign, Receipt, FileText, TrendingUp, TrendingDown, 
  Wallet, Building2, Plus, PiggyBank, ArrowDownRight, ArrowUpRight 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { formatGTQ, TAX_RATES, INCOME_TYPE_LABELS, DEDUCTION_TYPE_LABELS, RETENTION_TYPE_LABELS } from "@/lib/tax-utils";
import Link from "next/link";
import { PersonalTaxCalculator } from "@/components/dashboard/personal-tax-calculator";
import { AddIncomeForm } from "@/components/dashboard/add-income-form";
import { AddDeductionForm } from "@/components/dashboard/add-deduction-form";
import { AddRetencionForm } from "@/components/dashboard/add-retencion-form";
import { YearSelector } from "@/components/dashboard/year-selector";
import { PersonalTaxExportButton } from "@/components/dashboard/personal-tax-export";
import { 
  getPersonalIncome, 
  getPersonalDeductions, 
  getIsrRetenciones, 
  calculatePersonalTax 
} from "@/app/actions/personal-tax";

export default async function PersonalTaxPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organization:organizations(name, nit_number, org_type)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");
  
  const orgId = membership.organization_id;
  const currentYear = new Date().getFullYear();
  const selectedYear = parseInt(params.year || String(currentYear));
  const activeTab = params.tab || "resumen";

  // Fetch all data
  const [incomes, deductions, retencionesRecibidas, retencionesMade, taxSummary] = await Promise.all([
    getPersonalIncome(orgId, selectedYear),
    getPersonalDeductions(orgId, selectedYear),
    getIsrRetenciones(orgId, selectedYear, "RECEIVED"),
    getIsrRetenciones(orgId, selectedYear, "MADE"),
    calculatePersonalTax(orgId, selectedYear),
  ]);

  const totalIncome = taxSummary.income.total;
  const totalDeductions = taxSummary.deductions.total;
  const totalRetenciones = taxSummary.retention.isrRetenido;
  const isrResult = taxSummary.calculation.isrAPagar > 0 
    ? { type: "pagar", amount: taxSummary.calculation.isrAPagar }
    : { type: "favor", amount: taxSummary.calculation.isrAFavor };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1 className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Impuestos Personales
          </h1>
          <p>
            Gestiona tus ingresos, deducciones y calcula tu ISR personal — Año {selectedYear}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PersonalTaxExportButton
            orgId={orgId}
            orgName={(membership.organization as any)?.name || "Mi Empresa"}
            year={selectedYear}
            incomes={incomes}
            deductions={deductions}
            retenciones={retencionesRecibidas}
          />
          <YearSelector currentYear={currentYear} />
          <Link href="/dashboard/tax">
            <Button variant="outline" size="sm">
              <Building2 className="mr-2 h-4 w-4" />
              Impuestos Empresa
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Brutos</p>
                <p className="text-2xl font-bold">{formatGTQ(totalIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deducciones</p>
                <p className="text-2xl font-bold">{formatGTQ(totalDeductions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-100 p-2">
                <Receipt className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ISR Retenido</p>
                <p className="text-2xl font-bold">{formatGTQ(totalRetenciones)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={isrResult.type === "pagar" ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40" : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/40"}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${isrResult.type === "pagar" ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900"}`}>
                {isrResult.type === "pagar" 
                  ? <ArrowUpRight className="h-5 w-5 text-red-600" />
                  : <ArrowDownRight className="h-5 w-5 text-green-600" />
                }
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isrResult.type === "pagar" ? "ISR a Pagar" : "ISR a Favor"}
                </p>
                <p className={`text-2xl font-bold ${isrResult.type === "pagar" ? "text-red-700" : "text-green-700"}`}>
                  {formatGTQ(isrResult.amount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="deducciones">Deducciones</TabsTrigger>
          <TabsTrigger value="retenciones">Retenciones</TabsTrigger>
          <TabsTrigger value="calcular">Calcular ISR</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="resumen" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Income Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumen de Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Trabajo Dependiente</span>
                  <span className="font-medium">{formatGTQ(taxSummary.income.trabajoDependiente)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Trabajo Independiente</span>
                  <span className="font-medium">{formatGTQ(taxSummary.income.trabajoIndependiente)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Capital Mobiliario</span>
                  <span className="font-medium">{formatGTQ(taxSummary.income.capitalMobiliario)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Capital Inmobiliario</span>
                  <span className="font-medium">{formatGTQ(taxSummary.income.capitalInmobiliario)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Ganancias de Capital</span>
                  <span className="font-medium">{formatGTQ(taxSummary.income.gananciasCapital)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Otros</span>
                  <span className="font-medium">{formatGTQ(taxSummary.income.otros)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg">
                  <span>Total Ingresos</span>
                  <span className="text-green-600">{formatGTQ(taxSummary.income.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Deductions Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Resumen de Deducciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Deducción Fija</span>
                  <span className="font-medium">{formatGTQ(taxSummary.deductions.deduccionFija)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">IVA Personal (max 12%)</span>
                  <span className="font-medium">{formatGTQ(taxSummary.deductions.ivaPersonal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Donaciones (max 5%)</span>
                  <span className="font-medium">{formatGTQ(taxSummary.deductions.donaciones)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Cuotas IGSS</span>
                  <span className="font-medium">{formatGTQ(taxSummary.deductions.cuotasIgss)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Otras Deducciones</span>
                  <span className="font-medium">{formatGTQ(taxSummary.deductions.otras)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg">
                  <span>Total Deducciones</span>
                  <span className="text-blue-600">{formatGTQ(taxSummary.deductions.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ISR Calculation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Cálculo ISR — {selectedYear}
              </CardTitle>
              <CardDescription>
                Tasas: 5% hasta Q300,000 | 7% sobre excedente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-gray-50 dark:bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">Renta Imponible</p>
                  <p className="text-xl font-bold">{formatGTQ(taxSummary.calculation.rentaImponible)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">ISR Causado</p>
                  <p className="text-xl font-bold">{formatGTQ(taxSummary.calculation.isrBruto)}</p>
                </div>
                <div className="rounded-lg bg-orange-50 dark:bg-orange-950/40 p-4 text-center">
                  <p className="text-sm text-muted-foreground">ISR Retenido</p>
                  <p className="text-xl font-bold text-orange-600">{formatGTQ(taxSummary.calculation.isrRetenido)}</p>
                </div>
                <div className={`rounded-lg p-4 text-center ${isrResult.type === "pagar" ? "bg-red-50 dark:bg-red-950/40" : "bg-green-50 dark:bg-green-950/40"}`}>
                  <p className="text-sm text-muted-foreground">
                    {isrResult.type === "pagar" ? "ISR a Pagar" : "ISR a Favor"}
                  </p>
                  <p className={`text-xl font-bold ${isrResult.type === "pagar" ? "text-red-600" : "text-green-600"}`}>
                    {formatGTQ(isrResult.amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="ingresos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Mis Ingresos — {selectedYear}</h3>
            <AddIncomeForm orgId={orgId} />
          </div>
          
          <Card>
            <CardContent className="p-0">
              {incomes.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <DollarSign className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No hay ingresos registrados para {selectedYear}</p>
                  <p className="text-sm">Agrega tus ingresos para calcular tu ISR</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead className="text-right">Bruto</TableHead>
                      <TableHead className="text-right">ISR Ret.</TableHead>
                      <TableHead className="text-right">Neto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomes.map((inc: any) => (
                      <TableRow key={inc.id}>
                        <TableCell>{new Date(inc.income_date).toLocaleDateString("es-GT")}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{INCOME_TYPE_LABELS[inc.income_type] || inc.income_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{inc.description}</TableCell>
                        <TableCell>{inc.source_name || "—"}</TableCell>
                        <TableCell className="text-right font-medium">{formatGTQ(inc.gross_amount)}</TableCell>
                        <TableCell className="text-right text-orange-600">{formatGTQ(inc.isr_withheld)}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">{formatGTQ(inc.net_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deductions Tab */}
        <TabsContent value="deducciones" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Mis Deducciones — {selectedYear}</h3>
              <p className="text-sm text-muted-foreground">
                La deducción fija de Q48,000 se aplica automáticamente
              </p>
            </div>
            <AddDeductionForm orgId={orgId} />
          </div>
          
          <Card>
            <CardContent className="p-0">
              {deductions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <PiggyBank className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No hay deducciones adicionales registradas</p>
                  <p className="text-sm">La deducción fija de Q48,000 ya está incluida</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deductions.map((ded: any) => (
                      <TableRow key={ded.id}>
                        <TableCell>{new Date(ded.deduction_date).toLocaleDateString("es-GT")}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{DEDUCTION_TYPE_LABELS[ded.deduction_type] || ded.deduction_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{ded.description}</TableCell>
                        <TableCell>{ded.document_ref || "—"}</TableCell>
                        <TableCell className="text-right font-medium text-blue-600">{formatGTQ(ded.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={ded.is_verified ? "success" : "warning"}>
                            {ded.is_verified ? "Verificada" : "Pendiente"}
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

        {/* Retenciones Tab */}
        <TabsContent value="retenciones" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Retenciones ISR — {selectedYear}</h3>
            <AddRetencionForm orgId={orgId} />
          </div>
          
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Retenciones Recibidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
                  Retenciones que me Aplicaron
                </CardTitle>
                <CardDescription>ISR retenido por terceros — Acreditable</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {retencionesRecibidas.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-sm">No hay retenciones recibidas</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Retenedor</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retencionesRecibidas.map((ret: any) => (
                        <TableRow key={ret.id}>
                          <TableCell>{new Date(ret.constancia_date).toLocaleDateString("es-GT")}</TableCell>
                          <TableCell className="max-w-[120px] truncate">{ret.retenedor_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {RETENTION_TYPE_LABELS[ret.retention_type] || ret.retention_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatGTQ(ret.retention_amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Retenciones Hechas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-orange-600" />
                  Retenciones que Apliqué
                </CardTitle>
                <CardDescription>ISR que retuve a terceros — Debo enterar a SAT</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {retencionesMade.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-sm">No hay retenciones realizadas</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Beneficiario</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retencionesMade.map((ret: any) => (
                        <TableRow key={ret.id}>
                          <TableCell>{new Date(ret.constancia_date).toLocaleDateString("es-GT")}</TableCell>
                          <TableCell className="max-w-[120px] truncate">{ret.beneficiario_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {RETENTION_TYPE_LABELS[ret.retention_type] || ret.retention_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-orange-600">
                            {formatGTQ(ret.retention_amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calculate Tab */}
        <TabsContent value="calcular">
          <PersonalTaxCalculator 
            orgId={orgId} 
            year={selectedYear} 
            initialSummary={taxSummary} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
