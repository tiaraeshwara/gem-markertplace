import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users,
  Package,
  Clock,
  CheckCircle,
  ShoppingCart,
  MessageSquare,
} from "lucide-react";
import { adminApi } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.getStats().then((r) => r.data),
  });

  const cards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: <Users className="h-5 w-5 text-blue-600" />,
        },
        {
          label: "Total Listings",
          value: stats.totalGems,
          icon: <Package className="h-5 w-5 text-purple-600" />,
        },
        {
          label: "Pending Review",
          value: stats.pendingGems,
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          link: "/admin/reviews",
        },
        {
          label: "Approved",
          value: stats.approvedGems,
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        },
        {
          label: "Sold",
          value: stats.soldGems,
          icon: <ShoppingCart className="h-5 w-5 text-primary" />,
        },
        {
          label: "Active Chats",
          value: stats.activeChats,
          icon: <MessageSquare className="h-5 w-5 text-cyan-600" />,
        },
      ]
    : [];

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <Card
            key={c.label}
            className={
              c.link ? "border-yellow-300 cursor-pointer hover:shadow-md" : ""
            }
          >
            <CardContent className="p-4 space-y-2">
              {c.icon}
              <p className="text-2xl font-bold">{c.value ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              {c.link && (
                <Link
                  to={c.link}
                  className="text-xs text-primary hover:underline"
                >
                  Review →
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/admin/reviews">
              <Button className="w-full gap-2">
                <Clock className="h-4 w-4" /> Review Pending (
                {stats?.pendingGems ?? 0})
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/admin/users">
              <Button variant="outline" className="w-full gap-2">
                <Users className="h-4 w-4" /> Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Gems</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/admin/gems">
              <Button variant="outline" className="w-full gap-2">
                <Package className="h-4 w-4" /> View All Gems
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats?.recentListings?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Listings</h2>
          <div className="space-y-2">
            {stats.recentListings
              .slice(0, 5)
              .map((gem: Record<string, unknown>) => (
                <div
                  key={gem.id as string}
                  className="flex items-center gap-3 p-3 border rounded-md"
                >
                  <span className="font-medium">{gem.title as string}</span>
                  <span className="text-muted-foreground text-sm">
                    {gem.category as string}
                  </span>
                  <span
                    className={`ml-auto text-xs px-2 py-1 rounded-full ${gem.status === "pending_review" ? "bg-yellow-100 text-yellow-700" : "bg-muted text-muted-foreground"}`}
                  >
                    {gem.status as string}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(gem.createdAt as string)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
