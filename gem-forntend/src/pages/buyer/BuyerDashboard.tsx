import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ShoppingBag, Clock, CheckCircle, Search } from "lucide-react";
import { reservationsApi, valuationsApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function BuyerDashboard() {
  const { user } = useAuthStore();

  const { data: reservations = [] } = useQuery({
    queryKey: ["buyer", "reservations"],
    queryFn: () => reservationsApi.myReservations().then((r) => r.data),
  });

  const { data: valuations = [] } = useQuery({
    queryKey: ["buyer", "valuations"],
    queryFn: () => valuationsApi.myValuations().then((r) => r.data),
  });

  const active = reservations.filter(
    (r: { status: string }) => r.status === "active",
  ).length;
  const selected = valuations.filter(
    (v: { status: string }) => v.status === "selected",
  ).length;

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Buyer Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.fullName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Reservations",
            value: active,
            icon: <Clock className="h-5 w-5 text-yellow-600" />,
          },
          {
            label: "Bids Submitted",
            value: valuations.length,
            icon: <ShoppingBag className="h-5 w-5 text-primary" />,
          },
          {
            label: "Bids Selected",
            value: selected,
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              {s.icon}
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Browse Gems</p>
              <Link to="/gems" className="text-xs text-primary hover:underline">
                View all listings
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Recent Reservations</h2>
            <Link to="/buyer/reservations">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {reservations.slice(0, 3).map((r: Record<string, unknown>) => (
              <Card key={r.id as string}>
                <CardContent className="p-3 flex items-center gap-3">
                  <img
                    src={
                      ((r.gem as Record<string, unknown>)
                        ?.primaryImage as string) || "/placeholder.svg"
                    }
                    alt=""
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {(r.gem as Record<string, unknown>)?.title as string}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires {formatDate(r.expiresAt as string)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${r.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
                  >
                    {r.status as string}
                  </span>
                </CardContent>
              </Card>
            ))}
            {reservations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No reservations yet.{" "}
                <Link to="/gems" className="text-primary hover:underline">
                  Browse gems
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Recent Bids */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Recent Bids</h2>
            <Link to="/buyer/bids">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {valuations.slice(0, 3).map((v: Record<string, unknown>) => (
              <Card
                key={v.id as string}
                className={v.status === "selected" ? "border-green-500" : ""}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {(v.gem as Record<string, unknown>)?.title as string}
                    </p>
                    <p className="text-primary text-sm font-semibold">
                      {formatCurrency(v.offeredPrice as number)}
                    </p>
                  </div>
                  {v.status === "selected" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      Selected!
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
            {valuations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No bids submitted yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
