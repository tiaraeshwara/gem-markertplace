import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface GemImage {
  id?: string;
  url: string;
  isPrimary?: boolean;
  order?: number;
}

interface GemGalleryProps {
  images: GemImage[];
  title: string;
}

export default function GemGallery({ images, title }: GemGalleryProps) {
  const sorted = [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length)
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        No images
      </div>
    );

  const prev = () => setSelected((s) => (s === 0 ? sorted.length - 1 : s - 1));
  const next = () => setSelected((s) => (s === sorted.length - 1 ? 0 : s + 1));

  return (
    <div>
      {/* Main image */}
      <div
        className="aspect-square relative rounded-lg overflow-hidden bg-muted cursor-zoom-in group"
        onClick={() => setLightbox(true)}
      >
        <img
          src={sorted[selected]?.url}
          alt={`${title} - view ${selected + 1}`}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {sorted.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {sorted.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelected(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                selected === idx ? "border-primary" : "border-transparent"
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightbox(false)}
          >
            <X className="h-8 w-8" />
          </button>
          {sorted.length > 1 && (
            <button
              className="absolute left-4 text-white hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}
          <img
            src={sorted[selected]?.url}
            alt={title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {sorted.length > 1 && (
            <button
              className="absolute right-4 text-white hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          )}
          <div className="absolute bottom-4 text-white text-sm">
            {selected + 1} / {sorted.length}
          </div>
        </div>
      )}
    </div>
  );
}
