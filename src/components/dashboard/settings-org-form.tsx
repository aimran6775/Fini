"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save } from "lucide-react";
import { updateOrganization } from "@/app/actions/settings";

interface OrgData {
  id: string;
  name: string;
  nit_number: string;
  contribuyente_type: string;
  isr_regime: string;
  address: string | null;
  municipality: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  industry_code: string | null;
  fel_certificador: string | null;
  fel_nit_certificador: string | null;
}

export function SettingsOrgForm({ org, isAdmin }: { org: OrgData; isAdmin: boolean }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateOrganization(org.id, formData);

    if (result && "error" in result && result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  const DEPARTMENTS = [
    "Guatemala", "El Progreso", "Sacatepéquez", "Chimaltenango", "Escuintla",
    "Santa Rosa", "Sololá", "Totonicapán", "Quetzaltenango", "Suchitepéquez",
    "Retalhuleu", "San Marcos", "Huehuetenango", "Quiché", "Baja Verapaz",
    "Alta Verapaz", "Petén", "Izabal", "Zacapa", "Chiquimula", "Jalapa", "Jutiapa",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" /> Datos de la Organización
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950 dark:text-green-400">
              ✓ Cambios guardados exitosamente
            </div>
          )}

          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la empresa *</Label>
              <Input id="name" name="name" defaultValue={org.name} required disabled={!isAdmin} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nit_number">NIT *</Label>
              <Input id="nit_number" name="nit_number" defaultValue={org.nit_number} required disabled={!isAdmin} placeholder="12345678-9" />
            </div>
          </div>

          {/* Tax Config */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contribuyente_type">Tipo de Contribuyente</Label>
              <Select name="contribuyente_type" defaultValue={org.contribuyente_type} disabled={!isAdmin}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="PEQUENO">Pequeño Contribuyente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="isr_regime">Régimen ISR</Label>
              <Select name="isr_regime" defaultValue={org.isr_regime} disabled={!isAdmin}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTILIDADES">Sobre las Utilidades (25%)</SelectItem>
                  <SelectItem value="SIMPLIFICADO">Simplificado (5% / 7%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" defaultValue={org.email || ""} disabled={!isAdmin} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" defaultValue={org.phone || ""} disabled={!isAdmin} />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" defaultValue={org.address || ""} disabled={!isAdmin} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select name="department" defaultValue={org.department || ""} disabled={!isAdmin}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="municipality">Municipio</Label>
              <Input id="municipality" name="municipality" defaultValue={org.municipality || ""} disabled={!isAdmin} />
            </div>
          </div>

          {/* FEL Config */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Configuración FEL</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fel_certificador">Certificador FEL</Label>
                <Input id="fel_certificador" name="fel_certificador" defaultValue={org.fel_certificador || ""} disabled={!isAdmin} placeholder="Ej: INFILE, GUATEFACTURAS" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fel_nit_certificador">NIT del Certificador</Label>
                <Input id="fel_nit_certificador" name="fel_nit_certificador" defaultValue={org.fel_nit_certificador || ""} disabled={!isAdmin} />
              </div>
            </div>
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry_code">Código de actividad económica</Label>
            <Input id="industry_code" name="industry_code" defaultValue={org.industry_code || ""} disabled={!isAdmin} placeholder="Ej: 4711" />
          </div>

          {isAdmin && (
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          )}

          {!isAdmin && (
            <p className="text-sm text-muted-foreground">
              Solo los administradores pueden editar la información de la organización.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
