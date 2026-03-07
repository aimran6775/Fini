"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { updateEmployee } from "@/app/actions/payroll";

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dpiNumber, setDpiNumber] = useState("");
  const [nitNumber, setNitNumber] = useState("");
  const [igssAffiliation, setIgssAffiliation] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [baseSalary, setBaseSalary] = useState(0);
  const [workShift, setWorkShift] = useState("DIURNA");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    async function load() {
      const { id } = await params;
      setEmployeeId(id);

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) {
        router.push("/dashboard/payroll");
        return;
      }

      setFirstName(data.first_name);
      setLastName(data.last_name);
      setDpiNumber(data.dpi_number);
      setNitNumber(data.nit_number || "");
      setIgssAffiliation(data.igss_affiliation || "");
      setPosition(data.position || "");
      setDepartment(data.department || "");
      setBaseSalary(Number(data.base_salary));
      setWorkShift(data.work_shift);
      setBankAccount(data.bank_account || "");
      setBankName(data.bank_name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setLoading(false);
    }
    load();
  }, [params, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.set("first_name", firstName);
    formData.set("last_name", lastName);
    formData.set("dpi_number", dpiNumber);
    formData.set("nit_number", nitNumber);
    formData.set("igss_affiliation", igssAffiliation);
    formData.set("position", position);
    formData.set("department", department);
    formData.set("base_salary", String(baseSalary));
    formData.set("work_shift", workShift);
    formData.set("bank_account", bankAccount);
    formData.set("bank_name", bankName);
    formData.set("email", email);
    formData.set("phone", phone);
    formData.set("address", address);

    const result = await updateEmployee(employeeId, formData);
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    } else {
      router.push(`/dashboard/payroll/employees/${employeeId}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/payroll/employees/${employeeId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Empleado</h1>
          <p className="text-muted-foreground">{firstName} {lastName}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Datos Personales</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nombre</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <Label>Apellido</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <div>
              <Label>DPI</Label>
              <Input value={dpiNumber} onChange={(e) => setDpiNumber(e.target.value)} required placeholder="1234 56789 0101" />
            </div>
            <div>
              <Label>NIT</Label>
              <Input value={nitNumber} onChange={(e) => setNitNumber(e.target.value)} placeholder="1234567-8" />
            </div>
            <div>
              <Label>Correo</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Dirección</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Datos Laborales</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Puesto</Label>
              <Input value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
            <div>
              <Label>Departamento</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div>
              <Label>Salario Base (Q)</Label>
              <Input type="number" min="0" step="0.01" value={baseSalary} onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)} required />
            </div>
            <div>
              <Label>Jornada</Label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={workShift}
                onChange={(e) => setWorkShift(e.target.value)}
              >
                <option value="DIURNA">Diurna</option>
                <option value="MIXTA">Mixta</option>
                <option value="NOCTURNA">Nocturna</option>
              </select>
            </div>
            <div>
              <Label>IGSS Afiliación</Label>
              <Input value={igssAffiliation} onChange={(e) => setIgssAffiliation(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Datos Bancarios</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Banco</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Banco Industrial" />
            </div>
            <div>
              <Label>Número de Cuenta</Label>
              <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href={`/dashboard/payroll/employees/${employeeId}`}>
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
