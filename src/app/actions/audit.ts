"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Log an audit event. Called from server actions after mutations.
 * Silently fails — audit should never block a user action.
 */
export async function logAuditEvent(params: {
  organization_id: string;
  user_id: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "CERTIFY" | "VOID" | "BULK_DELETE" | "BULK_UPDATE";
  entity_type: string;
  entity_id?: string | null;
  description?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const supabase = await createClient();
    await supabase.from("audit_logs").insert({
      organization_id: params.organization_id,
      user_id: params.user_id,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id ?? null,
      details: {
        description: params.description ?? null,
        ...(params.metadata ?? {}),
      },
    });
  } catch {
    // Silently fail — audit logging should never block the main action
  }
}
