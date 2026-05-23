import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Gem,
  ShieldCheck,
  MessageCircle,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GemCard from "@/components/gems/GemCard";
import { gemsApi } from "@/api";

export default function LandingPage() {
  const { data } = useQuery({
    queryKey: ["gems", "featured"],
    queryFn: () =>
      gemsApi.list({ limit: 6, sort: "newest" }).then((r) => r.data),
  });

  const features = [
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Verified Listings",
      desc: "Every gem is reviewed and approved by our admin team before going live.",
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: "Competitive Bidding",
      desc: "Submit your valuation price and let sellers pick the best offer.",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: "Direct Chat",
      desc: "Once selected, communicate directly with the seller via secure chat.",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-950">
        <div className="container py-24 text-center space-y-6">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
              <Gem className="h-4 w-4" />
              The Premium Gemstone Marketplace
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Buy & Sell <span className="text-primary">Verified</span>{" "}
            <br className="hidden md:block" />
            Precious Gemstones
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            GemVault connects verified gem sellers with serious buyers. Browse
            certified gemstones, submit valuations, and close deals through our
            secure platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/gems">
              <Button size="lg" className="gap-2">
                Browse Gems <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/register?role=seller">
              <Button size="lg" variant="outline">
                List Your Gem
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why GemVault?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="text-center space-y-4 p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center">{f.icon}</div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Listings */}
      {data?.gems?.length > 0 && (
        <section className="container pb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Latest Gems</h2>
            <Link to="/gems">
              <Button variant="outline" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.gems.map((gem: Record<string, unknown>) => (
              <GemCard
                key={gem.id as string}
                gem={gem as Parameters<typeof GemCard>[0]["gem"]}
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to Start?</h2>
          <p className="opacity-90">
            Join thousands of gem enthusiasts on GemVault
          </p>
          <Link to="/auth/register">
            <Button size="lg" variant="secondary">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
