import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page],
    queryFn: () => adminApi.getUsers({ page }).then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleUser(id),
    onSuccess: () => {
      toast({ title: "Updated" });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Action failed.",
        variant: "destructive",
      }),
  });

  if (isLoading)
    return (
      <div className="container py-8">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="space-y-2">
        {data?.users?.map((u: Record<string, unknown>) => (
          <Card key={u.id as string}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                {((u.fullName as string) || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{u.fullName as string}</p>
                <p className="text-sm text-muted-foreground">
                  {u.email as string}
                </p>
                <p className="text-xs text-muted-foreground">
                  Joined {formatDate(u.createdAt as string)}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">
                {u.role as string}
              </Badge>
              <Badge variant={u.isActive ? "default" : "secondary"}>
                {u.isActive ? "Active" : "Suspended"}
              </Badge>
              {(u.role as string) !== "admin" && (
                <Button
                  size="sm"
                  variant={u.isActive ? "destructive" : "default"}
                  onClick={() => {
                    if (
                      confirm(
                        `${u.isActive ? "Suspend" : "Activate"} this user?`,
                      )
                    )
                      toggleMutation.mutate(u.id as string);
                  }}
                  disabled={toggleMutation.isPending}
                >
                  {u.isActive ? "Suspend" : "Activate"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
