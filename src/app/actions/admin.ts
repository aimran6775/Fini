"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient, ADMIN_EMAIL } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ─── Auth Guard ────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }
  return createAdminClient();
}

// ─── Dashboard Stats ───────────────────────────────────────────

export async function getAdminDashboardStats() {
  const db = await requireAdmin();

  const [
    { count: orgCount },
    { count: userCount },
    { count: invoiceCount },
    { count: expenseCount },
    { count: employeeCount },
    { count: contactCount },
    { count: bankAccountCount },
    { count: journalCount },
    { count: payrollCount },
    { count: taxCount },
    { count: notifCount },
    { count: auditCount },
  ] = await Promise.all([
    db.from("organizations").select("*", { count: "exact", head: true }),
    db.from("user_profiles").select("*", { count: "exact", head: true }),
    db.from("fel_invoices").select("*", { count: "exact", head: true }),
    db.from("expenses").select("*", { count: "exact", head: true }),
    db.from("employees").select("*", { count: "exact", head: true }),
    db.from("contacts").select("*", { count: "exact", head: true }),
    db.from("bank_accounts").select("*", { count: "exact", head: true }),
    db.from("journal_entries").select("*", { count: "exact", head: true }),
    db.from("payroll_runs").select("*", { count: "exact", head: true }),
    db.from("tax_filings").select("*", { count: "exact", head: true }),
    db.from("notifications").select("*", { count: "exact", head: true }),
    db.from("audit_logs").select("*", { count: "exact", head: true }),
  ]);

  // Recent revenue
  const { data: recentInvoices } = await db
    .from("fel_invoices")
    .select("total, status")
    .in("status", ["AUTHORIZED", "CERTIFIED"]);

  const totalRevenue = recentInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) ?? 0;

  const { data: recentExpenses } = await db
    .from("expenses")
    .select("amount, status")
    .eq("status", "APPROVED");

  const totalExpenses = recentExpenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) ?? 0;

  return {
    orgCount: orgCount ?? 0,
    userCount: userCount ?? 0,
    invoiceCount: invoiceCount ?? 0,
    expenseCount: expenseCount ?? 0,
    employeeCount: employeeCount ?? 0,
    contactCount: contactCount ?? 0,
    bankAccountCount: bankAccountCount ?? 0,
    journalCount: journalCount ?? 0,
    payrollCount: payrollCount ?? 0,
    taxCount: taxCount ?? 0,
    notifCount: notifCount ?? 0,
    auditCount: auditCount ?? 0,
    totalRevenue,
    totalExpenses,
  };
}

// ─── Generic List / Get / Delete ───────────────────────────────

export async function adminListTable(
  table: string,
  options?: { limit?: number; offset?: number; orderBy?: string; ascending?: boolean; search?: string; searchColumn?: string; filters?: Record<string, string> }
) {
  const db = await requireAdmin();
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  const orderBy = options?.orderBy ?? "created_at";
  const ascending = options?.ascending ?? false;

  let query = db.from(table).select("*", { count: "exact" });

  // Apply filters
  if (options?.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value) query = query.eq(key, value);
    }
  }

  // Apply search
  if (options?.search && options?.searchColumn) {
    query = query.ilike(options.searchColumn, `%${options.search}%`);
  }

  query = query.order(orderBy, { ascending }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data ?? [], count: count ?? 0, error: null };
}

export async function adminGetRow(table: string, id: string) {
  const db = await requireAdmin();
  const { data, error } = await db.from(table).select("*").eq("id", id).single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function adminDeleteRow(table: string, id: string) {
  const db = await requireAdmin();
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { error: null };
}

export async function adminUpdateRow(table: string, id: string, updates: Record<string, unknown>) {
  const db = await requireAdmin();
  const { error } = await db.from(table).update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { error: null };
}

export async function adminInsertRow(table: string, row: Record<string, unknown>) {
  const db = await requireAdmin();
  const { data, error } = await db.from(table).insert(row).select().single();
  if (error) return { data: null, error: error.message };
  revalidatePath("/admin");
  return { data, error: null };
}

// ─── Recent Activity ───────────────────────────────────────────

export async function getRecentActivity() {
  const db = await requireAdmin();

  const [
    { data: recentInvoices },
    { data: recentExpenses },
    { data: recentAudit },
    { data: recentOrgs },
  ] = await Promise.all([
    db.from("fel_invoices").select("id, client_name, total, status, created_at").order("created_at", { ascending: false }).limit(5),
    db.from("expenses").select("id, description, amount, status, created_at").order("created_at", { ascending: false }).limit(5),
    db.from("audit_logs").select("id, action, entity_type, created_at").order("created_at", { ascending: false }).limit(10),
    db.from("organizations").select("id, name, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  return {
    recentInvoices: recentInvoices ?? [],
    recentExpenses: recentExpenses ?? [],
    recentAudit: recentAudit ?? [],
    recentOrgs: recentOrgs ?? [],
  };
}

// ─── Supabase Auth Users (via admin API) ────────────────────────

export async function listAuthUsers() {
  const db = await requireAdmin();
  const { data, error } = await db.auth.admin.listUsers();
  if (error) return { users: [], error: error.message };
  return { users: data.users ?? [], error: null };
}

export async function deleteAuthUser(userId: string) {
  const db = await requireAdmin();
  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { error: null };
}

// ─── Execute Raw SQL (dangerous but powerful) ───────────────────

export async function executeRawSQL(sql: string) {
  const db = await requireAdmin();
  const { data, error } = await db.rpc("exec_sql", { query: sql }).maybeSingle();
  // If the RPC doesn't exist, fall back to a simple info message
  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}
