import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import { valuationsApi } from "@/api";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function GemBidsPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: valuations = [], isLoading } = useQuery({
    queryKey: ["valuations", "gem", id],
    queryFn: () => valuationsApi.getGemValuations(id!).then((r) => r.data),
    enabled: !!id,
  });

  const selectMutation = useMutation({
    mutationFn: (valuationId: string) => valuationsApi.select(valuationId),
    onSuccess: () => {
      toast({
        title: "Buyer selected!",
        description: "A chat room has been created for you to communicate.",
      });
      qc.invalidateQueries({ queryKey: ["valuations", "gem", id] });
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to select";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  if (isLoading)
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Loading bids...</p>
      </div>
    );

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Received Bids</h1>
      <p className="text-muted-foreground mb-6">
        Review all valuations and select a buyer.
      </p>

      {valuations.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <p className="text-lg">No bids yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Share your listing to attract buyers
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {valuations.map((v: Record<string, unknown>) => (
            <Card
              key={v.id as string}
              className={
                v.status === "selected"
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : ""
              }
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {(v.buyer as Record<string, unknown>)?.fullName as string}
                    </span>
                    {v.status === "selected" && (
                      <Badge className="bg-green-600 text-white gap-1">
                        <CheckCircle className="h-3 w-3" /> Selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(v.offeredPrice as number)}
                  </p>
                  {v.message && (
                    <p className="text-sm text-muted-foreground">
                      "{v.message as string}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDate(v.createdAt as string)}
                  </p>
                </div>
                {v.status !== "selected" &&
                  valuations.every(
                    (x: Record<string, unknown>) => x.status !== "selected",
                  ) && (
                    <Button
                      size="sm"
                      onClick={() => selectMutation.mutate(v.id as string)}
                      disabled={selectMutation.isPending}
                    >
                      Select Buyer
                    </Button>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
