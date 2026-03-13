import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TAX_RATES } from "@/lib/tax-utils";
import { Building2, Users, CreditCard, Shield, User } from "lucide-react";
import { SettingsOrgForm } from "@/components/dashboard/settings-org-form";
import { SettingsMembersPanel } from "@/components/dashboard/settings-members-panel";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  ACCOUNTANT: "Contador",
  EMPLOYEE: "Empleado",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(*)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");
  const org = membership.organizations as any;
  const isAdmin = membership.role === "ADMIN";

  // Get user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("first_name, last_name, phone, dpi_number")
    .eq("id", user.id)
    .single();

  // Count members
  const { count: memberCount } = await supabase
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", membership.organization_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Administra tu organización, equipo y preferencias</p>
      </div>

      <Tabs defaultValue="org" className="space-y-6">
        <TabsList>
          <TabsTrigger value="org" className="gap-2">
            <Building2 className="h-4 w-4" /> Organización
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" /> Equipo
            <Badge variant="secondary" className="ml-1 text-xs">{memberCount || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" /> Mi Cuenta
          </TabsTrigger>
          <TabsTrigger value="tax" className="gap-2">
            <CreditCard className="h-4 w-4" /> Fiscal
          </TabsTrigger>
        </TabsList>

        {/* ── Organización ──────────────────────────────────────── */}
        <TabsContent value="org">
          <SettingsOrgForm
            org={{
              id: membership.organization_id,
              name: org?.name || "",
              nit_number: org?.nit_number || "",
              contribuyente_type: org?.contribuyente_type || "GENERAL",
              isr_regime: org?.isr_regime || "UTILIDADES",
              address: org?.address || null,
              municipality: org?.municipality || null,
              department: org?.department || null,
              phone: org?.phone || null,
              email: org?.email || null,
              industry_code: org?.industry_code || null,
              fel_certificador: org?.fel_certificador || null,
              fel_nit_certificador: org?.fel_nit_certificador || null,
            }}
            isAdmin={isAdmin}
          />
        </TabsContent>

        {/* ── Equipo ────────────────────────────────────────────── */}
        <TabsContent value="members">
          <SettingsMembersPanel
            orgId={membership.organization_id}
            currentUserId={user.id}
            isAdmin={isAdmin}
          />
        </TabsContent>

        {/* ── Mi Cuenta ─────────────────────────────────────────── */}
        <TabsContent value="account">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Información personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">
                    {profile?.first_name || ""} {profile?.last_name || ""}
                    {!profile?.first_name && !profile?.last_name && <span className="text-muted-foreground">Sin nombre registrado</span>}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Correo electrónico</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p>{profile?.phone || <span className="text-muted-foreground">—</span>}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">DPI</p>
                  <p className="font-mono">{profile?.dpi_number || <span className="text-muted-foreground">—</span>}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Acceso y seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Rol en la organización</p>
                  <Badge variant={membership.role === "ADMIN" ? "default" : membership.role === "ACCOUNTANT" ? "secondary" : "outline"}>
                    {ROLE_LABELS[membership.role] || membership.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID de usuario</p>
                  <p className="font-mono text-xs break-all">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proveedor de autenticación</p>
                  <p className="capitalize">{user.app_metadata?.provider || "email"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Último inicio de sesión</p>
                  <p>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString("es-GT") : "—"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Configuración Fiscal ──────────────────────────────── */}
        <TabsContent value="tax">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Tasas Impositivas (Guatemala)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">IVA (incluido en precio)</span>
                    <span className="font-mono font-medium">{TAX_RATES.IVA * 100}%</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">ISR — Utilidades</span>
                    <span className="font-mono font-medium">{TAX_RATES.ISR_UTILIDADES * 100}%</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">ISR — Simplificado (hasta Q30k/mes)</span>
                    <span className="font-mono font-medium">{TAX_RATES.ISR_SIMPLIFICADO_LOW * 100}%</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">ISR — Simplificado (exceso Q30k/mes)</span>
                    <span className="font-mono font-medium">{TAX_RATES.ISR_SIMPLIFICADO_HIGH * 100}%</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">ISO</span>
                    <span className="font-mono font-medium">{TAX_RATES.ISO * 100}%</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">IGSS — Empleado</span>
                    <span className="font-mono font-medium">{TAX_RATES.IGSS_EMPLOYEE * 100}%</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">IGSS — Patronal</span>
                    <span className="font-mono font-medium">{TAX_RATES.IGSS_EMPLOYER * 100}%</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">IRTRA</span>
                    <span className="font-mono font-medium">{TAX_RATES.IRTRA * 100}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">INTECAP</span>
                    <span className="font-mono font-medium">{TAX_RATES.INTECAP * 100}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Régimen actual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Contribuyente</p>
                  <p className="font-medium">
                    {org?.contribuyente_type === "GENERAL" ? "General" : "Pequeño Contribuyente"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Régimen ISR</p>
                  <p className="font-medium">
                    {org?.isr_regime === "UTILIDADES"
                      ? "Sobre las Utilidades (25%)"
                      : "Simplificado (5% / 7%)"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Moneda principal</p>
                  <p className="font-medium">GTQ — Quetzal Guatemalteco</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Certificador FEL</p>
                  <p className="font-medium">{org?.fel_certificador || <span className="text-muted-foreground">No configurado</span>}</p>
                </div>
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <p className="font-medium">ℹ️ Nota</p>
                  <p>Las tasas impositivas son definidas por la SAT y no se pueden modificar. Para cambiar el tipo de contribuyente o régimen ISR, edita los datos de la organización en la pestaña &quot;Organización&quot;.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
