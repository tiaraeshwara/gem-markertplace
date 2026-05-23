import { Link } from "react-router-dom";
import {
  formatCurrency,
  formatDate,
  GEM_STATUS_LABELS,
  GEM_STATUS_COLORS,
  cn,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Gem as GemIcon } from "lucide-react";

interface GemImage {
  url: string;
  isPrimary: boolean;
}
interface GemCardProps {
  gem: {
    id: string;
    title: string;
    category: string;
    weightCarats: number | string;
    askingPrice: number | string;
    color?: string | null;
    origin?: string | null;
    status: string;
    images?: GemImage[];
    seller?: { fullName?: string | null };
  };
  showStatus?: boolean;
}

export default function GemCard({ gem, showStatus = false }: GemCardProps) {
  const primaryImage = gem.images?.find((i) => i.isPrimary) || gem.images?.[0];

  return (
    <Link to={`/gems/${gem.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        {/* Image */}
        <div className="aspect-square relative overflow-hidden bg-muted">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={gem.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <GemIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className="bg-background/80 backdrop-blur text-foreground text-xs">
              {gem.category}
            </Badge>
          </div>
          {showStatus && (
            <div className="absolute top-2 left-2">
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  GEM_STATUS_COLORS[gem.status],
                )}
              >
                {GEM_STATUS_LABELS[gem.status]}
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {gem.title}
          </h3>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{parseFloat(String(gem.weightCarats)).toFixed(2)} ct</span>
            {gem.color && <span>{gem.color}</span>}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(gem.askingPrice)}
            </span>
            {gem.origin && (
              <span className="text-xs text-muted-foreground">
                {gem.origin}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
