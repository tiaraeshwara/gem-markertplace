import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { chatApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

export default function ChatInboxPage() {
  const { user } = useAuthStore();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["chat", "rooms"],
    queryFn: () => chatApi.getRooms().then((r) => r.data),
  });

  if (isLoading)
    return (
      <div className="container py-8">
        <p>Loading chats...</p>
      </div>
    );

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {rooms.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg">No conversations yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Chats appear when a buyer's bid is selected
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room: Record<string, unknown>) => {
            const other =
              user?.role === "buyer"
                ? (room.seller as Record<string, unknown>)
                : (room.buyer as Record<string, unknown>);
            const lastMsg = room.lastMessage as Record<string, unknown> | null;
            const unread = (room.unreadCount as number) || 0;

            return (
              <Link key={room.id as string} to={`/chat/${room.id as string}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                      {((other?.fullName as string) || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {other?.fullName as string}
                        </p>
                        {lastMsg && (
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(lastMsg.createdAt as string)}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMsg
                          ? (lastMsg.content as string)
                          : `Re: ${(room.gem as Record<string, unknown>)?.title as string}`}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
