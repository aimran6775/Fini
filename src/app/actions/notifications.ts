"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return data ?? [];
}

export async function getUnreadCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return count || 0;
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function createNotification(data: {
  organization_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  priority?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .insert({
      ...data,
      priority: data.priority || "MEDIUM",
      is_read: false,
    });

  if (error) return { error: error.message };
  return { success: true };
}

// ─── Tax Deadline Notifications ────────────────────────────────

const TAX_DEADLINES = [
  { name: "IVA Mensual", day: 15, description: "Declaración y pago del IVA del mes anterior" },
  { name: "Planilla IGSS", day: 20, description: "Pago de cuotas patronales y laborales del IGSS" },
  { name: "ISR Trimestral", months: [4, 7, 10, 1], day: 10, description: "Pago trimestral de ISR" },
  { name: "ISO Trimestral", months: [4, 7, 10, 1], day: 10, description: "Pago trimestral del Impuesto de Solidaridad" },
  { name: "Declaración Anual ISR", months: [3], day: 31, description: "Declaración anual del Impuesto Sobre la Renta" },
];

export async function generateTaxDeadlineNotifications(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const notifications: { title: string; message: string; daysUntil: number }[] = [];

  for (const deadline of TAX_DEADLINES) {
    let isRelevant = false;
    let deadlineDate: Date | null = null;

    if (deadline.months) {
      if (deadline.months.includes(currentMonth)) {
        isRelevant = true;
        deadlineDate = new Date(today.getFullYear(), currentMonth - 1, deadline.day);
      }
    } else {
      isRelevant = true;
      deadlineDate = new Date(today.getFullYear(), currentMonth - 1, deadline.day);
      if (currentDay > deadline.day) {
        deadlineDate = new Date(today.getFullYear(), currentMonth, deadline.day);
      }
    }

    if (isRelevant && deadlineDate) {
      const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil >= 0 && daysUntil <= 7) {
        notifications.push({
          title: `Vencimiento: ${deadline.name}`,
          message: `${deadline.description}. Vence en ${daysUntil} día${daysUntil !== 1 ? "s" : ""}.`,
          daysUntil,
        });
      }
    }
  }

  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id, role")
    .eq("organization_id", orgId)
    .in("role", ["admin", "accountant"]);

  let created = 0;
  for (const notification of notifications) {
    for (const member of members || []) {
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", member.user_id)
        .eq("organization_id", orgId)
        .eq("title", notification.title)
        .eq("is_read", false)
        .limit(1)
        .single();

      if (!existing) {
        await createNotification({
          user_id: member.user_id,
          organization_id: orgId,
          type: "TAX_DEADLINE",
          title: notification.title,
          message: notification.message,
          priority: notification.daysUntil <= 2 ? "HIGH" : notification.daysUntil <= 5 ? "MEDIUM" : "LOW",
          link: "/dashboard/tax",
        });
        created++;
      }
    }
  }

  revalidatePath("/dashboard/notifications");
  return { success: true, created };
}

// ─── Invoice Due Notifications ─────────────────────────────────

export async function generateInvoiceDueNotifications(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: dueInvoices } = await supabase
    .from("fel_invoices")
    .select("id, client_name, total, due_date, contact:contacts(name)")
    .eq("organization_id", orgId)
    .eq("status", "CERTIFIED")
    .neq("payment_status", "PAID")
    .lte("due_date", weekFromNow)
    .gte("due_date", today);

  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id, role")
    .eq("organization_id", orgId)
    .in("role", ["admin", "accountant"]);

  let created = 0;
  for (const invoice of dueInvoices || []) {
    const clientName = (invoice.contact as any)?.name || invoice.client_name || "Cliente";
    const dueDate = new Date(invoice.due_date as string);
    const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    for (const member of members || []) {
      const title = `Factura por cobrar: ${clientName}`;
      
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", member.user_id)
        .eq("organization_id", orgId)
        .ilike("title", title)
        .eq("is_read", false)
        .limit(1)
        .single();

      if (!existing) {
        await createNotification({
          user_id: member.user_id,
          organization_id: orgId,
          type: "INVOICE_DUE",
          title,
          message: `Q${invoice.total?.toFixed(2)} vence en ${daysUntil} día${daysUntil !== 1 ? "s" : ""}.`,
          priority: daysUntil <= 2 ? "HIGH" : "MEDIUM",
          link: `/dashboard/invoices/${invoice.id}`,
        });
        created++;
      }
    }
  }

  revalidatePath("/dashboard/notifications");
  return { success: true, created };
}

// ─── Pending Approval Notifications ────────────────────────────

export async function generateApprovalNotifications(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count: pendingExpenses } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("status", "DRAFT");

  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id, role")
    .eq("organization_id", orgId)
    .in("role", ["admin", "accountant"]);

  let created = 0;

  if ((pendingExpenses ?? 0) > 0) {
    for (const member of members || []) {
      const title = `${pendingExpenses} gasto${(pendingExpenses ?? 0) !== 1 ? "s" : ""} pendiente${(pendingExpenses ?? 0) !== 1 ? "s" : ""}`;
      
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", member.user_id)
        .eq("organization_id", orgId)
        .eq("type", "APPROVAL_REQUIRED")
        .eq("is_read", false)
        .limit(1)
        .single();

      if (!existing) {
        await createNotification({
          user_id: member.user_id,
          organization_id: orgId,
          type: "APPROVAL_REQUIRED",
          title,
          message: "Hay gastos que requieren tu aprobación.",
          priority: "MEDIUM",
          link: "/dashboard/expenses?status=DRAFT",
        });
        created++;
      }
    }
  }

  revalidatePath("/dashboard/notifications");
  return { success: true, created };
}

// ─── Generate All Notifications ────────────────────────────────

export async function refreshAllNotifications(orgId: string) {
  const results = await Promise.all([
    generateTaxDeadlineNotifications(orgId),
    generateInvoiceDueNotifications(orgId),
    generateApprovalNotifications(orgId),
  ]);

  const totalCreated = results.reduce((sum, r) => sum + (r.created || 0), 0);
  return { success: true, created: totalCreated };
}
