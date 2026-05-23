import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { gemsApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GemCard from "@/components/gems/GemCard";
import { GEM_STATUS_LABELS } from "@/lib/utils";

export default function SellerDashboard() {
  const { user } = useAuthStore();
  const { data: gems = [], isLoading } = useQuery({
    queryKey: ["seller", "gems"],
    queryFn: () => gemsApi.myGems().then((r) => r.data),
  });

  const stats = {
    total: gems.length,
    draft: gems.filter((g: { status: string }) => g.status === "draft").length,
    pending: gems.filter(
      (g: { status: string }) => g.status === "pending_review",
    ).length,
    approved: gems.filter((g: { status: string }) => g.status === "approved")
      .length,
    rejected: gems.filter((g: { status: string }) => g.status === "rejected")
      .length,
    sold: gems.filter((g: { status: string }) => g.status === "sold").length,
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName}
          </p>
        </div>
        <Link to="/seller/gems/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Listing
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            label: "Total",
            value: stats.total,
            icon: <Package className="h-5 w-5" />,
            color: "text-foreground",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: <Clock className="h-5 w-5" />,
            color: "text-yellow-600",
          },
          {
            label: "Approved",
            value: stats.approved,
            icon: <CheckCircle className="h-5 w-5" />,
            color: "text-green-600",
          },
          {
            label: "Rejected",
            value: stats.rejected,
            icon: <XCircle className="h-5 w-5" />,
            color: "text-red-600",
          },
          {
            label: "Sold",
            value: stats.sold,
            icon: <TrendingUp className="h-5 w-5" />,
            color: "text-primary",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={s.color}>{s.icon}</div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Listings */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Listings</h2>
          <Link to="/seller/gems">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : gems.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-muted/30">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No listings yet</p>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first gem listing
            </p>
            <Link to="/seller/gems/new">
              <Button>Create Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {gems.slice(0, 10).map((gem: Record<string, unknown>) => (
              <GemCard
                key={gem.id as string}
                gem={gem as Parameters<typeof GemCard>[0]["gem"]}
                showStatus
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
