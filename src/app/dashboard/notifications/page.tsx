import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { NotificationsClient } from "@/components/dashboard/notifications-client";
import { RefreshNotificationsButton } from "@/components/dashboard/refresh-notifications";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false })
    .limit(100);

  const unreadCount = (notifications || []).filter((n: any) => !n.is_read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1>Notificaciones</h1>
          <p>
            Alertas de vencimientos, aprobaciones y actividad
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">{unreadCount} sin leer</Badge>
            )}
          </p>
        </div>
        {membership && (
          <RefreshNotificationsButton organizationId={membership.organization_id} />
        )}
      </div>

      <NotificationsClient notifications={notifications || []} />
    </div>
  );
}
