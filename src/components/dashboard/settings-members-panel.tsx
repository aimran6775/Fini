"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, Trash2, Shield, Clock, Mail } from "lucide-react";
import { getOrgMembers, updateMemberRole, removeMember, inviteMember, getInvitations, cancelInvitation } from "@/app/actions/settings";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  ACCOUNTANT: "Contador",
  EMPLOYEE: "Empleado",
};

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  ACCOUNTANT: "secondary",
  EMPLOYEE: "outline",
};

interface MemberRaw {
  id: string;
  role: string;
  created_at: string;
  user: { id: string; first_name: string | null; last_name: string | null }[] | { id: string; first_name: string | null; last_name: string | null } | null;
}

interface Member {
  id: string;
  role: string;
  created_at: string;
  user: { id: string; first_name: string | null; last_name: string | null } | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
}

export function SettingsMembersPanel({
  orgId,
  currentUserId,
  isAdmin,
}: {
  orgId: string;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EMPLOYEE");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  async function loadData() {
    try {
      const [m, inv] = await Promise.all([
        getOrgMembers(orgId),
        getInvitations(orgId),
      ]);
      // Supabase returns user as array for .select join; normalize to single object
      const normalized = (m as MemberRaw[]).map((member) => ({
        ...member,
        user: Array.isArray(member.user) ? member.user[0] ?? null : member.user,
      }));
      setMembers(normalized);
      setInvitations(inv as Invitation[]);
    } catch {
      setError("Error al cargar miembros");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  async function handleRoleChange(memberId: string, newRole: string) {
    const result = await updateMemberRole(memberId, newRole);
    if (result?.error) {
      setError(result.error);
    } else {
      loadData();
    }
  }

  async function handleRemove(memberId: string) {
    const result = await removeMember(memberId);
    if (result?.error) {
      setError(result.error);
    } else {
      setConfirmRemove(null);
      loadData();
    }
  }

  async function handleInvite() {
    if (!inviteEmail) return;
    setInviting(true);
    setError("");
    const result = await inviteMember(orgId, inviteEmail, inviteRole);
    if (result?.error) {
      setError(result.error);
    } else {
      setInviteEmail("");
      setInviteRole("EMPLOYEE");
      setInviteOpen(false);
      loadData();
    }
    setInviting(false);
  }

  async function handleCancelInvite(invitationId: string) {
    const result = await cancelInvitation(invitationId);
    if (result?.error) {
      setError(result.error);
    } else {
      loadData();
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Members Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Miembros del equipo
          </CardTitle>
          {isAdmin && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" /> Invitar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invitar miembro</DialogTitle>
                  <DialogDescription>
                    Envía una invitación por correo electrónico. Expira en 7 días.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Correo electrónico</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="usuario@empresa.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Rol</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="ACCOUNTANT">Contador</SelectItem>
                        <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
                  <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    {inviting ? "Enviando..." : "Enviar invitación"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-muted-foreground">Cargando...</p>
          ) : members.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay miembros</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Miembro desde</TableHead>
                  {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isCurrentUser = member.user?.id === currentUserId;
                  const name = member.user
                    ? `${member.user.first_name || ""} ${member.user.last_name || ""}`.trim() || "Sin nombre"
                    : "Usuario eliminado";

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{name}</span>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">Tú</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isAdmin && !isCurrentUser ? (
                          <Select
                            value={member.role}
                            onValueChange={(val) => handleRoleChange(member.id, val)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">Administrador</SelectItem>
                              <SelectItem value="ACCOUNTANT">Contador</SelectItem>
                              <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={ROLE_VARIANTS[member.role] || "outline"}>
                            <Shield className="mr-1 h-3 w-3" />
                            {ROLE_LABELS[member.role] || member.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString("es-GT")}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          {!isCurrentUser && (
                            <>
                              {confirmRemove === member.id ? (
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-xs text-muted-foreground">¿Confirmar?</span>
                                  <Button size="sm" variant="destructive" onClick={() => handleRemove(member.id)}>
                                    Sí
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setConfirmRemove(null)}>
                                    No
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => setConfirmRemove(member.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {isAdmin && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Invitaciones pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANTS[inv.role] || "outline"}>
                        {ROLE_LABELS[inv.role] || inv.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(inv.expires_at).toLocaleDateString("es-GT")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleCancelInvite(inv.id)}
                      >
                        Cancelar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
