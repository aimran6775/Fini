"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "@/app/actions/notifications";

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

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await getNotifications();
      setNotifications(data as Notification[]);
    } catch {
      // Silently fail for bell component
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // Refresh every 60 seconds
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const recent = notifications.slice(0, 5);

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "ahora";
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-normal text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="h-3 w-3" /> Marcar todas leídas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Cargando...</div>
        ) : recent.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-2 h-8 w-8 opacity-30" />
            Sin notificaciones
          </div>
        ) : (
          <>
            {recent.map(n => (
              <DropdownMenuItem
                key={n.id}
                className={`flex flex-col items-start gap-1 py-3 ${!n.is_read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{TYPE_ICONS[n.type] || "📌"}</span>
                    <span className={`text-sm ${!n.is_read ? "font-semibold" : ""}`}>{n.title}</span>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 pl-6">{n.message}</p>
                {n.link && (
                  <span className="pl-6 text-xs text-primary flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> Ver detalle
                  </span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Link href="/dashboard/notifications" className="block">
              <DropdownMenuItem className="justify-center text-sm font-medium text-primary">
                Ver todas las notificaciones
              </DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
