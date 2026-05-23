import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { reservationsApi } from "@/api";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function ReservationsPage() {
  const qc = useQueryClient();

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["buyer", "reservations"],
    queryFn: () => reservationsApi.myReservations().then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: () => {
      toast({ title: "Cancelled", description: "Reservation cancelled." });
      qc.invalidateQueries({ queryKey: ["buyer", "reservations"] });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Could not cancel.",
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
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Reservations</h1>

      {reservations.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <p className="text-lg">No reservations yet</p>
          <Link to="/gems" className="mt-4 inline-block">
            <Button>Browse Gems</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r: Record<string, unknown>) => {
            const gem = r.gem as Record<string, unknown>;
            const isActive = r.status === "active";
            const isExpired = new Date(r.expiresAt as string) < new Date();
            return (
              <Card key={r.id as string}>
                <CardContent className="p-4 flex items-start gap-4">
                  <Link to={`/gems/${gem.id as string}`}>
                    <img
                      src={
                        ((gem.primaryImage as Record<string, unknown>)
                          ?.url as string) || "/placeholder.svg"
                      }
                      alt={gem.title as string}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/gems/${gem.id as string}`}
                      className="font-semibold hover:text-primary"
                    >
                      {gem.title as string}
                    </Link>
                    <p className="text-muted-foreground text-sm">
                      {gem.category as string}
                    </p>
                    <p className="text-primary font-medium">
                      {formatCurrency(gem.askingPrice as number)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isActive
                        ? `Expires ${formatDate(r.expiresAt as string)}`
                        : `Expired ${formatDate(r.expiresAt as string)}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={isActive && !isExpired ? "default" : "secondary"}
                    >
                      {r.status as string}
                    </Badge>
                    {isActive && !isExpired && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm("Cancel this reservation?"))
                            cancelMutation.mutate(r.id as string);
                        }}
                        disabled={cancelMutation.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
