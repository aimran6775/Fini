"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { refreshAllNotifications } from "@/app/actions/notifications";

interface RefreshNotificationsButtonProps {
  organizationId: string;
}

export function RefreshNotificationsButton({ organizationId }: RefreshNotificationsButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      const result = await refreshAllNotifications(organizationId);
      if (result.created && result.created > 0) {
        // Page will revalidate automatically
      }
    });
  };

  return (
    <Button variant="outline" onClick={handleRefresh} disabled={isPending}>
      {isPending ? (
        <Spinner size="sm" />
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Buscar Alertas
        </>
      )}
    </Button>
  );
}
