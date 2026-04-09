import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activos Fijos — FiniTax GT",
  description: "Control de activos con depreciación fiscal guatemalteca",
};

// Guatemala fiscal depreciation rates (Decreto 10-2012)
const DEPRECIATION_RATES: Record<string, { rate: number; label: string }> = {
  EDIFICIOS: { rate: 0.05, label: "Edificios y Construcciones" },
  VEHICULOS: { rate: 0.2, label: "Vehículos" },
  MAQUINARIA: { rate: 0.2, label: "Maquinaria y Equipo" },
  MOBILIARIO: { rate: 0.2, label: "Mobiliario y Enseres" },
  EQUIPO_COMPUTO: { rate: 0.3333, label: "Equipo de Cómputo" },
  HERRAMIENTAS: { rate: 0.25, label: "Herramientas" },
  SOFTWARE: { rate: 0.3333, label: "Software y Licencias" },
  OTROS: { rate: 0.1, label: "Otros Activos" },
};

export default async function AssetsPage() {
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

  const { data: assets } = await supabase
    .from("fixed_assets")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("acquisition_date", { ascending: false });

  const totalValue = assets?.reduce((s, a: any) => s + Number(a.acquisition_cost || 0), 0) ?? 0;
  const totalDepreciation = assets?.reduce((s, a: any) => s + Number(a.accumulated_depreciation || 0), 0) ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1>Activos Fijos</h1>
          <p>Control de activos con depreciación fiscal guatemalteca</p>
        </div>
        <Link href="/dashboard/assets/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Activo</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Valor Total Adquisición</p>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Depreciación Acumulada</p>
            <p className="text-xl font-bold text-red-600 tabular-nums">{formatCurrency(totalDepreciation)}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Valor en Libros</p>
            <p className="text-xl font-bold text-emerald-600 tabular-nums">{formatCurrency(totalValue - totalDepreciation)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Depreciation rates reference */}
      <Card>
        <CardHeader><CardTitle>Tasas de Depreciación Fiscal (Decreto 10-2012)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.values(DEPRECIATION_RATES).map((r) => (
              <div key={r.label} className="rounded-xl border border-border/60 p-3 text-center shadow-sm">
                <p className="text-[11px] text-muted-foreground">{r.label}</p>
                <p className="text-lg font-bold text-primary tabular-nums">{(r.rate * 100).toFixed(r.rate === 0.3333 ? 2 : 0)}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lista de Activos</CardTitle></CardHeader>
        <CardContent>
          {!assets || assets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay activos fijos registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fecha Adquisición</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Depreciación</TableHead>
                  <TableHead className="text-right">Valor Libros</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.asset_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {DEPRECIATION_RATES[a.asset_category]?.label || a.asset_category}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(a.acquisition_date).toLocaleDateString("es-GT")}</TableCell>
                    <TableCell className="text-right">{formatCurrency(a.acquisition_cost)}</TableCell>
                    <TableCell className="text-right text-red-600">{formatCurrency(a.accumulated_depreciation || 0)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(a.acquisition_cost) - Number(a.accumulated_depreciation || 0))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.status === "ACTIVE" ? "success" : "secondary"}>
                        {a.status === "ACTIVE" ? "Activo" : a.status === "DISPOSED" ? "Dado de baja" : "Depreciado"}
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
