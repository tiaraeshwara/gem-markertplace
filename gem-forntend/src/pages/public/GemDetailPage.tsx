import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, MessageSquare } from "lucide-react";
import { gemsApi, reservationsApi, valuationsApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import GemGallery from "@/components/gems/GemGallery";
import GemSpecSheet from "@/components/gems/GemSpecSheet";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function GemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  const [offeredPrice, setOfferedPrice] = useState("");
  const [message, setMessage] = useState("");

  const { data: gem, isLoading } = useQuery({
    queryKey: ["gem", id],
    queryFn: () => gemsApi.getOne(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: reservations } = useQuery({
    queryKey: ["reservations", "gem", id],
    queryFn: () =>
      reservationsApi.getBuyerReservations
        ? reservationsApi.myReservations().then((r) => r.data)
        : Promise.resolve([]),
    enabled: isAuthenticated && user?.role === "buyer",
  });

  const myReservation = reservations?.find(
    (r: { gem: { id: string }; status: string }) =>
      r.gem?.id === id && r.status === "active",
  );

  const reserveMutation = useMutation({
    mutationFn: () => reservationsApi.create(id!),
    onSuccess: () => {
      toast({ title: "Reserved!", description: "Gem reserved for 24 hours." });
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to reserve";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const valuationMutation = useMutation({
    mutationFn: () =>
      valuationsApi.submit(id!, {
        reservationId: myReservation.id,
        offeredPrice: parseFloat(offeredPrice),
        message: message || undefined,
      }),
    onSuccess: () => {
      toast({
        title: "Valuation submitted!",
        description: "The seller will review your offer.",
      });
      setOfferedPrice("");
      setMessage("");
      qc.invalidateQueries({ queryKey: ["gem", id] });
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to submit valuation";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  if (isLoading)
    return (
      <div className="container py-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );

  if (!gem)
    return (
      <div className="container py-20 text-center">
        <p className="text-lg text-muted-foreground">Gem not found</p>
        <Link to="/gems" className="text-primary hover:underline mt-2 block">
          Browse all gems
        </Link>
      </div>
    );

  return (
    <div className="container py-8">
      <Link
        to="/gems"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div>
          <GemGallery images={gem.images || []} title={gem.title} />
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold">{gem.title}</h1>
              <Badge variant="secondary">{gem.category}</Badge>
            </div>
            <p className="text-3xl font-bold text-primary mt-2">
              {formatCurrency(gem.askingPrice)}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Listed {formatDate(gem.createdAt)} by{" "}
              {gem.seller?.fullName || "Unknown Seller"}
            </p>
          </div>

          {gem.description && (
            <p className="text-muted-foreground leading-relaxed">
              {gem.description}
            </p>
          )}

          <GemSpecSheet gem={gem} />

          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              {gem._count?.reservations ?? 0} reservations
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {gem._count?.valuations ?? 0} valuations
            </span>
          </div>

          {/* Buyer Actions */}
          {isAuthenticated &&
            user?.role === "buyer" &&
            gem.status === "approved" && (
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <h3 className="font-semibold">Interested in this gem?</h3>
                {!myReservation ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Reserve this gem to submit a valuation. Reservations last
                      24 hours.
                    </p>
                    <Button
                      onClick={() => reserveMutation.mutate()}
                      disabled={reserveMutation.isPending}
                      className="w-full"
                    >
                      {reserveMutation.isPending
                        ? "Reserving..."
                        : "Reserve Gem"}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ You have an active reservation
                    </p>
                    <div>
                      <label className="text-sm font-medium block mb-1">
                        Your Offered Price (USD)
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter your price"
                        value={offeredPrice}
                        onChange={(e) => setOfferedPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">
                        Message (optional)
                      </label>
                      <Textarea
                        placeholder="Tell the seller why you want this gem..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button
                      className="w-full"
                      disabled={!offeredPrice || valuationMutation.isPending}
                      onClick={() => valuationMutation.mutate()}
                    >
                      {valuationMutation.isPending
                        ? "Submitting..."
                        : "Submit Valuation"}
                    </Button>
                  </div>
                )}
              </div>
            )}

          {!isAuthenticated && gem.status === "approved" && (
            <div className="border rounded-lg p-4 text-center space-y-3 bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Sign in to reserve this gem and submit a valuation
              </p>
              <Link to="/auth/login">
                <Button className="w-full">Sign In to Buy</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
