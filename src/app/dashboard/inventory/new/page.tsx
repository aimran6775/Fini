"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { createInventoryItem } from "@/app/actions/banking";
import { useOrg } from "@/components/dashboard/shell";

export default function NewInventoryPage() {
  const { currentOrg } = useOrg();
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    formData.set("organization_id", currentOrg.id);
    const result = await createInventoryItem(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/dashboard/inventory");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo Producto / Servicio</h1>
        <p className="text-muted-foreground">Agregar ítem al inventario</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Código</Label>
                <Input id="sku" name="sku" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cost_price">Costo (GTQ)</Label>
                <Input id="cost_price" name="cost_price" type="number" step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_price">Precio Venta (GTQ)</Label>
                <Input id="unit_price" name="unit_price" type="number" step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_stock">Cantidad en Stock</Label>
                <Input id="current_stock" name="current_stock" type="number" min="0" defaultValue="0" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="unit_of_measure">Unidad de Medida</Label>
                <Input id="unit_of_measure" name="unit_of_measure" placeholder="UND, Kg, Litro, etc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock">Stock Mínimo</Label>
                <Input id="min_stock" name="min_stock" type="number" min="0" defaultValue="0" />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <SubmitButton>Guardar Producto</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
