import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Send, Users } from "lucide-react";
import { gemsApi } from "@/api";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  GEM_STATUS_LABELS,
  GEM_STATUS_COLORS,
} from "@/lib/utils";

export default function MyGemsPage() {
  const qc = useQueryClient();

  const { data: gems = [], isLoading } = useQuery({
    queryKey: ["seller", "gems"],
    queryFn: () => gemsApi.myGems().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gemsApi.delete(id),
    onSuccess: () => {
      toast({ title: "Deleted", description: "Listing removed." });
      qc.invalidateQueries({ queryKey: ["seller", "gems"] });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Could not delete listing.",
        variant: "destructive",
      }),
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => gemsApi.submitForReview(id),
    onSuccess: () => {
      toast({ title: "Submitted", description: "Under review by admin." });
      qc.invalidateQueries({ queryKey: ["seller", "gems"] });
    },
  });

  if (isLoading)
    return (
      <div className="container py-8">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Link to="/seller/gems/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Listing
          </Button>
        </Link>
      </div>

      {gems.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/30">
          <p className="text-lg">No listings</p>
          <Link to="/seller/gems/new" className="mt-4 inline-block">
            <Button>Create Your First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {gems.map((gem: Record<string, unknown>) => (
            <Card key={gem.id as string}>
              <CardContent className="p-4 flex items-center gap-4">
                <img
                  src={
                    ((gem.primaryImage as Record<string, unknown>)
                      ?.url as string) || "/placeholder.svg"
                  }
                  alt={gem.title as string}
                  className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {gem.title as string}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {gem.category as string} • {gem.weightCarats as number}ct
                  </p>
                  <p className="text-primary font-medium">
                    {formatCurrency(gem.askingPrice as number)}
                  </p>
                </div>
                <Badge
                  className={GEM_STATUS_COLORS[gem.status as string] || ""}
                >
                  {GEM_STATUS_LABELS[gem.status as string] ||
                    (gem.status as string)}
                </Badge>
                <div className="flex gap-1 flex-shrink-0">
                  {gem.status === "draft" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => submitMutation.mutate(gem.id as string)}
                      disabled={submitMutation.isPending}
                    >
                      <Send className="h-3 w-3" /> Submit
                    </Button>
                  )}
                  <Link to={`/seller/gems/${gem.id}/edit`}>
                    <Button size="icon" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to={`/seller/gems/${gem.id}/bids`}>
                    <Button size="icon" variant="ghost">
                      <Users className="h-4 w-4" />
                    </Button>
                  </Link>
                  {(gem.status === "draft" || gem.status === "rejected") && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm("Delete this listing?"))
                          deleteMutation.mutate(gem.id as string);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
