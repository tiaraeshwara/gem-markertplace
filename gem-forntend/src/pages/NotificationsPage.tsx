import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { notificationsApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getAll().then((r) => r.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = notifications.filter(
    (n: { isRead: boolean }) => !n.isRead,
  ).length;

  if (isLoading)
    return (
      <div className="container py-8">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unread > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
              {unread} new
            </span>
          )}
        </div>
        {unread > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: Record<string, unknown>) => (
            <Card
              key={n.id as string}
              className={`cursor-pointer transition-colors ${!n.isRead ? "border-primary/30 bg-primary/5" : "hover:bg-muted/50"}`}
              onClick={() => {
                if (!n.isRead) markOneMutation.mutate(n.id as string);
              }}
            >
              <CardContent className="p-4 flex items-start gap-3">
                {!n.isRead && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                )}
                {n.isRead && <div className="h-2 w-2 mt-2 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${!n.isRead ? "font-medium" : "text-muted-foreground"}`}
                  >
                    {n.message as string}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(n.createdAt as string)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
