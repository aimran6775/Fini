import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Pagination } from "@/components/dashboard/pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventario — FiniTax GT",
  description: "Productos, servicios y control de existencias",
};

export default async function InventoryPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

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

  // Paginated query for table
  const { data: items, count: itemsCount } = await supabase
    .from("inventory_items")
    .select("*", { count: "exact" })
    .eq("organization_id", membership.organization_id)
    .order("name")
    .range(from, to);

  // KPI aggregates (use full dataset counts)
  const { count: totalCount } = await supabase
    .from("inventory_items")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", membership.organization_id);

  const totalValue = items?.reduce((sum: number, i: any) =>
    sum + Number(i.cost_price || 0) * Number(i.current_stock || 0), 0) ?? 0;

  const lowStock = items?.filter((i: any) =>
    Number(i.current_stock) <= Number(i.min_stock) && Number(i.min_stock) > 0).length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1>Inventario</h1>
          <p>Productos, servicios y control de existencias</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/imports/ai-workspace">
            <Button variant="outline"><Sparkles className="mr-2 h-4 w-4 text-amber-400" /> Importar con IA</Button>
          </Link>
          <Link href="/dashboard/inventory/new">
            <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Producto</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Valor del Inventario</p>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Total Productos</p>
            <p className="text-2xl font-bold tabular-nums">{totalCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Stock Bajo</p>
            <p className="text-2xl font-bold text-orange-600 tabular-nums">
              {lowStock > 0 && <AlertTriangle className="inline h-5 w-5 mr-1" />}
              {lowStock}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Productos y Servicios</CardTitle></CardHeader>
        <CardContent>
          {!items || items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay productos registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Precio Venta</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any) => (
                  <TableRow key={item.id} className={Number(item.current_stock) <= Number(item.min_stock) && Number(item.min_stock) > 0 ? "bg-orange-50 dark:bg-orange-950/30" : ""}>
                    <TableCell className="font-mono text-xs">{item.sku || "—"}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category || "—"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.cost_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right">{`${item.current_stock} ${item.unit_of_measure}`}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Pagination totalItems={itemsCount ?? 0} pageSize={pageSize} />
    </div>
  );
}
