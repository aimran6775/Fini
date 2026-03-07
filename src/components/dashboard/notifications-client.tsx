"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCheck, Trash2, ExternalLink, Filter } from "lucide-react";
import { markAsRead, markAllAsRead, deleteNotification } from "@/app/actions/notifications";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  tax_deadline: "🗓️",
  invoice: "🧾",
  expense: "💰",
  payroll: "👥",
  system: "⚙️",
  warning: "⚠️",
  info: "ℹ️",
};

const TYPE_LABELS: Record<string, string> = {
  tax_deadline: "Vencimiento fiscal",
  invoice: "Factura",
  expense: "Gasto",
  payroll: "Planilla",
  system: "Sistema",
  warning: "Alerta",
  info: "Información",
};

export function NotificationsClient({ notifications: initialNotifications }: { notifications: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  async function handleDelete(id: string) {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">
              Todas <Badge variant="secondary" className="ml-1 text-xs">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Sin leer <Badge variant="secondary" className="ml-1 text-xs">{unreadCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="read">Leídas</TabsTrigger>
          </TabsList>
        </Tabs>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p className="text-muted-foreground">
              {filter === "unread"
                ? "No tienes notificaciones sin leer"
                : filter === "read"
                ? "No hay notificaciones leídas"
                : "No hay notificaciones"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <Card
              key={n.id}
              className={`transition-colors ${!n.is_read ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20" : ""}`}
            >
              <CardContent className="flex items-start gap-4 py-4">
                {/* Icon */}
                <div className="mt-0.5 text-xl shrink-0">
                  {TYPE_ICONS[n.type] || "📌"}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm ${!n.is_read ? "font-semibold" : "font-medium"}`}>
                      {n.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      {TYPE_LABELS[n.type] || n.type}
                    </Badge>
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString("es-GT", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {n.link && (
                      <Link href={n.link} className="text-xs text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Ver detalle
                      </Link>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  {!n.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkRead(n.id)}
                      title="Marcar como leída"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(n.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
