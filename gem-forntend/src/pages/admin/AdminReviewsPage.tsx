import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminReviewsPage() {
  const qc = useQueryClient();

  const { data: gems = [], isLoading } = useQuery({
    queryKey: ["admin", "pending"],
    queryFn: () => adminApi.getPendingGems().then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveGem(id),
    onSuccess: () => {
      toast({ title: "Approved", description: "Gem is now live." });
      qc.invalidateQueries({ queryKey: ["admin", "pending"] });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Action failed.",
        variant: "destructive",
      }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectGem(id, reason),
    onSuccess: () => {
      toast({ title: "Rejected", description: "Seller has been notified." });
      qc.invalidateQueries({ queryKey: ["admin", "pending"] });
    },
  });

  const handleReject = (id: string) => {
    const reason = prompt("Rejection reason (visible to seller):");
    if (reason) rejectMutation.mutate({ id, reason });
  };

  if (isLoading)
    return (
      <div className="container py-8">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">
        Pending Reviews ({gems.length})
      </h1>

      {gems.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg">All caught up!</p>
          <p className="text-sm text-muted-foreground">
            No gems pending review
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {gems.map((gem: Record<string, unknown>) => (
            <Card key={gem.id as string}>
              <CardContent className="p-4 flex items-center gap-4">
                <img
                  src={
                    ((gem.primaryImage as Record<string, unknown>)
                      ?.url as string) || "/placeholder.svg"
                  }
                  alt={gem.title as string}
                  className="h-20 w-20 rounded-md object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{gem.title as string}</p>
                  <p className="text-sm text-muted-foreground">
                    {gem.category as string} • {gem.weightCarats as number}ct •{" "}
                    {formatCurrency(gem.askingPrice as number)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Seller:{" "}
                    {
                      (gem.seller as Record<string, unknown>)
                        ?.fullName as string
                    }{" "}
                    • {formatDate(gem.createdAt as string)}
                  </p>
                  {gem.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {gem.description as string}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/gems/${gem.id as string}`} target="_blank">
                    <Button size="icon" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="gap-1 bg-green-600 hover:bg-green-700"
                    onClick={() => approveMutation.mutate(gem.id as string)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    onClick={() => handleReject(gem.id as string)}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="h-4 w-4" /> Reject
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
