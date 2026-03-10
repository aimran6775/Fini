"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { useOrg } from "@/components/dashboard/shell";
import { createFixedAsset } from "@/app/actions/accounting";

const ASSET_CATEGORIES = [
  { value: "EDIFICIOS", label: "Edificios y Construcciones", rate: 5 },
  { value: "VEHICULOS", label: "Vehículos", rate: 20 },
  { value: "MAQUINARIA", label: "Maquinaria y Equipo", rate: 20 },
  { value: "MOBILIARIO", label: "Mobiliario y Enseres", rate: 20 },
  { value: "EQUIPO_COMPUTO", label: "Equipo de Cómputo", rate: 33.33 },
  { value: "HERRAMIENTAS", label: "Herramientas", rate: 25 },
  { value: "SOFTWARE", label: "Software y Licencias", rate: 33.33 },
  { value: "OTROS", label: "Otros Activos", rate: 10 },
];

export default function NewAssetPage() {
  const { currentOrg } = useOrg();
  const router = useRouter();
  const [error, setError] = useState("");
  const [category, setCategory] = useState("MAQUINARIA");

  const selectedCategory = ASSET_CATEGORIES.find((c) => c.value === category);
  const depRate = selectedCategory?.rate ?? 20;
  const usefulLife = depRate > 0 ? (100 / depRate).toFixed(1) : "0";

  async function handleSubmit(formData: FormData) {
    setError("");
    formData.set("organization_id", currentOrg.id);
    formData.set("asset_category", category);
    formData.set("depreciation_rate", String(depRate));
    formData.set("useful_life_years", usefulLife);
    const result = await createFixedAsset(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/dashboard/assets");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo Activo Fijo</h1>
        <p className="text-muted-foreground">Registrar activo con depreciación fiscal guatemalteca (Decreto 10-2012)</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset_name">Nombre del Activo *</Label>
              <Input id="asset_name" name="asset_name" required placeholder="Ej: Computadora Dell Latitude" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Categoría Fiscal *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ASSET_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label} ({c.rate}%)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="acquisition_date">Fecha de Adquisición *</Label>
                <Input id="acquisition_date" name="acquisition_date" type="date" required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="acquisition_cost">Costo de Adquisición (GTQ) *</Label>
                <Input id="acquisition_cost" name="acquisition_cost" type="number" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="residual_value">Valor Residual (GTQ)</Label>
                <Input id="residual_value" name="residual_value" type="number" step="0.01" defaultValue="0" />
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p><strong>Tasa de depreciación:</strong> {depRate}% anual</p>
              <p><strong>Vida útil:</strong> {usefulLife} años</p>
              <p><strong>Método:</strong> Línea recta</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción / Notas</Label>
              <Textarea id="description" name="description" placeholder="Detalles adicionales del activo..." />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <SubmitButton>Registrar Activo</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
