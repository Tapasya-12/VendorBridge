import React from "react";
import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck, Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const TYPE_COLORS: Record<string, string> = {
  general: "bg-gray-100 text-gray-700",
  approval: "bg-yellow-100 text-yellow-800",
  rfq: "bg-blue-100 text-blue-800",
  invoice: "bg-orange-100 text-orange-800",
  purchase_order: "bg-purple-100 text-purple-800",
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading, isError } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const handleMarkRead = async (id: number) => {
    await markRead.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
  };

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync();
    queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up."}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead} disabled={markAllRead.isPending} data-testid="btn-mark-all-read">
            <CheckCheck className="mr-2 h-4 w-4" /> Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-border/50"><CardContent className="py-4 flex gap-3"><Skeleton className="h-2 w-2 rounded-full flex-shrink-0 mt-2" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/2" /></div></CardContent></Card>
          ))
        ) : isError ? (
          <p className="text-center text-destructive py-12">Failed to load notifications.</p>
        ) : !notifications?.length ? (
          <Card className="border-border/50">
            <CardContent className="py-16 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium">No notifications</p>
              <p className="text-sm text-muted-foreground mt-1">You're all caught up.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((n, idx) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
            >
              <Card className={`border-border/50 transition-colors ${!n.isRead ? "bg-primary/3 border-primary/20" : ""}`}>
                <CardContent className="py-4 flex items-start gap-3">
                  <div className="mt-1.5 flex-shrink-0">
                    {n.isRead
                      ? <Circle className="h-2 w-2 text-muted-foreground/40 fill-muted-foreground/20" />
                      : <Circle className="h-2 w-2 text-primary fill-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</span>
                      <Badge variant="outline" className={`border-0 text-xs capitalize ${TYPE_COLORS[n.type] ?? "bg-gray-100 text-gray-700"}`}>
                        {n.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.isRead && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)} disabled={markRead.isPending} data-testid={`btn-mark-read-${n.id}`}>
                      Mark Read
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
