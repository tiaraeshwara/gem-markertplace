interface Gem {
  weightCarats?: number | string | null;
  color?: string | null;
  clarity?: string | null;
  cut?: string | null;
  origin?: string | null;
  treatment?: string | null;
  dimensions?: { length?: number; width?: number; depth?: number } | null;
  certificateNo?: string | null;
  certificateUrl?: string | null;
  category?: string | null;
}

export default function GemSpecSheet({ gem }: { gem: Gem }) {
  const specs = [
    { label: "Category", value: gem.category },
    {
      label: "Weight",
      value: gem.weightCarats
        ? `${parseFloat(String(gem.weightCarats)).toFixed(3)} carats`
        : null,
    },
    { label: "Color", value: gem.color },
    { label: "Clarity", value: gem.clarity },
    { label: "Cut", value: gem.cut },
    { label: "Origin", value: gem.origin },
    { label: "Treatment", value: gem.treatment },
    {
      label: "Dimensions",
      value: gem.dimensions
        ? `${gem.dimensions.length ?? "-"} × ${gem.dimensions.width ?? "-"} × ${gem.dimensions.depth ?? "-"} mm`
        : null,
    },
    { label: "Certificate No.", value: gem.certificateNo },
  ].filter((s) => s.value);

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="bg-muted px-4 py-2 font-semibold text-sm">
        Gem Specifications
      </div>
      <div className="divide-y">
        {specs.map((spec) => (
          <div key={spec.label} className="flex px-4 py-2.5 text-sm">
            <span className="w-36 text-muted-foreground font-medium flex-shrink-0">
              {spec.label}
            </span>
            <span className="font-medium">{spec.value}</span>
          </div>
        ))}
        {gem.certificateUrl && (
          <div className="flex px-4 py-2.5 text-sm">
            <span className="w-36 text-muted-foreground font-medium flex-shrink-0">
              Certificate
            </span>
            <a
              href={gem.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              View Certificate
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
