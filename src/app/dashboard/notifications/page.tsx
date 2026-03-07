import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";
import { NotificationsClient } from "@/components/dashboard/notifications-client";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const unreadCount = (notifications || []).filter((n: any) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">
            Alertas de vencimientos, aprobaciones y actividad
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">{unreadCount} sin leer</Badge>
            )}
          </p>
        </div>
      </div>

      <NotificationsClient notifications={notifications || []} />
    </div>
  );
}
