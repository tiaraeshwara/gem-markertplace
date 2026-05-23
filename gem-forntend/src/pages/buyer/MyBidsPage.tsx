import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle, MessageSquare } from "lucide-react";
import { valuationsApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MyBidsPage() {
  const { data: valuations = [], isLoading } = useQuery({
    queryKey: ["buyer", "valuations"],
    queryFn: () => valuationsApi.myValuations().then((r) => r.data),
  });

  if (isLoading)
    return (
      <div className="container py-8">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Bids</h1>

      {valuations.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <p className="text-lg">No bids yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Reserve a gem and submit your valuation
          </p>
          <Link to="/gems" className="mt-4 inline-block">
            <Button>Browse Gems</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {valuations.map((v: Record<string, unknown>) => {
            const gem = v.gem as Record<string, unknown>;
            const isSelected = v.status === "selected";
            return (
              <Card
                key={v.id as string}
                className={
                  isSelected
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : ""
                }
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <Link to={`/gems/${gem?.id as string}`}>
                    <img
                      src={
                        ((gem?.primaryImage as Record<string, unknown>)
                          ?.url as string) || "/placeholder.svg"
                      }
                      alt={gem?.title as string}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/gems/${gem?.id as string}`}
                      className="font-semibold hover:text-primary"
                    >
                      {gem?.title as string}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-bold">
                        {formatCurrency(v.offeredPrice as number)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        your offer
                      </span>
                    </div>
                    {v.message && (
                      <p className="text-sm text-muted-foreground italic mt-1">
                        "{v.message as string}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {formatDate(v.createdAt as string)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isSelected && (
                      <>
                        <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
                          <CheckCircle className="h-3 w-3" /> Selected!
                        </span>
                        <Link to="/chat">
                          <Button size="sm" className="gap-1">
                            <MessageSquare className="h-3 w-3" /> Chat
                          </Button>
                        </Link>
                      </>
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
